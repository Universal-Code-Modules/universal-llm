'use strict';

const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { openai } = require('../lib');
const { Chat, utils } = openai;

const FILES = path.join(path.resolve(__dirname), '../files');
const OPEN_AI_FILES = path.join(FILES, 'openai');
const AUDIOS = path.join(OPEN_AI_FILES, 'audios');
const IMAGES = path.join(OPEN_AI_FILES, 'images');
const FINE_TUNE = path.join(OPEN_AI_FILES, 'fine-tune');
const ASSISTANTS = path.join(OPEN_AI_FILES, 'assistants');
const TOOLS = path.join(OPEN_AI_FILES, 'tools');
const testLibrary = require(TOOLS + '/test-library.js');

const API_KEY = process.env.OPENAI_API_KEY;

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
const file_id = 'file-X4ZR3WmEyxJKOEuyuthIIj9T';
const ftJobId = 'ftjob-WUootDAvgqK1iJlpTn1XZmoO';
const modelId = 'gpt-3.5-turbo-16k';

test('Openai Chat', async (t) => {
  await t.test('Chat message', async () => {
    const chat = new Chat({ apiKey: API_KEY });

    const res = await chat.message({ text: 'Hello' });

    assert.strictEqual(typeof res, 'string');
  });

  await t.test('Chat voice message', async () => {
    const chat = new Chat({ apiKey: API_KEY });

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

  await test('Openai Language', async (t) => {
    await t.test('Text completion', async () => {
      const chat = new Chat({ apiKey: API_KEY });

      const res = await language(chat.openai).generate({ text: 'hello' });

      assert.ok('message' in res);
      assert.ok('messages' in res);
      assert.ok('usage' in res);
    });

    await t.test('Text completeon with function call', async () => {
      const chat = new Chat({ apiKey: API_KEY });

      const res = await language(chat.openai).generate({
        text: 'What is the weather like in San Francisco, Tokyo and Paris?',
        tools: testLibrary.tools,
      });

      assert.ok('message' in res);
      assert.ok('messages' in res);
      assert.ok('usage' in res);
    });

    await t.test('Text Embedding', async () => {
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

    await test('Openai Files', async (t) => {
      // TODO: We need update test to without statement (tested.fineTune.file)
      await t.test('Count file tokens', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const res = await files(chat.openai).countFileTokens({
          pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
          purpose: 'fine-tune',
        });

        assert.strictEqual(res, 1889);
      });

      await t.test('Creare fine-tune file', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const res = await files(chat.openai).create({
          pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
          purpose: 'fine-tune',
        });

        assert.ok('id' in res);
        assert.strictEqual(res.status, 'processed');

        tested.fineTune.file.id = res.id;
      });

      await t.test('Create assistant file', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const res = await files(chat.openai).create({
          pathToFile: ASSISTANTS + '/test.csv',
          purpose: 'assistants',
        });

        assert.ok('id' in res);
        assert.strictEqual(res.status, 'processed');

        tested.assistant.file.id = res.id;
      });

      await t.test('List files', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const res = await files(chat.openai).list();

        assert.ok(Array.isArray(res));
      });

      await t.test('Retrieve file', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        let file_id = tested.fineTune.file.id;
        const res = await files(chat.openai).retrieve({ file_id });

        assert.ok('id' in res);
        assert.strictEqual(res.id, file_id);
      });

      await t.test('Retrieve file content', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        let file_id = tested.fineTune.file.id;
        const res = await files(chat.openai).content({ file_id });

        assert.strictEqual(typeof res, 'string');
      });

      await t.test('Delete file', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        let file_id = tested.fineTune.file.id;
        const res = await files(chat.openai).del({ file_id });

        assert.ok('id' in res);
        assert.strictEqual(res.id, file_id);
        assert.strictEqual(res.deleted, true);
      });
    });

    await test('Openai Fine Tune', async (t) => {
      await t.test('Create Fine Tune job', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        let file_id = tested.fineTune.file.id;
        const res = await fineTune(chat.openai).create({
          pathToFile: FINE_TUNE + '/test-fine-tune-24.jsonl',
        });

        assert.ok('id' in res);
        assert.deepEqual(res.error, {});

        tested.fineTune.id = res.id;
        tested.fineTune.file.id = res.training_file;
      });

      await t.test('Create Fine Tune from training file', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        let file_id = tested.fineTune.file.id;
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
      await t.test('List Fine Tune jobs', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const res = await fineTune(chat.openai).list();

        assert.ok(Array.isArray(res));
      });

      await t.test('Retrieve Fine Tune job', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        let ftJobId = tested.fineTune.id;
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
    });

    await test('Openai Models', async (t) => {
      await t.test('List models', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const res = await models(chat.openai).list();

        assert.ok(Array.isArray(res));

        const custom_model = res.find((model) => model.id.startsWith('ft'));
        tested.model.id = custom_model.id;
      });

      await t.test('Retrieve model', async () => {
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
    });

    await test('Openai Audio', async (t) => {
      await t.test('textToSpeech', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const pathToFile = AUDIOS + '/test-speech-output-en.mp3';
        await fs.promises.unlink(pathToFile).catch(console.error);
        const res = await speech(chat.openai).textToSpeech({
          text: 'Hello, how can I help you?',
          pathToFile,
        });
        const stat = await fs.promises.stat(pathToFile);

        assert.ok(Buffer.isBuffer(res));
        assert.ok('uid' in stat);
      });

      await t.test('speechToText', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const pathToFile = AUDIOS + '/test-speech-input-en.mp3';
        const res = await speech(chat.openai).speechToText({ pathToFile });

        assert.strictEqual(typeof res, 'string');
      });

      await t.test('Speech Translation', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const pathToFile = AUDIOS + '/test-speech-input-ru.mp3';
        const res = await speech(chat.openai).speechTranslation({ pathToFile });

        assert.strictEqual(typeof res, 'string');
      });
    });

    await test('Openai Images', async (t) => {
      await t.test('Image Generation', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const saveAs = IMAGES + '/test-image-create-result.jpg';
        // try {
        //     await fs.promises.unlink(pathToFile)
        // } catch (error) {}

        const res = await images(chat.openai).create({
          text: 'a white siamese cat',
          saveAs,
        });
        // const stat = await fs.promises.stat(pathToFile);
        assert.ok('url' in res);
        assert.ok('local' in res);
      });

      await t.test('Image Edit', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const saveAs = IMAGES + '/test-edit-image-result.jpg';
        // try {
        //     await fs.promises.unlink(saveAs)
        // } catch (error) {}

        const res = await images(chat.openai).edit({
          text: 'A futuristic landscape behind a foregraund emoticon',
          pathToFile: IMAGES + '/test-edit-image.png',
          pathToMask: IMAGES + '/test-edit-image.png',
          saveAs,
          size: '256x256',
        });
        // const stat = await fs.promises.stat(saveAs);
        // expect(stat).toHaveProperty('uid');
        assert.ok('url' in res);
        assert.ok('local' in res);
      });

      await t.test('Image Variation', async () => {
        const chat = new Chat({ apiKey: API_KEY });

        const pathToFile = IMAGES + '/test-edit-image.png';
        const saveAs = IMAGES + '/test-image-variation-result.jpg';
        // try {
        //     await fs.promises.unlink(saveAs)
        // } catch (error) {}

        const res = await images(chat.openai).variation({ pathToFile, saveAs });
        // const stat = await fs.promises.stat(saveAs);

        assert.ok('url' in res);
        assert.ok('local' in res);
        // expect(stat).toHaveProperty('uid');
      });
    });

    await test('Openai Recognition', async (t) => {
      await t.test('Image Recognition', async () => {
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
    });
  });
});
