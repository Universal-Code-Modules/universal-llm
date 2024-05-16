'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const IMAGES = path.join(OPEN_AI_FILES, 'images');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

describe('Recognition Operations', () => {
  let recognition = null;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    recognition = utils.recognition(chat.openai);
  });

  it('Image Recognition', async () => {
    const pathToFile = IMAGES + '/test-image.jpg';
    const res = await recognition.image({ pathToFile });

    assert.ok('message' in res);
    assert.ok('usage' in res);
  });
});
