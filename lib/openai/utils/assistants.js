'use strict';

const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

//.........ASSISTANTS.............
/*
  The main advantage of an assistant in comparison to completeon
  you don't have to send all the messages to OpenAI for each user interaction.
  You can send only a new message to the assistant and OpenAI will keep
  and manage the context of the conversation.
  The disadvantage is - you can't add or remove some other content to the
  conversation, like info from other models or any other data.
  And it's still beta -  sometimes it does not behave according to instructions
*/

/*
  name = "Math Tutor",
  instructions =
    "You are a personal math tutor. " +
    "Write and run code to answer math questions.",
  tools = [{ type: "code_interpreter" }],
  model = DEFAULT_MODELS.completions
*/

const assistants = (openai) => ({
  async create({
    name,
    instructions,
    tools = [],
    model = DEFAULT_MODELS.completions,
  }) {
    // tools = {type:code_interpreter}
    // {type:retrieval}, or {type:function,
    // function:{name, description, parameters:{type, properties, required}}}

    const response = await callAPI(
      openai.beta.assistants,
      'openai.beta.assistants.create',
      {
        name,
        instructions,
        tools,
        model,
      },
    );
    return response;
  },

  async list() {
    const response = await callAPI(
      openai.beta.assistants,
      'openai.beta.assistants.list',
    );
    if (response.error) return response;
    return response.data;
  },

  async retrieve({ assistant_id }) {
    const response = await callAPI(
      openai.beta.assistants,
      'openai.beta.assistants.retrieve',
      assistant_id,
    );
    return response;
  },

  async update({ assistant_id, name, instructions, tools, model, file_ids }) {
    const current_assistant = await assistants.retrieve({ assistant_id });
    const args = { name, instructions, tools, model, file_ids };
    const props = {};
    for (const key in args) {
      const arg = args[key];
      props[key] = arg || current_assistant[key];
    }
    const response = await callAPI(
      openai.beta.assistants,
      'openai.beta.assistants.update',
      assistant_id,
      props,
    );
    return response;
  },

  async del({ assistant_id }) {
    const response = await callAPI(
      openai.beta.assistants,
      'openai.beta.assistants.del',
      assistant_id,
    );
    return response;
  },

  files: {
    async create({ assistant_id, file_id }) {
      //purpose should be "assistants"
      const file = await callAPI(
        openai.beta.assistants.files,
        'openai.beta.assistants.files.create',
        assistant_id,
        { file_id },
      );
      return file;
    },

    async list({ assistant_id }) {
      const files = await callAPI(
        openai.beta.assistants.files,
        'openai.beta.assistants.files.list',
        assistant_id,
      );
      if (files.error) return files;
      return files.data;
    },

    async retrieve({ assistant_id, file_id }) {
      const file = await callAPI(
        openai.beta.assistants.files,
        'openai.beta.assistants.files.retrieve',
        assistant_id,
        file_id,
      );
      return file;
    },

    async del({ assistant_id, file_id }) {
      const file = await callAPI(
        openai.beta.assistants.files,
        'openai.beta.assistants.files.del',
        assistant_id,
        file_id,
      );
      return file;
    },
  },

  threads: {
    async create(/*{ messages = [] }*/) {
      const response = await callAPI(
        openai.beta.threads,
        'openai.beta.threads.create',
      );
      return response;
    },

    async createAndRun({ assistant_id, thread = { messages: [] } }) {
      const response = await callAPI(
        openai.beta.threads,
        'openai.beta.threads.createAndRun',
        { assistant_id, thread },
      );
      return response;
    },

    /*
      id = 'thread_D1Fc45AQAhZsywNdSAGReFpM'
      */
    async retrieve({ thread_id }) {
      const response = await callAPI(
        openai.beta.threads,
        'openai.beta.threads.retrieve',
        thread_id,
      );
      return response;
    },

    async update({ thread_id, params = {} }) {
      const response = await callAPI(
        openai.beta.threads,
        'openai.beta.threads.update',
        thread_id,
        params,
      );
      return response;
    },

    async del({ thread_id }) {
      const response = await callAPI(
        openai.beta.threads,
        'openai.beta.threads.del',
        thread_id,
      );
      return response;
    },

    messages: {
      async create({ thread_id, role = 'user', content = '' }) {
        // return console.log({thread_id, role, content});
        const response = await callAPI(
          openai.beta.threads.messages,
          'openai.beta.threads.messages.create',
          thread_id,
          {
            role,
            content,
          },
        );
        return response;
      },

      async list({ thread_id, clean = false }) {
        const response = await callAPI(
          openai.beta.threads.messages,
          'openai.beta.threads.messages.list',
          thread_id,
        );
        if (response.error) return response;
        if (clean) {
          const messages = [];
          for (const { data } of response) {
            messages.push(data.content);
          }
          // console.log({
          //   message0: messages[0][0].text,
          //   message1: messages[1][0].text,
          // });
          return messages;
        }
        return response;
      },

      async listFiles({ thread_id, message_id }) {
        const response = await callAPI(
          openai.beta.threads.messages,
          'openai.beta.threads.messages.files.list',
          thread_id,
          message_id,
        );
        if (response.error) return response;
        return response.data;
      },

      async retrieve({ thread_id, message_id }) {
        const response = await callAPI(
          openai.beta.threads.messages,
          'openai.beta.threads.messages.retrieve',
          thread_id,
          message_id,
        );
        return response;
      },

      async retrieveFile({ thread_id, message_id, file_id }) {
        const response = await callAPI(
          openai.beta.threads.messages.files,
          'openai.beta.threads.messages.files.retrieve',
          thread_id,
          message_id,
          file_id,
        );
        return response;
      },

      async update({
        thread_id,
        message_id,
        params = {
          metadata: {
            metadata: {
              modified: 'true',
              user: 'test',
            },
          },
        },
      }) {
        const response = await await callAPI(
          openai.beta.threads.messages,
          'openai.beta.threads.messages.update',
          thread_id,
          message_id,
          params,
        );
        return response;
      },
    },

    runs: {
      async create({ thread_id, assistant_id }) {
        const response = await callAPI(
          openai.beta.threads.runs,
          'openai.beta.threads.runs.create',
          thread_id,
          {
            assistant_id,
          },
        );
        return response;
      },

      async list({ thread_id }) {
        const response = await callAPI(
          openai.beta.threads.runs,
          'openai.beta.threads.runs.list',
          thread_id,
        );
        if (response.error) return response;
        return response.data;
      },

      async retrieve({ thread_id, run_id }) {
        const response = await callAPI(
          openai.beta.threads.runs,
          'openai.beta.threads.runs.retrieve',
          thread_id,
          run_id,
        );
        return response;
      },

      // .....logs
      async listRunSteps({ thread_id, run_id, /* limit = 20,*/ clean }) {
        const response = await callAPI(
          openai.beta.threads.runs.steps,
          'openai.beta.threads.runs.steps.list',
          thread_id,
          run_id,
        );
        if (response.error) return response;
        if (!clean) return response;
        const size = response.data.length;
        const steps = new Array(size).fill(Object.create(null));
        for (let i = 0; i < size; i++) {
          const { step_details: details, usage } = response.data[i];
          steps[i] = { details, usage };
        }
        return steps;
      },

      async retrieveRunStep({ thread_id, run_id, step_id }) {
        const response = await callAPI(
          openai.beta.threads.runs.steps,
          'openai.beta.threads.runs.steps.retrieve',
          thread_id,
          run_id,
          step_id,
        );
        return response;
      },

      async update({ thread_id, run_id, props = {} }) {
        const response = await callAPI(
          openai.beta.threads.runs,
          'openai.beta.threads.runs.update',
          thread_id,
          run_id,
          props,
        );
        return response;
      },
      /*
        When a run has the status: "requires_action" and required_action.
        type is submit_tool_outputs,
        this endpoint can be used to submit the outputs from the tool
        calls once they're all completed.
        All outputs must be submitted in a single request.
        Like this
        {
            tool_outputs: [
              {
                tool_call_id: "call_001",
                output: "70 degrees and sunny.",
              },
            ],
        }
        */
      async submitToolOutput({
        thread_id,
        run_id,
        output = { tool_outputs: [] },
      }) {
        const response = await callAPI(
          openai.beta.threads.runs.steps.tools,
          'openai.beta.threads.runs.steps.tools.submit',
          thread_id,
          run_id,
          output,
        );
        return response;
      },

      async cancel({ thread_id, run_id }) {
        const response = await callAPI(
          openai.beta.threads.runs,
          'openai.beta.threads.runs.cancel',
          thread_id,
          run_id,
        );
        return response;
      },
    },
  },
});

module.exports = { assistants };

// assistants.create({name, instructions, tools, model}) => response
// assistants.list() => data (array)
// assistants.retrieve({assistant_id}) => response
// assistants.update({
// assistant_id, name, instructions, tools, model, file_ids
// }) => response
// assistants.del({assistant_id}) => response

// assistants.files.create({file_id}) => response
// assistants.files.list({assistant_id}) => data (array)
// assistants.files.retrieve({assistant_id, file_id}) => response
// assistants.files.del({assistant_id, file_id}) => response

// assistants.threads.create({messages = []}) => response
// assistants.threads.createAndRun({
// assistant_id, thread = {messages:[]}
// }) => response
// assistants.threads.retrieve({thread_id}) => response
// assistants.threads.update({thread_id, messages}) => response
// assistants.threads.del({thread_id}) => response

// assistants.threads.messages.create({thread_id, role, content}) => response
// assistants.threads.messages.list({thread_id, clean}) => data(array)
// assistants.threads.messages.listFiles({thread_id, message_id}) =>
// data (array) //does not work
// assistants.threads.messages.retrieve({thread_id, message_id}) => response
// assistants.threads.messages.retrieveFile({thread_id, message_id, file_id})
// => response
// assistants.threads.messages.update({thread_id, message_id, user_id}) =>
// response

// assistants.threads.runs.create({thread_id, assistant_id}) => response
// assistants.threads.runs.list({thread_id}) => response
// assistants.threads.runs.retrieve({thread_id, run_id}) => response
// assistants.threads.runs.listRunSteps({thread_id, run_id, limit, clean}) =>
// response
// assistants.threads.runs.retrieveRunStep({thread_id, run_id, step_id}) =>
// response
// assistants.threads.runs.update({thread_id, run_id, data}) => response
// assistants.threads.runs.submitToolOutput({thread_id, run_id, output}) =>
// response
// assistants.threads.runs.cancel({thread_id, run_id}) => response
