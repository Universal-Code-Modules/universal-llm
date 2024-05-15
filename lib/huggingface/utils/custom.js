'use strict';

const { callAPI } = require('../../common.js');

//......Custom.......

const custom = (hf) => ({
  /*
    inputs = "hello world",
    parameters = {
        custom_param: 'some magic',
    }
  */
  async customCall(
    inputs,
    parameters = {},
    model,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.request', args);
    return res;
  },

  /*
    inputs = "hello world",
    parameters = {
        custom_param: 'some magic',
    }
  */
  async customCallStreaming(
    inputs,
    parameters = {},
    model,
  ) {
    const args = { inputs, parameters, model };
    return callAPI(hf, 'hf.streamingRequest', args);
  },

  /*
    inputs = 'The answer to the universe is',
    endpoint = 'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/gpt2'
  */
  async customInferenceEndpoint(inputs, endpoint) {
    const args = { inputs };
    const hfEndpoint = hf.endpoint(endpoint);
    try {
      const res = await hfEndpoint.textGeneration(args);
      return res;
    } catch (err) {
      throw new Error(
        'Error occured while triggering "textGeneration" method',
        {
          cause: err,
        });
    }
  }
});

module.exports = { custom };
