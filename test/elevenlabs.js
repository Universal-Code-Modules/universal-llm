'use strict';

const test = require('node:test');
const assert = require('node:assert');
const { elevenlabs } = require('../lib');
const {
  textToSpeech,
  // textToSpeechStream,
  // getVoices,
  // getVoice,
  // editVoiceSettings,
  // getVoiceSettings,
  // deleteVoice,
  // getModels,
  // getUserInfo,
  // getUserSubscription,
  // getDefaultVoiceSettings,
} = elevenlabs;

test('Elevenlabs Connector', async (t) => {
  await t.test('textToSpeech', async () => {
    const res = await textToSpeech('hello');
    assert.ok(typeof res === 'object');
  });
  // await t.test('textToSpeechStream', async () => {
  //   const res = await textToSpeechStream('');
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getVoices', async () => {
  //   const res = await getVoices();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getVoice', async () => {
  //   const res = await getVoice();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('editVoiceSettings', async () => {
  //   const res = await editVoiceSettings();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getVoiceSettings', async () => {
  //   const res = await getVoiceSettings();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('deleteVoice', async () => {
  //   const res = await deleteVoice();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getModels', async () => {
  //   const res = await getModels();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getUserInfo', async () => {
  //   const res = await getUserInfo();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getUserSubscription', async () => {
  //   const res = await getUserSubscription();
  //   assert.ok(Array.isArray(res));
  // });
  // await t.test('getDefaultVoiceSettings', async () => {
  //   const res = await getDefaultVoiceSettings();
  //   assert.ok(Array.isArray(res));
  // });
});
