'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const fs = require('node:fs/promises');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');
const common = require('../../lib/common.js');

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const AUDIOS = path.join(OPEN_AI_FILES, 'audios');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

describe('Speech Operations', () => {
  let speech = null;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    speech = utils.speech(chat.openai);
  });

  it('textToSpeech', async () => {
    const pathToFile = AUDIOS + '/my_test-speech-output-en.mp3';

    const isExist = await common.fileIsExist(pathToFile);

    if (isExist) {
      try {
        await fs.unlink(pathToFile);
      } catch (err) {
        assert.fail(err);
      }
    }

    const res = await speech.textToSpeech({
      text: 'Hello, how can I help you?',
      pathToFile,
    });
    const stat = await fs.stat(pathToFile);

    assert.ok(Buffer.isBuffer(res));
    assert.ok('uid' in stat);
  });

  it('speechToText', async () => {
    const pathToFile = AUDIOS + '/test-speech-input-en.mp3';
    const res = await speech.speechToText({ pathToFile });

    assert.strictEqual(typeof res, 'string');
  });

  it('Speech Translation', async () => {
    const pathToFile = AUDIOS + '/test-speech-input-ru.mp3';
    const res = await speech.speechTranslation({ pathToFile });

    assert.strictEqual(typeof res, 'string');
  });
});
