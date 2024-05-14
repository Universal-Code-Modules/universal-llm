'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { openai } = require('../lib');
const utils = require('../lib/openai/utils');
const common = require('../lib/common.js');

const { Chat } = openai;
const API_KEY = process.env.OPENAI_API_KEY;

const FILES = path.join(__dirname, '../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const AUDIOS = path.join(OPEN_AI_FILES, 'audios');
const IMAGES = path.join(OPEN_AI_FILES, 'images');
const FINE_TUNE = path.join(OPEN_AI_FILES, 'fine-tune');
const ASSISTANTS = path.join(OPEN_AI_FILES, 'assistants');
const TOOLS = path.join(OPEN_AI_FILES, 'tools');
const TEST_LIBRARY = require(TOOLS + '/test-library.js');

const {
  language,
  files,
  fineTune,
  models,
  images,
  speech,
  recognition,
  // tokens,
  // assistants,
} = utils;

const tested = {
  chat: new Chat({}),
  fineTune: {
    id: '',
    file: { id: '' },
  },
  model: {
    id: '',
  },
  assistant: {
    id: '',
    thread: { id: '' },
    message: { id: '' },
    run: { id: '' },
    step: { id: '' },
    file: { id: '' },
    added_file: { id: '' },
  },
};
// const clean = async () => {};
// const file_id = 'file-X4ZR3WmEyxJKOEuyuthIIj9T';
// const ftJobId = 'ftjob-WUootDAvgqK1iJlpTn1XZmoO';
const modelId = 'gpt-3.5-turbo-16k';

test('Chat message', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await chat.message({ text: 'Hello' });

  assert.strictEqual(typeof res, 'string');
});

test('Chat voice message', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await chat.voiceMessage({
    inputFilePath: AUDIOS + '/test-speech-input-en.mp3',
    outputFilePath: AUDIOS + '/my_test-speech-output-en.mp3',
    returnIntermediateResult: false,
  });

  assert.ok('inputText' in res);
  assert.strictEqual(res.inputText, 'Hello there.');
  assert.ok('outputText' in res);
  assert.ok('outputFilePath' in res);
});

test('Text completion', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await language(chat.openai).generate({ text: 'hello' });

  assert.ok('message' in res);
  assert.ok('messages' in res);
  assert.ok('usage' in res);
});

test('Text completeon with function call', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await language(chat.openai).generate({
    text: 'What is the weather like in San Francisco, Tokyo and Paris?',
    tools: TEST_LIBRARY.tools,
  });

  assert.ok('message' in res);
  assert.ok('messages' in res);
  assert.ok('usage' in res);
});

test('Text Embedding', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await language(chat.openai).embedding({ text: 'hello' });

  assert.ok('embedding' in res);
  assert.ok('usage' in res);
});

// WARN: 400 Invalid value for 'model' = text-moderation-007.

// await t.test('Text Classification', async () => {
//   const chat = new Chat({ apiKey: API_KEY });
//
//   const res = await language(chat.openai).classification({
//     text: 'I will kill you boatman',
//   });
//
//   assert.strictEqual(res.flagged, true);
//   assert.strictEqual(res.categories.violence, true);
//   assert.ok('violence' in res.category_scores);
// });

// TODO: We need update test to without statement (tested.fineTune.file)
test('Count file tokens', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await files(chat.openai).countFileTokens({
    pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
    purpose: 'fine-tune',
  });

  assert.strictEqual(res, 1889);
});

test('Creare fine-tune file', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await files(chat.openai).create({
    pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
    purpose: 'fine-tune',
  });

  assert.ok('id' in res);
  assert.strictEqual(res.status, 'processed');

  tested.fineTune.file.id = res.id;
});

test('Create assistant file', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await files(chat.openai).create({
    pathToFile: ASSISTANTS + '/test.csv',
    purpose: 'assistants',
  });

  assert.ok('id' in res);
  assert.strictEqual(res.status, 'processed');

  tested.assistant.file.id = res.id;
});

test('List files', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await files(chat.openai).list();

  assert.ok(Array.isArray(res));
});

test('Retrieve file', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const file_id = tested.fineTune.file.id;
  const res = await files(chat.openai).retrieve({ file_id });

  assert.ok('id' in res);
  assert.strictEqual(res.id, file_id);
});

test('Retrieve file content', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const file_id = tested.fineTune.file.id;
  const res = await files(chat.openai).content({ file_id });

  assert.strictEqual(typeof res, 'string');
});

test('Delete file', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const file_id = tested.fineTune.file.id;
  const res = await files(chat.openai).del({ file_id });

  assert.ok('id' in res);
  assert.strictEqual(res.id, file_id);
  assert.strictEqual(res.deleted, true);
});

test('Create Fine Tune job', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await fineTune(chat.openai).create({
    pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
  });

  assert.ok('id' in res);
  assert.deepEqual(res.error, {});

  tested.fineTune.id = res.id;
  tested.fineTune.file.id = res.training_file;
});

test('Create Fine Tune from training file', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const file_id = tested.fineTune.file.id;
  const res = await fineTune(chat.openai).create({
    training_file: file_id,
  });

  assert.ok('id' in res);
  assert.deepEqual(res.error, {});

  tested.fineTune.id = res.id;
});
// //  Does not work
// //  test('Get Fine Tune events', async () => {
// //     // let ftJobId = tested.fineTune.id;
// //     const res = await fineTune.events({id:ftJobId})
// //  });
test('List Fine Tune jobs', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await fineTune(chat.openai).list();

  assert.ok(Array.isArray(res));
});

test('Retrieve Fine Tune job', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const ftJobId = tested.fineTune.id;
  const res = await fineTune(chat.openai).retrieve({ id: ftJobId });

  assert.ok('id' in res);
  assert.strictEqual(res.id, ftJobId);
});
// Require to catch error if job is completed
// test('Cancel Fine Tune job', async () => {
//    //    let ftJobId = tested.fineTune.id;
//    const fn = async () => await fineTune.cancel({id:ftJobId});
//    expect(fn).toThrow(TypeError);
// });

test('List models', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await models(chat.openai).list();

  assert.ok(Array.isArray(res));

  const custom_model = res.find((model) => model.id.startsWith('ft'));
  tested.model.id = custom_model.id;
});

test('Retrieve model', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const res = await models(chat.openai).retrieve({ model_id: modelId });

  assert.ok('id' in res);
  assert.strictEqual(res.id, modelId);
});

// WARN: 403 You have insufficient permissions for this operation

// await t.test('Delete model', async () => {
//   const chat = new Chat({ apiKey: API_KEY });
//
//   const res = await models(chat.openai).del({ model_id: modelId });
//
//   assert.ok('deleted' in res);
//   assert.ok(res.deleted);
// });

test('textToSpeech', async (t) => {
  const chat = new Chat({ apiKey: API_KEY });

  const pathToFile = AUDIOS + '/my_test-speech-output-en.mp3';

  const isExist = await common.fileIsExist(pathToFile);

  if (isExist) {
    try {
      await fs.promises.unlink(pathToFile);
    } catch (err) {
      t.fail(err);
    }
  }

  const res = await speech(chat.openai).textToSpeech({
    text: 'Hello, how can I help you?',
    pathToFile,
  });
  const stat = await fs.promises.stat(pathToFile);

  assert.ok(Buffer.isBuffer(res));
  assert.ok('uid' in stat);
});

test('speechToText', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const pathToFile = AUDIOS + '/test-speech-input-en.mp3';
  const res = await speech(chat.openai).speechToText({ pathToFile });

  assert.strictEqual(typeof res, 'string');
});

test('Speech Translation', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const pathToFile = AUDIOS + '/test-speech-input-ru.mp3';
  const res = await speech(chat.openai).speechTranslation({ pathToFile });

  assert.strictEqual(typeof res, 'string');
});

test('Image Generation', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const saveAs = IMAGES + '/my_test-image-create-result.jpg';

  const res = await images(chat.openai).create({
    text: 'a white siamese cat',
    saveAs,
  });

  assert.ok('url' in res);
  assert.ok('local' in res);
});

test('Image Edit', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const saveAs = IMAGES + '/my_test-edit-image-result.jpg';

  const res = await images(chat.openai).edit({
    text: 'A futuristic landscape behind a foregraund emoticon',
    pathToFile: IMAGES + '/test-edit-image.png',
    pathToMask: IMAGES + '/test-edit-image.png',
    saveAs,
    size: '256x256',
  });

  assert.ok('url' in res);
  assert.ok('local' in res);
});

test('Image Variation', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const pathToFile = IMAGES + '/test-edit-image.png';
  const saveAs = IMAGES + '/my_test-image-variation-result.jpg';
  // try {
  //     await fs.promises.unlink(saveAs)
  // } catch (error) {}

  const res = await images(chat.openai).variation({ pathToFile, saveAs });
  // const stat = await fs.promises.stat(saveAs);

  assert.ok('url' in res);
  assert.ok('local' in res);
  // expect(stat).toHaveProperty('uid');
});

test('Image Recognition', async () => {
  const chat = new Chat({ apiKey: API_KEY });

  const pathToFile = IMAGES + '/test-image.jpg';
  const res = await recognition(chat.openai).image({ pathToFile });

  assert.ok('message' in res);
  assert.ok('usage' in res);
});
// .....Too heavy for testing
// test('Video Recognition', async () => {
//     const pathToFile = './lib/LLM/OpenAI/tests/videos/cat-no.mp4';
//     const outputDir = './lib/LLM/OpenAI/tests/videos/video-frames'
// const res = await recognition.video({
//   pathToFile,
//   outputDir,
//   frameRate: 5,
// });
//     expect(res).toHaveProperty('message');
//     expect(res).toHaveProperty('usage');
