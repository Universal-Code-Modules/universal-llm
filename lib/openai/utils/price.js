'use strict';

const fromExponential = require('from-exponential');
const sharp = require('sharp');
const { parseFile } = require('music-metadata');
const { tokens } = require('./tokens.js');
const openaiData = require('../data.js');
const { math } = require('../../common.js');

const completions = ['training', 'prompt', 'completion'];

const price = {
  async estimate({
    purpose,
    model,
    text = '',
    pathToFile = '',
    options = {
      type: 'prompt',
      detail: 'low',
      resolution: '1024x1024',
      quality: 'standard',
    },
  }) {
    const res = { price: 0, tokens: 0, options };

    let tokenCost = 0,
      metadata;
    if (text.length) res.tokens = tokens.count({ text, model });

    const usedModel = openaiData.models[purpose][model];
    const prices = {};
    const expectedKeys = ['training', 'prompt', 'completion'];
    for (const key in usedModel.prices) {
      if (expectedKeys.includes(key))
        prices[key] = math.divide(usedModel.prices[key], 1000000);
    }

    if (purpose === 'completeon') {
      tokenCost = options.type === 'prompt' ? prices.prompt : prices.completion;
      res.price = math.multiply(res.tokens, tokenCost);
    } else if (purpose === 'embedding') {
      tokenCost = prices.prompt;
      res.price = math.multiply(res.tokens, tokenCost);
    } else if (purpose === 'recognition') {
      res.tokens += usedModel.tokens.base;
      if (options.detail !== 'low') {
        metadata = await sharp(pathToFile).metadata();
        const scaled = price._scaleAndMeasureImage(
          metadata.width,
          metadata.height,
        );
        // console.log(metadata.width, metadata.height, scaled);
        res.tokens += scaled.numberOfSquares * usedModel.tokens.block;
      }
      res.price = math.multiply(res.tokens, prices.prompt);
    } else if (purpose === 'images') {
      res.price = usedModel.prices[options.quality][options.resolution];
    } else if (purpose === 'fineTune') {
      if (options.type === 'training') {
        // TODO: files not defined
        // res.tokens = await files.countFileTokens({ pathToFile, model });
        // res.price = math.multiply(res.tokens, prices.training);
      } else {
        const token_cost =
          options.type === 'prompt' ? prices.prompt : prices.completion;
        res.price = math.multiply(res.tokens, token_cost);
      }
    } else if (purpose === 'speech') {
      if (model === 'whisper-1') {
        metadata = await parseFile(pathToFile);
        res.duration = Math.round(metadata.format.duration);
        res.price = math.multiply(res.duration, usedModel.prices.minute / 60);
        // console.log(inspect(metadata, { showHidden: false, depth: null }));
      } else {
        res.price = math.multiply(res.tokens, prices.prompt);
      }
    }
    // console.log(usedModel.prices)

    // switch (purpose) {
    //   case 'completeon':
    //     tokenCost =
    //       options.type === 'prompt' ? prices.prompt : prices.completion;
    //     res.price = math.multiply(res.tokens, tokenCost);
    //     break;
    //   case 'embedding':
    //     tokenCost = prices.prompt;
    //     res.price = math.multiply(res.tokens, tokenCost);
    //     break;
    //   case 'recognition':
    //     res.tokens += usedModel.tokens.base;
    //     if (options.detail !== 'low') {
    //       metadata = await sharp(pathToFile).metadata();
    //       const scaled = price._scaleAndMeasureImage(
    //         metadata.width,
    //         metadata.height,
    //       );
    //       // console.log(metadata.width, metadata.height, scaled);
    //       res.tokens += scaled.numberOfSquares * usedModel.tokens.block;
    //     }
    //
    //     res.price = math.multiply(res.tokens, prices.prompt);
    //     break;
    //
    //   case 'images':
    //     res.price = usedModel.prices[options.quality][options.resolution];
    //     break;
    //
    //   case 'fineTune':
    //     if (options.type === 'training') {
    //       res.tokens = await files.countFileTokens({ pathToFile, model });
    //       res.price = math.multiply(res.tokens, prices.training);
    //     } else {
    //       const token_cost =
    //         options.type === 'prompt' ? prices.prompt : prices.completion;
    //       res.price = math.multiply(res.tokens, token_cost);
    //     }
    //     break;
    //
    //   case 'speech':
    //     if (model === 'whisper-1') {
    //       metadata = await parseFile(pathToFile);
    //       res.duration = Math.round(metadata.format.duration);
    //       res.price = math.multiply(
    //        res.duration,
    //        usedModel.prices.minute / 60
    //        );
    //       // console.log(
    //            inspect(metadata, { showHidden: false, depth: null })
    //          );
    //     } else {
    //       res.price = math.multiply(res.tokens, prices.prompt);
    //     }
    //
    //     break;
    // }
    // res.string = res.price.toFixed(20).replace(/[0]+$/, '');
    res.string = fromExponential(res.price);
    return res;
  },

  calculateByUsage({ purpose, model, usage, usages }) {
    const usedModel = openaiData.models[purpose][model];
    if (!usedModel) throw new Error('Model currently does not support');
    const prices = {};
    for (const key in usedModel.prices) {
      if (completions.includes(key))
        prices[key] = math.divide(usedModel.prices[key], 1000000);
    }

    const tokens = { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };
    let total = 0;
    let prompt = 0;
    let completion = 0;
    let res = {};

    if (usage) {
      const { prompt_tokens, completion_tokens } = usage;
      prompt = math.multiply(prompt_tokens, prices.prompt);
      completion = math.multiply(completion_tokens, prices.completion);
      total = math.add(prompt, completion);
      res = { ...usage };
    } else if (usages) {
      for (const usage of usages) {
        const { prompt_tokens, completion_tokens } = usage;
        tokens.prompt_tokens += prompt_tokens;
        tokens.completion_tokens += completion_tokens;
        tokens.total_tokens += math.add(prompt_tokens, completion_tokens);
        prompt += math.multiply(prompt_tokens, prices.prompt);
        completion += math.multiply(completion_tokens, prices.completion);
      }
      total = math.add(prompt, completion);
      res = tokens;
    }
    res.prompt_price = prompt;
    res.completion_price = completion;
    res.total_price = total;
    // res.prices = { prompt, completion, total };
    // res.strings = { prompt:fromExponential(prompt),
    // completion:fromExponential(completion), total:fromExponential(total) };
    return res;
  },

  _scaleAndMeasureImage(width, height) {
    // Define the constraints
    const maxLongSide = 2048;
    const maxShortSide = 768;
    const squareSize = 512;

    // Step 1: Scale down if the longest side is more than 2048 pixels
    const aspectRatio = width / height;
    if (width > height) {
      if (width > maxLongSide) {
        width = maxLongSide;
        height = width / aspectRatio;
      }
    } else if (height > maxLongSide) {
      height = maxLongSide;
      width = height * aspectRatio;
    }

    // Step 2: Scale down further if the shortest side
    // is more than 768 pixels after step 1
    if (Math.min(width, height) > maxShortSide) {
      if (width < height) {
        width = maxShortSide;
        height = width / aspectRatio;
      } else {
        height = maxShortSide;
        width = height * aspectRatio;
      }
    }

    // Make sure the final dimensions are rounded to avoid fractional pixels
    width = Math.round(width);
    height = Math.round(height);

    // Step 3: Calculate the number of squares needed
    const squaresWidth = Math.ceil(width / squareSize);
    const squaresHeight = Math.ceil(height / squareSize);
    const totalSquares = squaresWidth * squaresHeight;

    return {
      scaledWidth: width,
      scaledHeight: height,
      numberOfSquares: totalSquares,
    };
  },
};

module.exports = { price };

// price.calculate({model, input, type}) => number
// price.estimate({purpose, model, text = '', pathToFile = '',
// options = {type: 'prompt', detail:'low', resolution:"1024x1024",
// quality:'standard'}}) => {price:0, tokens:0, options}
// price.calculate({purpose, model, usage}) => {
//   prompt_token,
//   completion_token,
//   total_tokens,
//   prices: { prompt, completion, total },
//   strings: { prompt, completion, total }
// }
