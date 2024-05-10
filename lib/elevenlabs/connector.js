'use strict';

const ElevenLabs = require('elevenlabs-node');
const { callAPI } = require('../common.js');

const { ELEVENLABS_API_KEY: apiKey = 'stubKey' } = process.env;

const voice = new ElevenLabs({
  apiKey, // Your API key from Elevenlabs
  // voiceId: "pNInz6obpgDQGcFmaJgB",
  // A Voice ID from Elevenlabs (Adam)
});

/*
 Required Parameters
    fileName: "audio.mp3", // The name of your audio file
    textInput: "mozzy is cool", // The text you wish to convert to speech

 Optional Parameters
    voiceId: "21m00Tcm4TlvDq8ikWAM", // A different Voice ID from the default
    stability: 0.5, // The stability for the converted speech
    similarityBoost: 0.5, // The similarity boost for the converted speech
    modelId: "eleven_multilingual_v2", // The ElevenLabs Model ID
    style: 1, // The style exaggeration for the converted speech
    speakerBoost: true // The speaker boost for the converted speech


  fileName and file path for your audio file e.g (./gen/hello) String
  textInput Text to be converted into audio e.g (Hello) String
  stability Stability for Text to Speech default (0) Float
  similarityBoost Similarity Boost for Text to Speech default (0) Float
  voiceId ElevenLabs  Voice ID e.g (pNInz6obpgDQGcFmaJgB) String
  modelId ElevenLabs  Model ID e.g (eleven_multilingual_v2) String
  responseType Streaming response type e.g (stream) String
  speakerBoost Speaker Boost for Text to Speech e.g (true) Boolean
  style Style Exaggeration for Text to Speech (0-100) default (0) Integer
*/

const textToSpeech = async (
  textInput = 'Hello World',
  fileName = process.cwd() + '/files/elevenlabs/audio.mp3',
  voiceId = 'pNInz6obpgDQGcFmaJgB',
) => {
  const result = await callAPI(voice, 'voice.textToSpeech', {
    textInput,
    fileName,
    voiceId,
  });
  return result;
};
//{voiceId, textInput, stability, similarityBoost,
//modelId, responseType, style, speakerBoost}
const textToSpeechStream = async (
  voiceId,
  textInput,
  stability,
  similarityBoost,
  modelId,
  responseType,
  style,
  speakerBoost,
) => {
  await callAPI(voice, 'voice.textToSpeechStream', {
    voiceId,
    textInput,
    stability,
    similarityBoost,
    modelId,
    responseType,
    style,
    speakerBoost,
  });
};

const getVoices = async () => {
  const result = await callAPI(voice, 'voice.getVoices');
  return result;
};

const getVoice = async (voiceId = 'pNInz6obpgDQGcFmaJgB') => {
  const result = await callAPI(voice, 'voice.getVoice', { voiceId });
  return result;
};

const editVoiceSettings = async (voiceId, stability, similarityBoost) => {
  const result = await callAPI(voice, 'voice.editVoiceSettings', {
    voiceId,
    stability,
    similarityBoost,
  });
  return result;
};

const getVoiceSettings = async (voiceId) => {
  const result = await callAPI(voice, 'voice.getVoiceSettings', { voiceId });
  return result;
};

const deleteVoice = async (voiceId) => {
  const result = await callAPI(voice, 'voice.deleteVoice', { voiceId });
  return result;
};

const getModels = async () => {
  const result = await callAPI(voice, 'voice.getModels');
  return result;
};

const getUserInfo = async () => {
  const result = await callAPI(voice, 'voice.getUserInfo');
  return result;
};

const getUserSubscription = async () => {
  const result = await callAPI(voice, 'voice.getUserSubscription');
  return result;
};

const getDefaultVoiceSettings = async () => {
  const result = await callAPI(voice, 'voice.getDefaultVoiceSettings');
  return result;
};

// async deleteVoice(voiceId = "pNInz6obpgDQGcFmaJgB") {
//     const result = await voice.deleteVoice({ voiceId });
//     if (TEST) console.log(result);
//     return result;
// }

module.exports = {
  textToSpeech,
  textToSpeechStream,
  getVoices,
  getVoice,
  editVoiceSettings,
  getVoiceSettings,
  deleteVoice,
  getModels,
  getUserInfo,
  getUserSubscription,
  getDefaultVoiceSettings,
};
