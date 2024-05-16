'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { openai } = require('../../lib');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const AUDIOS = path.join(OPEN_AI_FILES, 'audios');

describe('Chat Operations', () => {
  let chat = null;
  beforeEach(() => {
    chat = new Chat({ apiKey: API_KEY });
  });

  it('Chat message', async () => {
    const res = await chat.message({ text: 'Hello' });

    assert.strictEqual(typeof res, 'string');
  });

  it('Chat voice message', async () => {
    const res = await chat.voiceMessage({
      inputFilePath: AUDIOS + '/test-speech-input-en.mp3',
      outputFilePath: AUDIOS + '/my_test-speech-output-en.mp3',
      returnIntermediateResult: false,
    });

    assert.ok('inputText' in res);
    assert.strictEqual(res.inputText, 'Hello there.');
    assert.ok('outputText' in res);
    assert.ok('outputFilePath' in res);
  });
});
