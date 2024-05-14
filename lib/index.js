'use strict';

module.exports = {
  openai: require('./openai/connector.js'),
  huggingface: require('./huggingface/connector.js'),
  ollama: require('./ollama/connector.js'),
  elevenlabs: require('./elevenlabs/connector.js'),
};
