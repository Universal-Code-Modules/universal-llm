'use strict';

const fs = require('node:fs');
const { callAPI, processFileLineByLine } = require('../../common.js');
const { tokens } = require('./tokens.js');
const { DEFAULT_MODELS } = require('../config.json');

const files = (openai) => ({
  async countFileTokens({ pathToFile, model = DEFAULT_MODELS.completions }) {
    let tokensNumber = 0;
    await processFileLineByLine(
      pathToFile,
      ({ line }) => void (tokensNumber += tokens.count({ text: line, model })),
      console.log,
    );
    return tokensNumber;
  },

  async create({ pathToFile, purpose = 'fine-tune' }) {
    // purposes = "fine-tune", "assistants"
    const response = await callAPI(openai.files, 'openai.files.create', {
      file: fs.createReadStream(pathToFile),
      purpose,
    });
    return response;
  },

  async list() {
    const response = await callAPI(openai.files, 'openai.files.list');
    if (response.error) return response;
    return response.data;
  },

  async retrieve({ file_id }) {
    const response = await callAPI(
      openai.files,
      'openai.files.retrieve',
      file_id,
    );
    return response;
  },

  async content({ file_id }) {
    const file = await callAPI(
      openai.files,
      'openai.files.retrieveContent',
      file_id,
    );
    return file;
  },

  async del({ file_id }) {
    const file = await callAPI(openai.files, 'openai.files.del', file_id);
    return file;
  },
});

module.exports = { files };

// files.create({pathToFile, purpose}) => response
// files.list() => data (array)
// files.retrieve({file_id}) => response
// files.content({file_id}) => response
// files.del({file_id}) => response
