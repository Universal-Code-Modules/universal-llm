'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { readFileSync } = require('node:fs');

const { huggingface } = require('../../lib');
const utils = require('../../lib/huggingface/utils');

const { Chat } = huggingface;

const API_KEY = process.env.HUGGINGFACE_API_KEY;

const { computerVision: uComputerVision } = utils;

const FILES = process.cwd() + '/files/huggingface/';
const IMAGES = FILES + 'images';

const testCatFile = readFileSync(path.join(IMAGES, 'cat.jpg'));
const testSeeFile = readFileSync(path.join(IMAGES, 'see.jpeg'));

describe('computerVision', () => {
  let computerVision;

  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    computerVision = uComputerVision(chat.hf);
  });

  it('imageClassification', async () => {
    const res = await computerVision.imageClassification(testCatFile);

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('label' in item);
      assert.ok('score' in item);
    }
  });

  it('objectDetection', async () => {
    const res = await computerVision.objectDetection(testCatFile);

    assert.ok(Array.isArray(res));
    assert.ok(res.length === 1);

    const [item] = res;

    assert.ok(typeof item === 'object');
    assert.ok('box' in item);
    assert.ok('label' in item);
    assert.ok('score' in item);
    assert.ok(typeof item.box === 'object');
    assert.ok(typeof item.label === 'string');
    assert.ok(typeof item.score === 'number');
    assert.strictEqual(item.label, 'cat');

    const { box } = item;

    assert.ok(typeof box === 'object');
    assert.ok(typeof box.xmin === 'number');
    assert.ok(typeof box.ymin === 'number');
    assert.ok(typeof box.xmax === 'number');
    assert.ok(typeof box.ymax === 'number');
  });

  it('imageSegmentation', async () => {
    const res = await computerVision.imageSegmentation(testCatFile);

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('score' in item);
      assert.ok('label' in item);
      assert.ok('mask' in item);
    }
  });

  it('imageToText', async () => {
    const res = await computerVision.imageToText(testCatFile);

    assert.ok(typeof res === 'object');
    assert.ok('generated_text' in res);
    assert.ok(typeof res.generated_text === 'string');
  });

  it('textToImage', async () => {
    const inputs =
      'award winning high resolution photo of a giant tortoise' +
      '/((ladybird)) hybrid, [trending on artstation]';
    const res = await computerVision.textToImage(inputs, {
      negative_prompt: 'blurry',
    });

    assert.ok(res instanceof Blob);
    assert.ok(typeof res.size === 'number');
    assert.ok(res.type === 'image/jpeg');
  });

  it('imageToImage', async () => {
    const res = await computerVision.imageToImage(new Blob([testSeeFile]), {
      prompt: 'test picture',
    });

    assert.ok(res instanceof Blob);
    assert.ok(typeof res.size === 'number');
    assert.ok(res.type === 'image/jpeg');
  });

  it('ZeroShotImageClassification', async () => {
    const inputs = { image: new Blob([testCatFile]) };
    const res = await computerVision.zeroShotImageClassification(inputs, {
      candidate_labels: ['cat', 'dog'],
    });

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('score' in item);
      assert.ok('label' in item);
    }
  });
});
