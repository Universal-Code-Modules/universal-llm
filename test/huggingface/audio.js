'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { readFileSync } = require('node:fs');

const { huggingface } = require('../../lib');
const utils = require('../../lib/huggingface/utils');

const { Chat } = huggingface;

const API_KEY = process.env.HUGGINGFACE_API_KEY;

const {
  audio: uAudio,
} = utils;

const FILES = process.cwd() + '/files/huggingface/';
const AUDIOS = FILES + 'audios';

const testAudioFile = readFileSync(path.join(AUDIOS, 'speech.mp3'));

describe('audio', () => {
  let audio;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    audio = uAudio(chat.hf);
  });

  it('automaticSpeechRecognition', async () => {
    const res = await audio.automaticSpeechRecognition(testAudioFile);

    console.log(res);
    assert.ok(typeof res === 'object');
    assert.ok('text' in res);
    assert.ok(typeof res.text === 'string');
  });

  it('audioClassification', async () => {
    const res = await audio.audioClassification(testAudioFile);

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('label' in item);
      assert.ok('score' in item);
    }
  });

  it('textToSpeech', async () => {
    const res = await audio.textToSpeech('Hello world!');

    assert.ok(res instanceof Blob);
    assert.ok(typeof res.size === 'number');
    assert.strictEqual(res.type, 'audio/flac');
  });

  // TODO: fix test, getting an error "interface not in config.json"
  it.skip('audioToAudio', async () => {
    const res = await audio.audioToAudio(testAudioFile);

    console.log(res);
  });
});
