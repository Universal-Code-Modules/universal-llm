'use strict';

const { callAPI } = require('../../common.js');

const models = (openai) => ({
  async list() {
    const response = await callAPI(openai.models, 'openai.models.list');
    if (response.error) return response;
    return response.data;
    // for await (const fineTune of list) {
    //   console.log(fineTune);
    // }
  },

  async retrieve({ model_id }) {
    const response = await callAPI(
      openai.models,
      'openai.models.retrieve',
      model_id,
    );
    return response;
  },

  async del({ model_id }) {
    const response = await callAPI(
      openai.models,
      'openai.models.del',
      model_id,
    );
    return response;
  },
});

module.exports = { models };

// models.list() => response
// models.retrieve({model_id}) => response
// models.del({model_id}) => response
// model, deleteFile, maxTokens}) => response
