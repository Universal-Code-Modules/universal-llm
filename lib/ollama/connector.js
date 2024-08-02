'use strict';

const { Ollama } = require('ollama');
const { callAPI } = require('../common.js');
const { ollamaOpts } = require('../../config.json');

const { transport, host, port } = ollamaOpts;
const ollama = new Ollama({ host: `${transport}://${host}:${port}` });

// (messages = [{ role: 'user', content: 'Why is the sky blue?' }],

const completion = async (
  messages = [],
  system = 'You are a useful assistant. You can answer questions,' +
    ' provide information, and help with tasks.',
  model = 'llama2',
  stream = false,
) => {
  const res = await callAPI(ollama, 'ollama.chat', {
    messages: [
      {
        role: 'system',
        content: system,
      },
      ...messages,
    ],
    model,
    stream,
  });
  return res;
};

module.exports = {
  completion,
};
