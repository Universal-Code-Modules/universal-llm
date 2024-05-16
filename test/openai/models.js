'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');
const { tested } = require('./tested.js');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

const modelId = 'gpt-3.5-turbo-16k';

describe('Model Operations', () => {
  let models = null;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    models = utils.models(chat.openai);
  });

  it('List models', async () => {
    const res = await models.list();

    assert.ok(Array.isArray(res));

    const custom_model = res.find((model) => model.id.startsWith('ft'));
    tested.model.id = custom_model.id;
  });

  it('Retrieve model', async () => {
    const res = await models.retrieve({ model_id: modelId });

    assert.ok('id' in res);
    assert.strictEqual(res.id, modelId);
  });

  // WARN: 403 You have insufficient permissions for this operation
  it.skip('Delete model', async () => {
    const res = await models.del({ model_id: modelId });

    assert.ok('deleted' in res);
    assert.ok(res.deleted);
  });
});
