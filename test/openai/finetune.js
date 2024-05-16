'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');
const { tested } = require('./tested.js');

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const FINE_TUNE = path.join(OPEN_AI_FILES, 'fine-tune');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

describe('Fine Tune Operations', () => {
  let fineTune = null;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    fineTune = utils.fineTune(chat.openai);
  });

  it('Create Fine Tune job', async () => {
    const res = await fineTune.create({
      pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
    });

    assert.ok('id' in res);
    assert.deepEqual(res.error, {});

    tested.fineTune.id = res.id;
    tested.fineTune.file.id = res.training_file;
  });

  it('Create Fine Tune from training file', async () => {
    const file_id = tested.fineTune.file.id;
    const res = await fineTune.create({
      training_file: file_id,
    });

    assert.ok('id' in res);
    assert.deepEqual(res.error, {});

    tested.fineTune.id = res.id;
  });

  it('List Fine Tune jobs', async () => {
    const res = await fineTune.list();

    assert.ok(Array.isArray(res));
  });

  it('Retrieve Fine Tune job', async () => {
    const ftJobId = tested.fineTune.id;
    const res = await fineTune.retrieve({ id: ftJobId });

    assert.ok('id' in res);
    assert.strictEqual(res.id, ftJobId);
  });
});
