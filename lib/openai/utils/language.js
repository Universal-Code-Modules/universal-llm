'use strict';

const { callAPI } = require('../../common.js');
const { price } = require('./price.js');
const { defineTools } = require('./tools.js');
const { DEFAULT_MODELS } = require('../config.json');

//......Natural Language Processing (language).......

/*
you should accumulate the messages in the conversation and
send them all at once to the completion endpoint.

Example of messages:
  [{
    "role": "user",
    "content": "Hello, I'm a user."
  },{
    "role": "assistant",
    "content": "Hello, how can I help you?"
  },{
    "role": "user",
    "content": "Why roses are red?"
  }]

  Models:
  gpt-3.5-turbo - cheaper, less advanced
  gpt-4-turbo-2024-04-09 - more advanced, more expensive

*/

const language = (openai) => ({
  async generate({
    text,
    messages = [],
    system = 'You are a useful assistant.' +
      ' You can answer questions, provide information, and help with tasks.',
    model = DEFAULT_MODELS.completions,
    tools = [],
    tool_choice = 'auto',
  }) {
    const currentMessages = [
      ...messages,
      {
        role: 'user',
        content: text,
      },
    ];

    const params = {
      messages: [
        {
          role: 'system',
          content: system,
        },
        ...currentMessages,
      ],
      model,
    };

    let defs = { tools: [], functions: {} };
    if (Array.isArray(tools) && tools.length > 0) {
      defs = defineTools(tools);
      params.tools = defs.tools;
      params.tool_choice = tool_choice;
    }
    // return params;
    let completion = await callAPI(
      openai.chat.completions,
      'openai.chat.completions.create',
      params,
    );
    if (completion.error) return completion;

    let responseMessage = completion.choices[0].message;

    const usages = [completion.usage];

    if (responseMessage.tool_calls) {
      params.messages.push(responseMessage);

      for (const toolCall of responseMessage.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = defs.functions[functionName];
        if (!functionToCall) {
          throw new Error(`Function ${functionName} not found`);
        }

        const { fn, scope } = functionToCall;
        const args = JSON.parse(toolCall.function.arguments);
        console.log({ functionName, functionToCall, args });
        const functionResponse = await fn.call(scope, args);
        console.log({ functionResponse });

        params.messages.push({
          tool_call_id: toolCall.id,
          role: 'tool',
          name: functionName,
          content: functionResponse,
        });
      }

      completion = await callAPI(
        openai.chat.completions,
        'openai.chat.completions.create',
        params,
      );
      if (completion.error) return completion;
      responseMessage = completion.choices[0].message;
      usages.push(completion.usage);

      // console.log({completion, responseMessage})
    }

    currentMessages.push(responseMessage);
    const usageAndPrices = price.calculateByUsage({
      purpose: 'completion',
      model,
      usages,
    });

    return {
      message: responseMessage.content,
      messages: currentMessages,
      usage: usageAndPrices,
    };
  },

  async embedding({ text = 'Sample text', model = DEFAULT_MODELS.embedding }) {
    const response = await callAPI(
      openai.embeddings,
      'openai.embeddings.create',
      {
        model,
        input: text,
        encoding_format: 'float',
      },
    );
    if (response.error) return response;
    const usageAndPrices = price.calculateByUsage({
      purpose: 'embedding',
      model,
      usage: response.usage,
    });
    return { embedding: response.data[0].embedding, usage: usageAndPrices };
  },

  async classification({ text, model = DEFAULT_MODELS.classification }) {
    const response = await callAPI(
      openai.moderations,
      'openai.moderations.create',
      {
        input: text,
        model,
      },
    );
    if (response.error) return response;
    return response.results[0];
  },
});

module.exports = { language };

// language.generate({text, messages, system, model, tools, tool_choice}) =>
// {message, messages, usages}
// language.embedding({text, model}) => {embedding, usage}
// language.classification({text, model}) => response
