'use strict';

const { files } = require('./files.js');
const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const fineTune = (openai) => ({
  // hyperparameters =
  // batch_size
  // string or integer  Optional Defaults to auto
  // Number of examples in each batch. A larger batch size means that model
  // parameters are updated less frequently, but with lower variance.

  // learning_rate_multiplier string or number Optional  Defaults to auto
  // Scaling factor for the learning rate. A smaller learning
  // rate may be useful to avoid overfitting.

  // n_epochs
  // string or integer Optional Defaults to auto
  // The number of epochs to train the model for.
  // An epoch refers to one full cycle through the training dataset.
  async create({
    pathToFile,
    training_file,
    hyperparameters = {
      batch_size: 'auto',
      learning_rate_multiplier: 'auto',
      n_epochs: 'auto',
    },
    suffix = '',
    model = DEFAULT_MODELS.fineTune,
    deleteFile = false,
    maxTokens = 0,
  }) {
    if (pathToFile) {
      const epochs =
        hyperparameters.n_epochs !== 'auto' ? hyperparameters.n_epochs : 1;
      const tokens = await files(openai).countFileTokens({ pathToFile });
      if (maxTokens && tokens * epochs > maxTokens) {
        throw new Error(`Max tokens ${maxTokens} exceeded ${tokens}`);
      }
      const file = await files(openai).create({ pathToFile });
      if (!file || !file.id) return console.error('Error creating file');
      training_file = file.id;
    }
    const params = { training_file, suffix, model };
    if (hyperparameters) params.hyperparameters = hyperparameters;
    if (suffix) params.suffix = suffix;

    const response = await callAPI(
      openai.fineTuning.jobs,
      'openai.fineTuning.jobs.create',
      params,
    );
    if (response.error) return response;
    if (deleteFile) await files(openai).del({ training_file });

    return response;
  },

  async list() {
    const response = await callAPI(
      openai.fineTuning.jobs,
      'openai.fineTuning.jobs.list',
    );
    if (response.error) return response;
    return response.data;
    // for await (const fineTune of list) {
    //   console.log(fineTune);
    // }
  },

  async events({ id, limit = 2 }) {
    const list = await callAPI(
      openai.fineTuning,
      'openai.fineTuning.list_events',
      id,
      limit,
    );

    // for await (const fineTune of list) {
    //   console.log(fineTune);
    // }
    return list;
  },

  async retrieve({ id }) {
    const res = await callAPI(
      openai.fineTuning.jobs,
      'openai.fineTuning.jobs.retrieve',
      id,
    );
    return res;
  },

  async cancel({ id }) {
    const fineTune = await callAPI(
      openai.fineTuning.jobs,
      'openai.fineTuning.jobs.cancel',
      id,
    );
    return fineTune;
  },
});

module.exports = { fineTune };

// fineTune.create({pathToFile, training_file, hyperparameters, suffix,
// fineTune.list() => data (array)
// fineTune.events({id, limit}) => response - does not work
// fineTune.retrieve({id}) => response
// fineTune.cancel{({id}) => response
