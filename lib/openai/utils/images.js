'use strict';

const fs = require('node:fs');
const { callAPI, saveFileFromWeb } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const images = (openai) => ({
  /*

    prompt: "a white siamese cat",
        model: "dall-e-3",
        n: 1, (dalle-3 always generates only one image per request)
        size: "1024x1024",

    */
  async create({
    text,
    saveAs = '',
    size = '1024x1024',
    quality = 'standard',
    n = 1,
    model = DEFAULT_MODELS.imageCreate,
  }) {
    //quality: "standard", "hd"
    // return console.log(pathToFile.replace(/^\./, ''));

    const response = await callAPI(openai.images, 'openai.images.generate', {
      prompt: text,
      size,
      quality,
      n,
      model,
    });
    if (response.error) return response;
    const url = response?.data[0]?.url;
    // const url = `https://oaidalleapiprodscus.blob.core.windows.net/private/org-0W2DSt5sTB0F2NuqbNIHHcTg/user-m7HmI4bqRdNZxYTHJlFPLN9P/img-nYmIPv103J4yZAw29MTr7N7x.png?st=2024-03-24T17%3A16%3A00Z&se=2024-03-24T19%3A16%3A00Z&sp=r&sv=2021-08-06&sr=b&rscd=inline&rsct=image/png&skoid=6aaadede-4fb3-4698-a8f6-684d7786b067&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2024-03-23T21%3A30%3A02Z&ske=2024-03-24T21%3A30%3A02Z&sks=b&skv=2021-08-06&sig=ByJlRNd/IQsOrgmruP8u/oyjWmKE/PDW4tG9E1YuoRo%3D`;
    if (url && saveAs.length) {
      try {
        await saveFileFromWeb(url, saveAs);
      } catch (error) {
        console.error('Error saving file:', error);
      }
    }
    return { url, local: saveAs.replace(/^\./, '') };
  },
  /*
    accepts only .png RGBA images
    */
  async edit({
    text,
    pathToFile,
    pathToMask = '',
    saveAs = '',
    size = '1024x1024',
    n = 1,
    model = DEFAULT_MODELS.image,
  }) {
    const params = {
      prompt: text,
      image: fs.createReadStream(pathToFile),
      model,
      n,
      size,
    };
    if (pathToMask.length) params.mask = fs.createReadStream(pathToMask);

    const response = await callAPI(openai.images, 'openai.images.edit', params);
    if (response.error) return response;
    const url = response.data[0].url;
    if (url && saveAs.length) {
      try {
        await saveFileFromWeb(url, saveAs);
      } catch (error) {
        return console.error('Error saving file:', error);
      }
    }
    return { url, local: saveAs.replace(/^\./, '') };
  },

  async variation({
    pathToFile,
    saveAs = '',
    size = '1024x1024',
    n = 1,
    model = DEFAULT_MODELS.image,
  }) {
    const response = await callAPI(
      openai.images,
      'openai.images.createVariation',
      {
        image: fs.createReadStream(pathToFile),
        model,
        n,
        size,
      },
    );
    if (response.error) return response;
    const url = response.data[0].url;
    if (url && saveAs.length) {
      try {
        await saveFileFromWeb(url, saveAs);
      } catch (error) {
        return console.error('Error saving file:', error);
      }
    }
    return { url, local: saveAs.replace(/^\./, '') };
  },
});

module.exports = { images };

// images.create({text, pathToFile, size, quality, n, model}) => {url, local}
// images.edit({text, pathToFile, pathToMask, size, n, model}) => response
// images.variation({pathToFile, size, n, model}) => response
