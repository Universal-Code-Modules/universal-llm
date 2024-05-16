'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');
const path = require('node:path');

const { openai } = require('../../lib');
const utils = require('../../lib/openai/utils');
const { tested } = require('./tested.js');

const FILES = path.join(__dirname, '../../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const FINE_TUNE = path.join(OPEN_AI_FILES, 'fine-tune');
const ASSISTANTS = path.join(OPEN_AI_FILES, 'assistants');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

describe('File Operations', () => {
  let files;
  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    files = utils.files(chat.openai);
  });

  it('Count file tokens', async () => {
    const res = await files.countFileTokens({
      pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
      purpose: 'fine-tune',
    });

    assert.strictEqual(res, 1889);
  });

  it('Create fine-tune file', async () => {
    const res = await files.create({
      pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
      purpose: 'fine-tune',
    });

    assert.ok('id' in res);
    assert.strictEqual(res.status, 'processed');

    tested.fineTune.file.id = res.id;
  });

  it('Create assistant file', async () => {
    const res = await files.create({
      pathToFile: ASSISTANTS + '/test.csv',
      purpose: 'assistants',
    });

    assert.ok('id' in res);
    assert.strictEqual(res.status, 'processed');

    tested.assistant.file.id = res.id;
  });

  it('List files', async () => {
    const res = await files.list();

    assert.ok(Array.isArray(res));
  });

  it('Retrieve file', async () => {
    const file_id = tested.fineTune.file.id;
    const res = await files.retrieve({ file_id });

    assert.ok('id' in res);
    assert.strictEqual(res.id, file_id);
  });

  it('Retrieve file content', async () => {
    const file_id = tested.fineTune.file.id;
    const res = await files.content({ file_id });

    assert.strictEqual(typeof res, 'string');
  });

  it('Delete file', async () => {
    const file_id = tested.fineTune.file.id;
    const res = await files.del({ file_id });

    assert.ok('id' in res);
    assert.strictEqual(res.id, file_id);
    assert.strictEqual(res.deleted, true);
  });
});
