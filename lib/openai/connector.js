'use strict';

const OpenAI = require('openai');
const utils = require('./utils');
const { measureTime, formatMeasureTime } = require('../common.js');
const {
  DEFAULT_MODELS,
  DEFAULT_VOICE,
  DEFAULT_SYSTEM,
} = require('./config.json');

const { tokens, language, speech, price } = utils;

class Chat {
  #price = 0;
  #tokens = 0;
  #messages = null;
  //temperature = 0.7, topP = 1, frequencyPenalty = 0
  //presencePenalty = 0, stop = ["\n", ""]
  constructor(options = {}) {
    const {
      system = DEFAULT_SYSTEM,
      tools = [],
      maxTokens = 1000,
      messageOptions = {
        caching: false,
        handling: false,
        slice: false,
        size: 0,
      },
      maxPrice = 0.1,
      measure = false,
    } = options;
    this.system = system;
    this.tools = tools;
    this.maxTokens = maxTokens;
    this.maxPrice = maxPrice;
    this.measure = measure;
    this.messageOptions = messageOptions;
    this.openai = new OpenAI({ ...options });
    this.language = language(this);
    this.speech = speech(this);
    if (messageOptions.caching) {
      this.#messages = [
        {
          role: 'system',
          content: this.system,
        },
      ];
    }
  }

  #tokensExceeded(text, model) {
    const tokenCount = tokens.count({ text, model });
    return this.#tokens + tokenCount > this.maxTokens;
  }

  #priceExceeded() {
    if (this.maxPrice === 0) return false;
    return this.#price > this.maxPrice;
  }

  #checkLimits({ text, model }) {
    const tokensExceeded = this.#tokensExceeded(text, model);
    if (tokensExceeded) throw new Error('Tokens exceeded');
    const priceExceeded = this.#priceExceeded();
    if (priceExceeded) throw new Error('Price exceeded');
  }

  getUsage() {
    return {
      price: this.#price,
      tokens: this.#tokens,
      remain: {
        token: this.maxTokens - this.#tokens,
        price: (this.maxPrice - this.#price).toFixed(5),
      },
    };
  }

  #messagesHandler(options = {}) {
    const { size, slice } = this.messageOptions;
    const { text, choices } = options;

    const currentMessage = {
      role: 'user',
      content: text,
    };

    const messages = [...this.#messages, currentMessage];
    this.#messages = null;

    for (const { message } of choices) {
      const { role, content } = message;
      if (size !== 0 && messages.length >= size + 1) {
        if (!slice) throw new Error('Messages size exceeded');
        messages.shift();
      }
      messages.push({ role, content });
    }
    this.#messages = messages;
  }

  #calculateUsage({ usages, model, purpose = 'completion' }) {
    const usage = price.calculateByUsage({
      purpose,
      model,
      usages,
    });
    return usage;
  }

  #updateUsage({ total_price, total_tokens }) {
    this.#price += total_price;
    this.#tokens += total_tokens;
  }

  async message(options = {}) {
    const {
      text = '',
      messages = [],
      model = DEFAULT_MODELS.completions,
    } = options;

    this.#checkLimits({ text, model });

    const { handling } = this.messageOptions;

    const result = await this.language.generate({
      text,
      model,
      messages: handling ? this.#messages : messages,
    });

    const usage = this.#calculateUsage({ usages: [result.usage], model });
    this.#updateUsage(usage);

    if (!this.#messages) return { ...result, usage };
    this.#messagesHandler({ text, choices: result.choices });
    return { ...result, usage, messages: this.#messages };
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
  data,
};

// Class chat
// chat.message({text}) => {message, messages, usages} => string
// chat.voiceMessage({inputFilePath, outputFilePath, voice}) =>
// {inputText, outputText, outputFilePath}
