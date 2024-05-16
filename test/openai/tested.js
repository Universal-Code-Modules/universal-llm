'use strict';

const { openai } = require('../../lib');
const { Chat } = openai;

const tested = {
  chat: new Chat({}),
  fineTune: {
    id: '',
    file: { id: '' },
  },
  model: {
    id: '',
  },
  assistant: {
    id: '',
    thread: { id: '' },
    message: { id: '' },
    run: { id: '' },
    step: { id: '' },
    file: { id: '' },
    added_file: { id: '' },
  },
};

module.exports = {
  tested,
};
