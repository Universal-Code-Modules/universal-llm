'use strict';

const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const defaultModels = DEFAULT_MODELS.multimodal;

//......Multimodal.......

const multimodal = (hf) => ({

  // inputs = "That is a happy person",
  async featureExtraction(
    inputs,
    model = defaultModels.featureExtraction,
  ) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.featureExtraction', args);
    return res;
  },

  /*
    inputs = {
        question: 'How many cats are lying down?',
        image: await (await fetch('https://placekitten.com/300/300')).blob()
    },
  */
  async visualQuestionAnswering(
    inputs,
    model = defaultModels.visualQuestionAnswering,
  ) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.visualQuestionAnswering', args);
    return res;
  },

  /*
    inputs = {
        question: 'Invoice number?',
        image: await (await fetch('https://huggingface.co/spaces/impira/docquery/resolve/2359223c1837a7587402bda0f2643382a6eefeab/invoice.png')).blob(),
    },
  */
  async documentQuestionAnswering(
    inputs,
    model = defaultModels.documentQuestionAnswering,
  ) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.documentQuestionAnswering', args);
    return res;
  }
});

module.exports = { multimodal };
