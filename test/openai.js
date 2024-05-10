'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { openai } = require('../lib');
const { Chat, utils } = openai;
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

const FILES = '../files';
const OPEN_AI_FILES = path.join(FILES, 'openai');
const AUDIOS = path.join(OPEN_AI_FILES, 'audio');
const IMAGES = path.join(OPEN_AI_FILES, 'images');
const FINE_TUNE = path.join(OPEN_AI_FILES, 'fine-tune');
const ASSISTANTS = path.join(OPEN_AI_FILES, 'assistants');
const TOOLS = path.join(OPEN_AI_FILES, 'tools');
const testLibrary = require(TOOLS + '/test-library.js');

const API_KEY = process.env.OPENAI_API_KEY || 'stubKey';

const chat = new Chat({ apiKey: API_KEY });
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
const file_id = 'file-X4ZR3WmEyxJKOEuyuthIIj9T';
const ftJobId = 'ftjob-WUootDAvgqK1iJlpTn1XZmoO';
const modelId = 'gpt-3.5-turbo-16k';

test('Openai Chat', async (t) => {
  await t.test('Chat message', async () => {
    const res = await chat.message({ text: 'Hello' });
    assert.strictEqual(typeof res, 'string');
  });

  await t.test('Chat voice message', async () => {
    const res = await chat.voiceMessage({
      inputFilePath: AUDIOS + '/test-speech-input-en.mp3',
      outputFilePath: AUDIOS + '/test-speech-output-en.mp3',
      returnIntermediateResult: false,
    });

    assert.ok('inputText' in res);
    assert.strictEqual(res.inputText, 'Hello there.');
    assert.ok('outputText' in res);
    assert.ok('outputFilePath' in res);
  });
});

test('Openai Language', async (t) => {
  await t.test('Text completion', async () => {
    const res = await language.generate({ text: 'hello' });

    assert.ok('message' in res);
    assert.ok('messages' in res);
    assert.ok('usage' in res);
  });

  await t.test('Text completeon with function call', async () => {
    const res = await language.generate({
      text: 'What is the weather like in San Francisco, Tokyo and Paris?',
      tools: testLibrary.tools,
    });

    assert.ok('message' in res);
    assert.ok('messages' in res);
    assert.ok('usage' in res);
  });

  await t.test('Text Embedding', async () => {
    const res = await language.embedding({ text: 'hello' });

    assert.ok('embedding' in res);
    assert.ok('usage' in res);
  });

  await t.test('Text Classification', async () => {
    const res = await language.classification({
      text: 'I will kill you boatman',
    });
    assert.strictEqual(res.flagged, true);
    assert.strictEqual(res.categories.violence, true);
    assert.ok('violence' in res.category_scores);
  });
});

test('Openai Files', async (t) => {
  await t.test('Count file tokens', async () => {
    const res = await files.countFileTokens({
      pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
    });
    // const res = await files.create({
    //   pathToFile: './lib/LLM/OpenAI/tests/fine-tune/test-fine-tune-24.jsonl',
    //   purpose: 'fine-tune',
    // });
    assert.strictEqual(res, 1889);
  });

  await t.test('Creare fine-tune file', async () => {
    const res = await files.create({
      pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
      purpose: 'fine-tune',
    });

    assert.ok('id' in res);
    assert.strictEqual(res.status, 'processed');
    // TODO: IDK what is this
    tested.fineTune.file.id = res.id;
  });

  await t.test('Creare assistant file', async () => {
    const res = await files.create({
      pathToFile: ASSISTANTS + '/test.csv',
      purpose: 'assistants',
    });

    assert.ok('id' in res);
    assert.strictEqual(res.status, 'processed');
    // TODO: IDK what is this
    tested.assistant.file.id = res.id;
  });

  await t.test('List files', async () => {
    const res = await files.list();

    assert.ok(Array.isArray(res));
  });

  await t.test('Retrieve file', async () => {
    //    let file_id = tested.fineTune.file.id;
    const res = await files.retrieve({ file_id });

    assert.ok('id' in res);
    assert.strictEqual(res.id, file_id);
  });

  await t.test('Retrieve file content', async () => {
    // let file_id = tested.fineTune.file.id;
    const res = await files.content({ file_id });

    assert.strictEqual(typeof res, 'string');
  });

  await t.test('Delete file', async () => {
    // let file_id = tested.fineTune.file.id;
    const res = await files.del({ file_id });

    assert.ok('id' in res);
    assert.strictEqual(res.id, file_id);
    assert.strictEqual(res.deleted, true);
  });
});

test('Openai Fine Tune', async (t) => {
  await t.test('Create Fine Tune job', async () => {
    // let file_id = tested.fineTune.file.id;
    const res = await fineTune.create({
      pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
    });
    assert.ok('id' in res);
    assert.strictEqual(res.error.error, null);
    // TODO: IDK what is this
    tested.fineTune.id = res.id;
    tested.fineTune.file.id = res.training_file;
  });
  await t.test('Create Fine Tune from training file', async () => {
    // let file_id = tested.fineTune.file.id;
    const res = await fineTune.create({ training_file: file_id });

    assert.ok('id' in res);
    assert.strictEqual(res.error.error, null);
    // tested.fineTune.id = res.id;
  });
  //  Does not work
  //  test('Get Fine Tune events', async () => {
  //     // let ftJobId = tested.fineTune.id;
  //     const res = await fineTune.events({id:ftJobId})
  //  });
  await t.test('List Fine Tune jobs', async () => {
    const res = await fineTune.list();

    assert.ok(Array.isArray(res));
  });

  await t.test('Retrieve Fine Tune job', async () => {
    //    let ftJobId = tested.fineTune.id;
    const res = await fineTune.retrieve({ id: ftJobId });

    assert.ok('id' in res);
    assert.strictEqual(res.id, ftJobId);
  });
  //  Require to catch error if job is completed
  //  test('Cancel Fine Tune job', async () => {
  //     //    let ftJobId = tested.fineTune.id;
  //     const fn = async () => await fineTune.cancel({id:ftJobId});
  //     expect(fn).toThrow(TypeError);
  //  });
});

test('Openai Models', async (t) => {
  await t.test('List models', async () => {
    const res = await models.list();

    assert.ok(Array.isArray(res));
    // TODO: IDK what is this
    const custom_model = res.find((model) => model.id.startsWith('ft'));
    tested.model.id = custom_model.id;
  });

  await t.test('Retrieve model', async () => {
    const res = await models.retrieve({ model_id: modelId });

    assert.ok('id' in res);
    assert.strictEqual(res.id, modelId);
  });
  // test('Delete model', async () => {
  //     const res = await models.del({model_id:modelId});
  //     expect(res).toHaveProperty('deleted');
  //     expect(res.deleted).toBe(true);
  // });
});

test('Openai Audio', async (t) => {
  await t.test('textToSpeech', async () => {
    const pathToFile = AUDIOS + '/test-speech-output-en.mp3';
    await fs.promises.unlink(pathToFile).catch(console.error);
    const res = await speech.textToSpeech({
      text: 'Hello, how can I help you?',
      pathToFile,
    });
    const stat = await fs.promises.stat(pathToFile);

    assert.ok(Buffer.isBuffer(res));
    assert.ok('uid' in stat);
  });

  await t.test('speechToText', async () => {
    const pathToFile = AUDIOS + '/test-speech-input-en.mp3';
    const res = await speech.speechToText({ pathToFile });

    assert.strictEqual(typeof res, 'string');
  });

  await t.test('Speech Translation', async () => {
    const pathToFile = AUDIOS + '/test-speech-input-ru.mp3';
    const res = await speech.speechTranslation({ pathToFile });

    assert.strictEqual(typeof res, 'string');
  });
});

test('Openai Images', async (t) => {
  await t.test('Image Generation', async () => {
    const saveAs = IMAGES + '/test-image-create-result.jpg';
    // try {
    //     await fs.promises.unlink(pathToFile)
    // } catch (error) {}

    const res = await images.create({ text: 'a white siamese cat', saveAs });
    // const stat = await fs.promises.stat(pathToFile);
    assert.ok('url' in res);
    assert.ok('local' in res);
  });

  await t.test('Image Edit', async () => {
    const saveAs = IMAGES + '/test-edit-image-result.jpg';
    // try {
    //     await fs.promises.unlink(saveAs)
    // } catch (error) {}

    const res = await images.edit({
      text: 'A futuristic landscape behind a foregraund emoticon',
      pathToFile: IMAGES + '/test-edit-image.png',
      pathToMask: IMAGES + '/test-edit-image.png',
      saveAs,
      size: '256x256',
    });
    // const stat = await fs.promises.stat(saveAs);
    assert.ok('url' in res);
    assert.ok('local' in res);
    // expect(stat).toHaveProperty('uid');
  });

  await t.test('Image Variation', async () => {
    const pathToFile = IMAGES + '/test-edit-image.png';
    const saveAs = IMAGES + '/test-image-variation-result.jpg';
    // try {
    //     await fs.promises.unlink(saveAs)
    // } catch (error) {}

    const res = await images.variation({ pathToFile, saveAs });
    // const stat = await fs.promises.stat(saveAs);

    assert.ok('url' in res);
    assert.ok('local' in res);
    // expect(stat).toHaveProperty('uid');
  });
});

test('Openai Recognition', async (t) => {
  await t.test('Image Recognition', async () => {
    const pathToFile = IMAGES + '/test-image.jpg';
    const res = await recognition.image({ pathToFile });

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
  // });
});
