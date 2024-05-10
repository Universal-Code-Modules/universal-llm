'use strict';

const fs = require('node:fs');
const path = require('node:path');
const OpenAI = require('openai');
const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS, DEFAULT_VOICE } = require('../config.json');

const speech = (openai) => ({
  /*
    voices: alloy, echo, fable, onyx, nova, and shimmer
    speed:  0.25 - 4.0
    model: tts-1, tts-1-hd
    */

  async textToSpeech({
    text,
    pathToFile = './tests/test-speech.mp3',
    voice = DEFAULT_VOICE,
    speed = 1.0,
    model = DEFAULT_MODELS.textToSpeech,
  }) {
    const speechFile = path.resolve(pathToFile);
    const mp3 = await callAPI(
      openai.audio.speech,
      'openai.audio.speech.create',
      {
        input: text,
        voice,
        speed,
        model,
      },
    );
    if (mp3.error) return mp3;
    const buffer = Buffer.from(await mp3.arrayBuffer());
    await fs.promises.writeFile(speechFile, buffer);
    return buffer;
  },

  async speechToText({
    pathToFile = './tests/test-speech.mp3',
    model = DEFAULT_MODELS.speech,
  }) {
    const buffer = await fs.promises.readFile(path.resolve(pathToFile));
    const transcription = await callAPI(
      openai.audio.transcriptions,
      'openai.audio.transcriptions.create',
      {
        file: await OpenAI.toFile(buffer, path.basename(pathToFile)),
        model,
      },
    );
    if (transcription.error) return transcription;
    return transcription.text;
  },

  async speechTranslation({
    pathToFile = './tests/test-speech.mp3',
    model = DEFAULT_MODELS.speech,
  }) {
    const translation = await callAPI(
      openai.audio.translations,
      'openai.audio.translations.create',
      {
        file: fs.createReadStream(pathToFile),
        model,
      },
    );
    if (translation.error) return translation;
    return translation.text;
  },
});

module.exports = { speech };

// speech.textToSpeech({text, pathToFile, voice, model}) => buffer
// speech.speechToText({pathToFile, model}) => string
// speech.speechTranslation({pathToFile, model}) =>
// string // does not translate
