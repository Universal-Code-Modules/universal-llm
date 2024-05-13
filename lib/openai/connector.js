'use strict';

const OpenAI = require('openai');
const { measureTime, formatMeasureTime } = require('../common.js');
const { tokens, language, speech } = require('./utils');
const { DEFAULT_MODELS, DEFAULT_VOICE } = require('./config.json');
const utils = require('./utils');

// const apiKey = process.env['OPENAI_API_KEY'] || 'stubKey';
// const openai = new OpenAI({ apiKey });

class Chat {
  //temperature = 0.7, topP = 1, frequencyPenalty = 0
  //presencePenalty = 0, stop = ["\n", ""]
  constructor({
    apiKey,
    system,
    model = DEFAULT_MODELS.completions,
    tools,
    maxTokens = 1000,
    // maxPrice = 0.1,
  }) {
    this.openai = new OpenAI({ apiKey });
    this.system = system;
    this.model = model;
    this.tools = tools;
    this.maxTokens = maxTokens;
    // this.maxPrice = maxPrice;

    this.messages = [];
    this.tokens = 0;
    this.price = 0;

    // throw new Error(`Max ${maxTokens} tokens exceeded`);
  }

  async message({ text }) {
    const tokenCount = tokens.count({ text, model: this.model });
    const { maxTokens, model } = this;

    const increaseMaxTokens = tokens + tokenCount > maxTokens;
    if (increaseMaxTokens) {
      throw new Error(`Max ${this.maxTokens} tokens exceeded`);
    }

    const res = await language(this.openai).generate({
      text,
      model,
      messages: this.messages,
      system: this.system,
      tools: this.tools,
    });

    if (res.error) return res.error.message;

    this.messages = res.messages;
    this.tokens += res.usage.total_tokens;
    this.price += res.usage.total_price;

    return res.message;
  }

  /*
 "text" argument - in case we do conversion on front end
 */
  async voiceMessage({
    text,
    inputFilePath,
    outputFilePath,
    voice = DEFAULT_VOICE,
    returnIntermediateResult = false,
  }) {
    const start = measureTime();
    let inputText = text;

    if (inputFilePath) {
      inputText = await speech(this.openai).speechToText({
        pathToFile: inputFilePath,
      });
    }
    const outputText = await this.message({ text: inputText });
    if (returnIntermediateResult) {
      return {
        inputText,
        outputText,
        outputFilePath,
        executionTime: formatMeasureTime(start),
      };
    }
    await speech(this.openai).textToSpeech({
      text: outputText,
      pathToFile: outputFilePath,
      voice,
    });
    return {
      inputText,
      outputText,
      outputFilePath,
      executionTime: formatMeasureTime(start),
    };
  }

  async voiceAnswer({
    inputText,
    outputText,
    outputFilePath,
    voice = DEFAULT_VOICE,
  }) {
    const start = measureTime();
    await speech(this.openai).textToSpeech({
      text: outputText,
      pathToFile: outputFilePath,
      voice,
    });
    return {
      inputText,
      outputText,
      outputFilePath,
      executionTime: formatMeasureTime(start),
    };
  }
}

class Assistant {
  constructor({
    assistant_id,
    thread_id,
    /*
      model = DEFAULT_MODELS.completions,
      maxTokens = 1000,
      maxPrice = 0.1,
    */
  }) {
    this.id = assistant_id;
    this.thread_id = thread_id;
    // this.model = model;
    // this.maxTokens = maxTokens;
    // this.maxPrice = maxPrice;

    this.messages = [];
    // this.tokens = 0;
    // this.price = 0;
  }

  // message({ text }) {}
}

module.exports = {
  Chat,
  Assistant,
  utils,
};

// Class chat
// chat.message({text}) => {message, messages, usages} => string
// chat.voiceMessage({inputFilePath, outputFilePath, voice}) =>
// {inputText, outputText, outputFilePath}
