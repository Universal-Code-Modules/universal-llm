'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { ollama } = require('../lib');

const { completion } = ollama;

test('Ollama Connector', async (t) => {
  await t.test('Completion', async () => {
    const res = await completion([
      {
        role: 'user',
        content: 'how are you doing?',
      },
    ]);

    assert.ok(typeof res === 'object');
    assert.ok('role' in res);
    assert.ok('content' in res);
    assert.strictEqual(res.role, 'assistant');
  });
});
