'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { readFileSync } = require('node:fs');

const { huggingface } = require('../../lib');
const utils = require('../../lib/huggingface/utils');

const { Chat } = huggingface;

const API_KEY = process.env.HUGGINGFACE_API_KEY;

const { multimodal: uMultimodal } = utils;

const FILES = process.cwd() + '/files/huggingface/';
const IMAGES = FILES + 'images';

const testCatFile = readFileSync(path.join(IMAGES, 'cat.jpg'));
const testInvoiceFile = readFileSync(path.join(IMAGES, 'invoice.png'));

describe('multimodal', () => {
  let multimodal;

  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    multimodal = uMultimodal(chat.hf);
  });

  it('featureExtraction', async () => {
    const res = await multimodal.featureExtraction('That is a happy person');

    assert.ok(Array.isArray(res));
    assert.ok(res.every((el) => typeof el === 'number'));
  });

  it('visualQuestionAnswering', async () => {
    const inputs = {
      question: 'How many cats are lying down?',
      image: new Blob([testCatFile]),
    };
    const res = await multimodal.visualQuestionAnswering(inputs);

    assert.ok(typeof res === 'object');
    assert.ok('score' in res);
    assert.ok('answer' in res);
    assert.ok(typeof res.score === 'number');
    assert.strictEqual(res.answer, '1');
  });

  it('documentQuestionAnswering', async () => {
    const inputs = {
      question: 'Invoice number?',
      image: new Blob([testInvoiceFile]),
    };
    const res = await multimodal.documentQuestionAnswering(inputs);

    assert.ok(typeof res === 'object');
    assert.ok('score' in res && typeof res.score === 'number');
    assert.ok('start' in res && typeof res.start === 'number');
    assert.ok('end' in res && typeof res.end === 'number');
    assert.ok('answer' in res && typeof res.answer === 'string');
    assert.strictEqual(res.answer, 'us-001');
  });
});
