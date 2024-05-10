'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {
  callAPI,
  cleanDirectory,
  extractVideoFrames,
} = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const recognition = (openai) => ({
  async image({
    url,
    pathToFile,
    prompt = 'What’s in this image?',
    detail = 'auto',
    max_tokens = 300,
    model = DEFAULT_MODELS.vision,
  }) {
    let imageURL = url;
    if (!imageURL) {
      if (!pathToFile) throw new Error('No image provided');
      const data = await fs.promises.readFile(pathToFile);
      const base64Image = Buffer.from(data, 'binary').toString('base64');
      imageURL = `data:image/jpeg;base64, ${base64Image}`;
    }
    const response = await callAPI(
      openai.chat.completions,
      'openai.chat.completions.create',
      {
        model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              {
                type: 'image_url',
                image_url: {
                  url: imageURL,
                  detail, //low, high, or auto
                },
              },
            ],
          },
        ],
        max_tokens,
      },
    );
    if (response.error) return response;
    return {
      message: response.choices[0].message.content,
      usage: response.usage,
    };
  },
  /*
  Requires ffmpeg installed
  May exceed the max tokens per minutes limit
  */
  async video({
    pathToFile,
    outputDir,
    max_tokens = 300,
    frameRate = 1,
    model = DEFAULT_MODELS.vision,
  }) {
    await cleanDirectory(outputDir);
    await extractVideoFrames(pathToFile, outputDir, frameRate);
    const files = await fs.promises.readdir(outputDir);
    const content = [
      {
        type: 'text',
        text:
          'These are frames from a video. ' +
          'Generate a compelling description of the video.',
      },
    ];
    for (const file of files) {
      const data = await fs.promises.readFile(path.join(outputDir, file));
      const base64Image = Buffer.from(data, 'binary').toString('base64');
      const imageURL = `data:image/jpeg;base64, ${base64Image}`;
      content.push({ type: 'image_url', image_url: { url: imageURL } });
    }

    const response = await callAPI(
      openai.chat.completions,
      'openai.chat.completions.create',
      {
        model,
        messages: [
          {
            role: 'user',
            content,
          },
        ],
        max_tokens,
      },
    );
    if (response.error) return response;
    return {
      message: response.choices[0].message.content,
      usage: response.usage,
    };
  },
});

module.exports = { recognition };
// recognition.image({url, pathToFile, prompt, max_tokens, model}) =>
// {message, usage}
// recognition.video({pathToFile, outputDir, max_tokens, model}) =>
// {message, usage}
