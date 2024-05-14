'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { elevenlabs } = require('../lib');
const {
  textToSpeech,
  getVoices,
  getVoice,
  getModels,
  getUserInfo,
  getUserSubscription,
  getDefaultVoiceSettings,
  // textToSpeechStream,
  // editVoiceSettings,
  // getVoiceSettings,
  // deleteVoice,
} = elevenlabs;

test('Elevenlabs Connector', async (t) => {
  await t.test('textToSpeech', async () => {
    const res = await textToSpeech('hello');

    assert.ok(typeof res === 'object');
    assert.ok('status' in res);
    assert.strictEqual(res.status, 'ok');
  });

  await t.test('getVoices', async () => {
    const res = await getVoices();

    assert.ok(typeof res === 'object');
    assert.ok('voices' in res);
    assert.ok(Array.isArray(res.voices));
  });

  await t.test('getVoice', async () => {
    const res = await getVoice();

    assert.ok(typeof res === 'object');
    assert.ok('voice_id' in res);
    assert.ok('name' in res);
    assert.ok('labels' in res);
    assert.ok('gender' in res.labels);
    assert.ok('accent' in res.labels);
  });

  await t.test('getModels', async () => {
    const res = await getModels();

    assert.ok(Array.isArray(res));

    for (const model of res) {
      assert.ok(typeof model === 'object');
      assert.ok('name' in model);
      assert.ok('model_id' in model);
      assert.ok('description' in model);
    }
  });

  await t.test('getUserInfo', async () => {
    const res = await getUserInfo();

    assert.ok(typeof res === 'object');
    assert.ok('subscription' in res);
    assert.ok('first_name' in res);
  });

  await t.test('getUserSubscription', async () => {
    const res = await getUserSubscription();

    assert.ok(typeof res === 'object');
    assert.ok('tier' in res);
    assert.ok('status' in res);
  });

  await t.test('getDefaultVoiceSettings', async () => {
    const res = await getDefaultVoiceSettings();

    assert.ok(typeof res === 'object');
    assert.ok('stability' in res);
  });

  //WARN : Return undefined

  /* await t.test('editVoiceSettings', async () => {
    const res = await editVoiceSettings();

    assert.ok(Array.isArray(res));
  });

  await t.test('getVoiceSettings', async () => {
    const res = await getVoiceSettings();
    console.log({ res });
    assert.ok(Array.isArray(res));
  });

  await t.test('textToSpeechStream', async () => {
    const res = await textToSpeechStream('');

    assert.ok(Array.isArray(res));
  });

  await t.test('deleteVoice', async () => {
    const res = await deleteVoice();

    assert.ok(Array.isArray(res));
  }); */
});
