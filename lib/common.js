'use strict';

const fs = require('node:fs');
const fsp = fs.promises;
const path = require('node:path');
const { once } = require('node:events');
const readline = require('node:readline');
const { Readable } = require('node:stream');
const ffmpeg = require('fluent-ffmpeg');
const { callApiOpts } = require('../config.json');

const SEC_ON_MS = 1_000;
const MIN_ON_SEC = 60;

const compose = (...fns) => {
  const reducer = (x) => fns.reduceRight((res, f) => f(res), x);
  return reducer;
};

const measureTime = (begin) => {
  if (!begin) return performance.now();
  return Math.floor(performance.now() - begin);
};

const formatTime = (time) => {
  const seconds = Math.floor(time / SEC_ON_MS);
  if (seconds < MIN_ON_SEC) {
    return `${seconds}sec ${time - seconds * SEC_ON_MS}ms`;
  }
  const minutes = Math.floor(seconds / MIN_ON_SEC);
  const remainingSeconds = seconds % MIN_ON_SEC;
  const milliseconds = Math.floor((time - seconds * MIN_ON_SEC) / 10);
  return `${minutes}min ${remainingSeconds}sec ${milliseconds}ms`;
};

const formatMeasureTime = compose(formatTime, measureTime);

const callAPI = async (library, methodPath, ...args) => {
  const { logTime, logResult, logError } = callApiOpts;
  const methodName = methodPath.split('.').at(-1);
  const method = library[methodName];

  if (!method || typeof method !== 'function') {
    const message = `Method ${methodPath} not found`;
    return { error: new Error(message) };
  }

  const startTime = logTime ? measureTime() : 0;

  try {
    const result = await method.call(library, ...args);
    if (startTime !== 0) {
      const endTime = formatMeasureTime(startTime);
      console.log({ [methodPath]: endTime });
    }
    if (logResult) console.log(`${methodPath} result:`, result);
    return result;
  } catch (error) {
    const message = `Error occured while calling ${methodPath}`;
    if (logError) console.error(message, error);
    return { error };
  }
};

const delay = (msec) => new Promise((r) => void setTimeout(r, msec));

const random = (min, max) => Math.round(Math.random() * (max - min) + min);

const typeSizes = {
  undefined: () => 0,
  boolean: () => 4,
  number: () => 8,
  bigint: () => 8,
  string: (item) => 2 * item.length,
  object: (item = null, calcSize) => {
    if (!item) return 0;
    const totalSize = Object.keys(item).reduce((total, key) => {
      const keySize = calcSize(key);
      const valueSize = calcSize(item[key]);
      return total + keySize + valueSize;
    }, 0);
    return totalSize;
  },
};

const roughSizeOfObject = (value) => {
  const type = typeof value;
  const method = typeSizes[type];
  return method(value, roughSizeOfObject);
};

const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const baseUnits = ['kB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
const siUnits = ['KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

const humanFileSize = (bytes, si = false, dp = 1) => {
  const thresh = si ? 1000 : 1024;
  if (Math.abs(bytes) < thresh) return bytes + ' B';

  const units = si ? siUnits : baseUnits;

  let u = -1;
  const r = 10 ** dp;

  do {
    bytes /= thresh;
  } while (
    Math.round(Math.abs(bytes) * r) / r >= thresh &&
    u++ < units.length - 1
  );

  return bytes.toFixed(dp) + ' ' + units[u];
};

const extractVideoFrames = async (
  videoPath,
  outputDir,
  frameRate = 1,
  prefix = 'frame',
) =>
  new Promise((resolve, reject) => {
    const options = [
      '-vf fps=' + frameRate,
      '-q:v 15',
      // '-update 1',
    ];
    ffmpeg(videoPath)
      .outputOptions(options)
      .output(outputDir + `/${prefix}%04d.jpg`)
      .on('end', resolve)
      .on('error', reject)
      .run();
  });

const cleanDirectory = async (dir) => {
  try {
    const files = await fsp.readdir(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      await fsp.unlink(filePath);
    }
  } catch (error) {
    console.error('Error cleaning directory:', error);
  }
};

const processFileLineByLine = async (
  filePath,
  processLineCallback = null,
  finishCallback = null,
) => {
  let index = 0;
  const startMemory = process.memoryUsage().heapUsed;
  const startTime = measureTime();
  try {
    const stat = await fsp.stat(filePath);
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath),
      crlfDelay: Infinity,
    });

    rl.on('line', (line) => void processLineCallback({ line, index: index++ }));
    await once(rl, 'close');

    if (!finishCallback || typeof finishCallback !== 'function') return;
    const size = humanFileSize(stat.size, true);
    const currentMemory = process.memoryUsage().heapUsed;
    const memoryUsed = currentMemory - startMemory;
    const mb = Math.round((memoryUsed / 1024 / 1024) * 100) / 100 + ' MB';
    const endTime = formatTime(startTime);
    const result = { filePath, size, lines: index, used: mb, time: endTime };
    finishCallback(result);
  } catch (err) {
    console.error(err);
  }
};

const saveFileFromWeb = (url, path) =>
  new Promise((resolve) => {
    const ws = fs.createWriteStream(path);
    ws.on('finish', () => void resolve(Object.create(null)));
    ws.on('error', (error) => void resolve({ error }));
    fetch(url).then(
      async (res) => {
        const { ok, body, statusTest } = res;
        if (ok) return void Readable.fromWeb(body).pipe(ws);
        if (body) await body.cancel(); // https://undici.nodejs.org/#/?id=garbage-collection
        const error = new Error(`unexpected response ${statusTest}`);
        resolve({ error });
      },
      (error) => {
        ws.on('close', () => void resolve({ error }));
        ws.close();
      },
    );
  });

module.exports = {
  callAPI,
  measureTime,
  delay,
  random,
  roughSizeOfObject,
  formatBytes,
  humanFileSize,
  extractVideoFrames,
  cleanDirectory,
  processFileLineByLine,
  saveFileFromWeb,
  math: require('@dip1059/safe-math-js'),
  formatMeasureTime,
};
