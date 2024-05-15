'use strict';

const { beforeEach, it, describe } = require('node:test');
const assert = require('node:assert');

const { huggingface } = require('../../lib');
const utils = require('../../lib/huggingface/utils');

const { Chat } = huggingface;

const API_KEY = process.env.HUGGINGFACE_API_KEY;

const { language: uLanguage } = utils;

describe('language', () => {
  let language;

  beforeEach(() => {
    const chat = new Chat({ apiKey: API_KEY });
    language = uLanguage(chat.hf);
  });

  it('fillMask', async () => {
    const masks = await language.fillMask('[MASK] world!');

    assert.ok(Array.isArray(masks));

    for (const mask of masks) {
      assert.ok(typeof mask === 'object');
      assert.ok('score' in mask);
      assert.ok('sequence' in mask);
      assert.ok('token' in mask);
      assert.ok('token_str' in mask);
    }
  });

  it('summarization', async () => {
    const res = await language.summarization(
      'The tower is 324 metres (1,063 ft) tall about the same height as an' +
        '81-storey building, and the tallest structure in Paris. Its base is' +
        'square, measuring 125 metres (410 ft) on each side. During its' +
        'construction, the Eiffel Tower surpassed the Washington Monument to' +
        'become the tallest',
    );

    assert.ok(typeof res === 'object');
    assert.ok('summary_text' in res);
  });

  it('questionAnswering', async () => {
    const res = await language.questionAnswering({
      question: 'What is the capital of France?',
      context: 'The capital of France is Paris.',
    });

    assert.ok(typeof res === 'object');
    assert.ok('score' in res);
    assert.ok('start' in res);
    assert.ok('end' in res);
    assert.ok('answer' in res);
    assert.strictEqual(res.answer, 'Paris');
  });

  it('tableQuestionAnswering', async () => {
    const res = await language.tableQuestionAnswering({
      query: 'How many stars does the transformers repository have?',
      table: {
        Repository: ['Transformers', 'Datasets', 'Tokenizers'],
        Stars: ['36542', '4512', '3934'],
        Contributors: ['651', '77', '34'],
        'Programming language': ['Python', 'Python', 'Rust, Python and NodeJS'],
      },
    });

    assert.ok(typeof res === 'object');
    assert.ok('answer' in res);
    assert.ok('coordinates' in res);
    assert.ok('cells' in res);
    assert.ok('aggregator' in res);
    assert.deepEqual(res.coordinates, [[0, 1]]);
    assert.strictEqual(res.aggregator, 'AVERAGE');
  });

  it('textClassification', async () => {
    const res = await language.textClassification('I like you. I love you.');

    assert.ok(Array.isArray(res));
    for (const item of res) {
      assert.ok('label' in item);
      assert.ok('score' in item);
    }
  });

  it('textGeneration', async () => {
    const input = 'The answer to the universe is';
    const res = await language.textGeneration(input);

    assert.ok(typeof res === 'object');
    assert.ok('generated_text' in res);
  });

  it('textGenerationStream', async () => {
    const input = 'repeat "one two three four"';
    const res = await language.textGenerationStream(input, {
      max_new_tokens: 250,
    });

    assert.ok(typeof res === 'object');
  });

  it('tokenClassification', async () => {
    const res = await language.tokenClassification(
      'My name is Sarah Jessica Parker but you can call me Jessica',
    );

    // console.log(res);
    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('start' in item);
      assert.ok('end' in item);
      assert.ok('entity_group' in item);
      assert.ok('score' in item);
      assert.ok('word' in item);
    }
  });

  it('translation', async () => {
    const res = await language.translation(
      'My name is Wolfgang and I live in Amsterdam',
      { src_lang: 'en_XX', tgt_lang: 'fr_XX' },
    );

    assert.ok(typeof res === 'object');
    assert.ok('translation_text' in res);
    assert.ok(typeof res.translation_text === 'string');
  });

  it('zeroShotClassification', async () => {
    const res = await language.zeroShotClassification(
      [
        'Hi, I recently bought a device from your company but' +
          ' it is not working as advertised and I would like to' +
          ' get reimbursed!',
      ],
      {
        candidate_labels: ['refund', 'legal', 'faq'],
      },
    );

    assert.ok(Array.isArray(res));
    assert.ok(res.length === 1);

    const [item] = res;

    assert.ok(typeof item === 'object');
    assert.ok('sequence' in item);
    assert.ok('labels' in item);
    assert.ok('scores' in item);
    assert.ok(typeof item.sequence === 'string');
    assert.ok(Array.isArray(item.labels));
    assert.ok(Array.isArray(item.scores));
  });

  it('sentenceSimilarity', async () => {
    const res = await language.sentenceSimilarity({
      source_sentence: 'That is a happy person',
      sentences: [
        'That is a happy dog',
        'That is a very happy person',
        'Today is a sunny day',
      ],
    });

    assert.ok(Array.isArray(res));
    assert.ok(res.every((item) => typeof item === 'number'));
  });
});
