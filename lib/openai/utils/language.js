'use strict';

const { callAPI } = require('../../common.js');
const { price } = require('./price.js');
const { defineTools } = require('./tools.js');
const { DEFAULT_MODELS, DEFAULT_SYSTEM } = require('../config.json');

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

const language = ({
  openai = null,
  measure = false,
  system = DEFAULT_SYSTEM,
}) => ({
  async tools(definedTools, params) {
    const result = await callAPI({
      measure,
      params: [params],
      library: openai.chat.completions,
      methodPath: 'openai.chat.completions.create',
    });

    const { message } = result.choices[0];
    if (!message.tool_calls) return result;

    const { messages } = params;
    messages.push(message);

    const usages = [result.usage];

    for (const toolCall of message.tool_calls) {
      const functionName = toolCall.function.name;
      const functionToCall = definedTools.functions[functionName];
      if (!functionToCall) {
        throw new Error(`Function ${functionName} not found`);
      }

      const { fn, scope } = functionToCall;
      const args = JSON.parse(toolCall.function.arguments);
      console.log({ functionName, functionToCall, args });
      const functionResponse = await fn.call(scope, args);
      console.log({ functionResponse });

      const newMessage = {
        tool_call_id: toolCall.id,
        role: 'tool',
        name: functionName,
        content: functionResponse,
      };

      messages.push(newMessage);
    }

    const answerRes = await callAPI({
      measure,
      params: [params],
      library: openai.chat.completions,
      methodPath: 'openai.chat.completions.create',
    });

    usages.push(answerRes.usage);
    messages.push(answerRes.choices[0].message);

    const usageAndPrices = await price.calculateByUsage({
      purpose: 'completion',
      model: params.model,
      usages,
    });

    return {
      ...result,
      usage: usageAndPrices,
      messages,
    };
  },

  async generate({
    text = '',
    messages = [],
    model = DEFAULT_MODELS.completions,
    tool_choice = 'auto',
    tools = [],
  }) {
    const params = {
      messages: [{ role: 'system', content: system }, ...messages],
      model,
    };

    if (text) params.messages.push({ role: 'user', content: text });

    if (tools.length > 0) {
      const definedTools = defineTools(tools);
      return await this.tools(definedTools, {
        ...params,
        tools: definedTools.tools,
        tool_choice,
      });
    }

    const result = await callAPI({
      measure,
      params: [params],
      library: openai.chat.completions,
      methodPath: 'openai.chat.completions.create',
    });

    return result;
  },

  async embedding({ text = 'Sample text', model = DEFAULT_MODELS.embedding }) {
    const params = {
      model,
      input: text,
      encoding_format: 'float',
    };
    const response = await callAPI({
      measure,
      params: [params],
      library: openai.embeddings,
      methodPath: 'openai.embeddings.create',
    });

    const usageAndPrices = price.calculateByUsage({
      purpose: 'embedding',
      model,
      usage: response.usage,
    });

    return { ...response, usage: usageAndPrices };
  },

  async classification({ text, model = DEFAULT_MODELS.classification }) {
    const params = {
      input: text,
      model,
    };
    const response = await callAPI({
      measure,
      params: [params],
      library: openai.classifications,
      methodPath: 'openai.classifications.create',
    });
    return response.results[0];
  },
});

module.exports = { language };

// language.generate({text, messages, system, model, tools, tool_choice}) =>
// {message, messages, usages}
// language.embedding({text, model}) => {embedding, usage}
// language.classification({text, model}) => response
