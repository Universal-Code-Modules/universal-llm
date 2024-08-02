'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const TOOLS = path.join(OPEN_AI_FILES, 'tools');
const TEST_LIBRARY = require(TOOLS + '/test-library.js');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

describe('Chat Operations', () => {
  let language = null;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    language = utils.language(chat);
  });

  it('Text completion', async () => {
    const res = await language.generate({ text: 'hello' });

    assert.ok('usage' in res);
    assert.ok('model' in res);
    assert.ok('id' in res);
    assert.ok('choices' in res);
    assert.ok(res.choices.length === 1);
  });

  it('Text completion with function call', async () => {
    const res = await language.generate({
      text: 'What is the weather like in San Francisco, Tokyo and Paris?',
      tools: TEST_LIBRARY.tools,
    });

    assert.ok('choices' in res);
    assert.ok('messages' in res);
    assert.ok('usage' in res);
  });

  it('Text Embedding', async () => {
    const res = await language.embedding({ text: 'hello' });

    console.dir({ res }, { depth: null });

    assert.ok('usage' in res);
    assert.ok('data' in res);
    assert.ok(Array.isArray(res.data));
    assert.ok('embedding' in res.data[0]);
  });

  // WARN: 400 Invalid value for 'model' = text-moderation-007
  it.skip('Text Classification', async () => {
    const res = await language.classification({
      text: 'I will kill you boatman',
    });

    assert.strictEqual(res.flagged, true);
    assert.strictEqual(res.categories.violence, true);
    assert.ok('violence' in res.category_scores);
  });
});
