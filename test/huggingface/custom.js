'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');

const { huggingface } = require('../../lib');
const utils = require('../../lib/huggingface/utils');

const { Chat } = huggingface;

const API_KEY = process.env.HUGGINGFACE_API_KEY;

const { custom: uCustom } = utils;

describe('custom', () => {
  let custom;

  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    custom = uCustom(chat.hf);
  });

  // TODO: fix test, response is undefined for some reason
  it.skip('customCall', async () => {
    const res = await custom.customCall('hello world');

    console.log(res);
  });

  it('customCallStreaming', async () => {
    const res = await custom.customCallStreaming('hello world');

    assert.ok(typeof res === 'object');
  });

  // TODO: To test this one we need to have own inference endpoint
  it.skip('customInferenceEndpoint', async () => {
    const endpoint =
      'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/gpt2';
    const res = await custom.customInferenceEndpoint(
      'The answer to the universe is',
      endpoint,
    );

    console.log(res);
  });
});
