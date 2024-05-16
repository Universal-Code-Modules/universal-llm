'use strict';

const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const defaultModels = DEFAULT_MODELS.language;

const language = (hf) => ({
  // inputs = '[MASK] world!'
  async fillMask(inputs, model = defaultModels.fillMask) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.fillMask', args);
    return res;
  },

  /*
    inputs = `The tower is 324 metres (1,063 ft) tall, about the same height
    as an 81-storey building, and the tallest structure in Paris.
    Its base is square, measuring 125 metres (410 ft) on each side.
    During its construction, the Eiffel Tower surpassed the Washington
    Monument to become the tallest`,
    model = 'facebook/bart-large-cnn'
  */
  async summarization(
    inputs,
    parameters = { max_length: 100 },
    model = defaultModels.summarization,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.summarization', args);
    return res;
  },

  /*
    inputs = {
        question: 'What is the capital of France?',
        context: 'The capital of France is Paris.'
    },
  */
  async questionAnswering(inputs, model = defaultModels.questionAnswering) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.questionAnswering', args);
    return res;
  },

  /*
    inputs = {
      query: 'How many stars does the transformers repository have?',
      table: {
      Repository: ['Transformers', 'Datasets', 'Tokenizers'],
      Stars: ['36542', '4512', '3934'],
      Contributors: ['651', '77', '34'],
      'Programming language': ['Python', 'Python', 'Rust, Python and NodeJS']
      }
    },
  */
  async tableQuestionAnswering(
    inputs,
    model = defaultModels.tableQuestionAnswering,
  ) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.tableQuestionAnswering', args);
    return res;
  },

  // inputs = 'I like you. I love you.'
  async textClassification(inputs, model = defaultModels.textClassification) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.textClassification', args);
    return res;
  },

  // inputs = 'The answer to the universe is'
  async textGeneration(inputs, model = defaultModels.textGeneration) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.textGeneration', args);
    return res;
  },

  // inputs = 'repeat "one two three four"'
  // parameters = { max_new_tokens: 250 }
  async textGenerationStream(
    inputs,
    parameters = {},
    model = defaultModels.textGenerationStream,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.textGenerationStream', args);
    return res;
  },

  // inputs = 'My name is Sarah Jessica Parker but you can call me Jessica'
  async tokenClassification(inputs, model = defaultModels.tokenClassification) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.tokenClassification', args);
    return res;
  },

  // inputs = 'My name is Wolfgang and I live in Amsterdam',
  // parameters = {"src_lang": "en_XX", "tgt_lang": "fr_XX"}
  async translation(
    inputs,
    parameters = {},
    model = defaultModels.translation,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.translation', args);
    return res;
  },

  /*
    inputs = [
      'Hi, I recently bought a device from your company but it is not working' +
      ' as advertised and I would like to get reimbursed!'
    ],
    parameters = { candidate_labels: ['refund', 'legal', 'faq'] }
  */
  async zeroShotClassification(
    inputs,
    parameters = {},
    model = defaultModels.zeroShotClassification,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.zeroShotClassification', args);
    return res;
  },

  /*
    inputs = {
        source_sentence: 'That is a happy person',
        sentences: [
        'That is a happy dog',
        'That is a very happy person',
        'Today is a sunny day'
        ]
    }
  */

  async sentenceSimilarity(inputs, model = defaultModels.sentenceSimilarity) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.sentenceSimilarity', args);
    return res;
  },
});

module.exports = { language };
