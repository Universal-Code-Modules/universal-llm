'use strict';

const test = require('node:test');
const assert = require('node:assert');
const path = require('node:path');
const { readFileSync } = require('node:fs');
const { huggingface } = require('../lib');

const {
  FillMask,
  Summarization,
  QuestionAnswering,
  TableQuestionAnswering,
  TextClassification,
  TextGeneration,
  TextGenerationStream,
  TokenClassification,
  Translation,
  ZeroShotClassification,
  SentenceSimilarity,

  AutomaticSpeechRecognition,
  AudioClassification,
  TextToSpeech,
  // AudioToAudio,

  ImageClassification,
  ObjectDetection,
  ImageSegmentation,
  ImageToText,
  TextToImage,
  ImageToImage,
  ZeroShotImageClassification,
  FeatureExtraction,

  VisualQuestionAnswering,
  DocumentQuestionAnswering,
  // TabularRegression,
  // TabularClassification,
  // CustomCall,
  // CustomInferenceEndpoint,
  CustomCallStreaming,
} = huggingface;

const FILES = process.cwd() + '/files/huggingface/';
const AUDIOS = FILES + 'audios';
const IMAGES = FILES + 'images';

const testAudioFile = readFileSync(path.join(AUDIOS, 'speech.mp3'));
const testCatFile = readFileSync(path.join(IMAGES, 'cat.jpg'));
const testSeeFile = readFileSync(path.join(IMAGES, 'see.jpeg'));
const testInvoiceFile = readFileSync(path.join(IMAGES, 'invoice.png'));

test('HuggingFace Connector', async (t) => {
  await t.test('FillMask', async () => {
    const masks = await FillMask('[MASK] world!');

    assert.ok(Array.isArray(masks));

    for (const mask of masks) {
      assert.ok(typeof mask === 'object');
      assert.ok('score' in mask);
      assert.ok('sequence' in mask);
      assert.ok('token' in mask);
      assert.ok('token_str' in mask);
    }
  });

  await t.test('Summarization', async () => {
    const res = await Summarization(
      'The tower is 324 metres (1,063 ft) tall about the same height as an' +
        '81-storey building, and the tallest structure in Paris. Its base is' +
        'square, measuring 125 metres (410 ft) on each side. During its' +
        'construction, the Eiffel Tower surpassed the Washington Monument to' +
        'become the tallest',
    );

    assert.ok(typeof res === 'object');
    assert.ok('summary_text' in res);
  });

  await t.test('QuestionAnswering', async () => {
    const res = await QuestionAnswering({
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

  await t.test('TableQuestionAnswering', async () => {
    const res = await TableQuestionAnswering({
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

  await t.test('TextClassification', async () => {
    const res = await TextClassification('I like you. I love you.');

    assert.ok(Array.isArray(res));
    for (const item of res) {
      assert.ok('label' in item);
      assert.ok('score' in item);
    }
  });

  await t.test('TextGeneration', async () => {
    const res = await TextGeneration('The answer to the universe is');

    assert.ok(typeof res === 'object');
    assert.ok('generated_text' in res);
  });

  await t.test('TextGenerationStream', async () => {
    const res = await TextGenerationStream('repeat "one two three four"', {
      max_new_tokens: 250,
    });

    assert.ok(typeof res === 'object');
  });

  await t.test('TokenClassification', async () => {
    const res = await TokenClassification(
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

  await t.test('Translation', async () => {
    const res = await Translation(
      'My name is Wolfgang and I live in Amsterdam',
      { src_lang: 'en_XX', tgt_lang: 'fr_XX' },
    );

    assert.ok(typeof res === 'object');
    assert.ok('translation_text' in res);
    assert.ok(typeof res.translation_text === 'string');
  });

  await t.test('ZeroShotClassification', async () => {
    const res = await ZeroShotClassification(
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

  await t.test('SentenceSimilarity', async () => {
    const res = await SentenceSimilarity({
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

  await t.test('AutomaticSpeechRecognition', async () => {
    const res = await AutomaticSpeechRecognition(testAudioFile);

    assert.ok(typeof res === 'object');
    assert.ok('text' in res);
    assert.ok(typeof res.text === 'string');
  });

  await t.test('AudioClassification', async () => {
    const res = await AudioClassification(testAudioFile);

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('label' in item);
      assert.ok('score' in item);
    }
  });

  await t.test('TextToSpeech', async () => {
    const res = await TextToSpeech('Hello world!');

    assert.ok(res instanceof Blob);
    assert.ok(typeof res.size === 'number');
    assert.strictEqual(res.type, 'audio/flac');
  });

  // TODO: fix test, getting an error "interface not in config.json"
  // test.skip('AudioToAudio', async () => {
  //   const res = await AudioToAudio(testAudioFile);
  //
  //   console.log(res);
  // });

  await t.test('ImageClassification', async () => {
    const res = await ImageClassification(testCatFile);

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('label' in item);
      assert.ok('score' in item);
    }
  });

  await t.test('ObjectDetection', async () => {
    const res = await ObjectDetection(testCatFile);

    assert.ok(Array.isArray(res));
    assert.ok(res.length === 1);

    const [item] = res;

    assert.ok(typeof item === 'object');
    assert.ok('box' in item);
    assert.ok('label' in item);
    assert.ok('score' in item);
    assert.ok(typeof item.box === 'object');
    assert.ok(typeof item.label === 'string');
    assert.ok(typeof item.score === 'number');
    assert.strictEqual(item.label, 'cat');

    const { box } = item;

    assert.ok(typeof box === 'object');
    assert.ok(typeof box.xmin === 'number');
    assert.ok(typeof box.ymin === 'number');
    assert.ok(typeof box.xmax === 'number');
    assert.ok(typeof box.ymax === 'number');
  });

  await t.test('ImageSegmentation', async () => {
    const res = await ImageSegmentation(testCatFile);

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('score' in item);
      assert.ok('label' in item);
      assert.ok('mask' in item);
    }
  });

  await t.test('ImageToText', async () => {
    const res = await ImageToText(new Blob([testSeeFile]));

    assert.ok(typeof res === 'object');
    assert.ok('generated_text' in res);
    assert.ok(typeof res.generated_text === 'string');
  });

  await t.test('TextToImage', async () => {
    const inputs =
      'award winning high resolution photo of a giant tortoise' +
      '/((ladybird)) hybrid, [trending on artstation]';
    const res = await TextToImage(inputs, { negative_prompt: 'blurry' });

    assert.ok(res instanceof Blob);
    assert.ok(typeof res.size === 'number');
    assert.ok(res.type === 'image/jpeg');
  });

  await t.test('ImageToImage', async () => {
    const res = await ImageToImage(new Blob([testSeeFile]), {
      prompt: 'test picture',
    });

    assert.ok(res instanceof Blob);
    assert.ok(typeof res.size === 'number');
    assert.ok(res.type === 'image/jpeg');
  });

  await t.test('ZeroShotImageClassification', async () => {
    const inputs = { image: new Blob([testCatFile]) };
    const res = await ZeroShotImageClassification(inputs, {
      candidate_labels: ['cat', 'dog'],
    });

    assert.ok(Array.isArray(res));

    for (const item of res) {
      assert.ok(typeof item === 'object');
      assert.ok('score' in item);
      assert.ok('label' in item);
    }
  });

  await t.test('FeatureExtraction', async () => {
    const res = await FeatureExtraction('That is a happy person');

    assert.ok(Array.isArray(res));
    assert.ok(res.every((el) => typeof el === 'number'));
  });

  await t.test('VisualQuestionAnswering', async () => {
    const inputs = {
      question: 'How many cats are lying down?',
      image: new Blob([testCatFile]),
    };
    const res = await VisualQuestionAnswering(inputs);

    assert.ok(typeof res === 'object');
    assert.ok('score' in res);
    assert.ok('answer' in res);
    assert.ok(typeof res.score === 'number');
    assert.strictEqual(res.answer, '1');
  });

  await t.test('DocumentQuestionAnswering', async () => {
    const inputs = {
      question: 'Invoice number?',
      image: new Blob([testInvoiceFile]),
    };
    const res = await DocumentQuestionAnswering(inputs);

    assert.ok(typeof res === 'object');
    assert.ok('score' in res && typeof res.score === 'number');
    assert.ok('start' in res && typeof res.start === 'number');
    assert.ok('end' in res && typeof res.end === 'number');
    assert.ok('answer' in res && typeof res.answer === 'string');
    assert.strictEqual(res.answer, 'us-001');
  });

  // TODO: fix test, timeout
  // test.skip('TabularRegression', async () => {
  //   const inputs = {
  //     data: {
  //       Height: ['11.52', '12.48', '12.3778'],
  //       Length1: ['23.2', '24', '23.9'],
  //       Length2: ['25.4', '26.3', '26.5'],
  //       Length3: ['30', '31.2', '31.1'],
  //       Species: ['Bream', 'Bream', 'Bream'],
  //       Width: ['4.02', '4.3056', '4.6961'],
  //     },
  //   };
  //   const res = await TabularRegression(inputs);
  //
  //   console.log(res);
  // }, 60000);

  // TODO: fix test, timeout
  // test.skip('TabularClassification', async () => {
  //   const inputs = {
  //     data: {
  //       fixed_acidity: ['7.4', '7.8', '10.3'],
  //       volatile_acidity: ['0.7', '0.88', '0.32'],
  //       citric_acid: ['0', '0', '0.45'],
  //       residual_sugar: ['1.9', '2.6', '6.4'],
  //       chlorides: ['0.076', '0.098', '0.073'],
  //       free_sulfur_dioxide: ['11', '25', '5'],
  //       total_sulfur_dioxide: ['34', '67', '13'],
  //       density: ['0.9978', '0.9968', '0.9976'],
  //       pH: ['3.51', '3.2', '3.23'],
  //       sulphates: ['0.56', '0.68', '0.82'],
  //       alcohol: ['9.4', '9.8', '12.6'],
  //     },
  //   };
  //   const res = await TabularClassification(inputs);
  //
  //   console.log(res);
  // }, 60000);

  // TODO: fix test, response is undefined for some reason
  // test.skip('CustomCall', async () => {
  //   const res = await CustomCall('hello world');
  //
  //   console.log(res);
  // });

  await t.test('CustomCallStreaming', async () => {
    const res = await CustomCallStreaming('hello world');

    assert.ok(typeof res === 'object');
  });

  // TODO: To test this one we need to have own inference endpoint
  // test.skip('CustomInferenceEndpoint', async () => {
  //   const endpoint =
  //     'https://xyz.eu-west-1.aws.endpoints.huggingface.cloud/gpt2';
  //   const res = await CustomInferenceEndpoint(
  //     'The answer to the universe is',
  //     endpoint,
  //   );
  //
  //   console.log(res);
  // });
});
