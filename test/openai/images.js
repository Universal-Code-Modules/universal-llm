'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const IMAGES = path.join(OPEN_AI_FILES, 'images');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

describe('Image Operations', () => {
  let images = null;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    images = utils.images(chat.openai);
  });

  it('Image Generation', async () => {
    const saveAs = IMAGES + '/my_test-image-create-result.jpg';

    const res = await images.create({
      text: 'a white siamese cat',
      saveAs,
    });

    assert.ok('url' in res);
    assert.ok('local' in res);
  });

  it('Image Edit', async () => {
    const saveAs = IMAGES + '/my_test-edit-image-result.jpg';

    const res = await images.edit({
      text: 'A futuristic landscape behind a foregraund emoticon',
      pathToFile: IMAGES + '/test-edit-image.png',
      pathToMask: IMAGES + '/test-edit-image.png',
      saveAs,
      size: '256x256',
    });

    assert.ok('url' in res);
    assert.ok('local' in res);
  });

  it('Image Variation', async () => {
    const pathToFile = IMAGES + '/test-edit-image.png';
    const saveAs = IMAGES + '/my_test-image-variation-result.jpg';

    const res = await images.variation({ pathToFile, saveAs });

    assert.ok('url' in res);
    assert.ok('local' in res);
  });
});
