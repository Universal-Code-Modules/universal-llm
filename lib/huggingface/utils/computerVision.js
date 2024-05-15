'use strict';

const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const defaultModels = DEFAULT_MODELS.computerVision;

//......ComputerVision.......

const computerVision = (hf) => ({
  // data = readFileSync('test/cheetah.png')
  async imageClassification(
    data,
    model = defaultModels.imageClassification,
  ) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.imageClassification', args);
    return res;
  },

  /*
      data = readFileSync('test/cats.png')
  */
  async objectDetection(data, model = defaultModels.objectDetection) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.objectDetection', args);
    return res;
  },

  // data = readFileSync('test/cats.png')
  async imageSegmentation(
    data,
    model = defaultModels.imageSegmentation,
  ) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.imageSegmentation', args);
    return res;
  },

  // data = await (await fetch('https://picsum.photos/300/300')).blob()
  async imageToText(
    data,
    model = defaultModels.imageToText,
  ) {
    const args = { data, model };
    const res = await callAPI(hf, 'hf.imageToText', args);
    return res;
  },

  /*
    inputs = 'award winning high resolution photo of a giant' +
    ' tortoise/((ladybird)) hybrid, [trending on artstation]',
    parameters = {negative_prompt: 'blurry'},
  */
  async textToImage(
    inputs,
    parameters = {},
    model = defaultModels.textToImage,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.textToImage', args);
    return res;
  },

  /*
    inputs = new Blob([readFileSync("test/stormtrooper_depth.png")]),
    parameters = {prompt: "elmo's lecture"},
  */
  async imageToImage(
    inputs,
    parameters = {},
    model = defaultModels.imageToImage,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.imageToImage', args);
    return res;
  },

  /*
    inputs = { image: await (await fetch('https://placekitten.com/300/300')).blob() },
    parameters = { candidate_labels: ['cat', 'dog'] },
  */
  async zeroShotImageClassification(
    inputs,
    parameters = {},
    model = defaultModels.zeroShotImageClassification,
  ) {
    const args = { inputs, parameters, model };
    const res = await callAPI(hf, 'hf.zeroShotImageClassification', args);
    return res;
  },
});

module.exports = { computerVision };
