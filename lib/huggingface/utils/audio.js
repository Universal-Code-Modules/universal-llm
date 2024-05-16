'use strict';

const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const defaultModels = DEFAULT_MODELS.audio;

const audio = (hf) => ({
  // data = readFileSync('test/sample1.flac')
  async automaticSpeechRecognition(
    data,
    model = defaultModels.automaticSpeechRecognition,
  ) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.automaticSpeechRecognition', args);
    return res;
  },

  // data = readFileSync('test/sample1.flac')
  async audioClassification(data, model = defaultModels.audioClassification) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.audioClassification', args);
    return res;
  },

  // inputs = 'Hello world!'

  async textToSpeech(inputs, model = defaultModels.textToSpeech) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.textToSpeech', args);
    return res;
  },

  // data = readFileSync('test/sample1.flac')
  async audioToAudio(data, model = defaultModels.audioToAudio) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.audioToAudio', args);
    return res;
  },
});

module.exports = { audio };
