'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { ollama } = require('../lib');

const { completion } = ollama;

test('Ollama Connector', async (t) => {
  await t.test('Completion', async () => {
    const data = await completion([
      {
        role: 'user',
        content: 'how are you doing?',
      },
    ]);
    assert.equal(data.message.role, 'assistant');
  });
});
