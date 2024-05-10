# Universal LLMs

This module should manage interactions with AI language models. For starters: Openai, Huggingface, Ollama and Elevenlabs.

## Requirements

Install [ffmpeg](https://ffmpeg.org/) for audio and video processing.

```bash
npm install
```

Create in the root directory .env file with the following content:

```
OPENAI_API_KEY=<string?>
HUGGINGFACE_TOKEN=<string?>
ELEVENLABS_API_KEY=<string?>
```

Fill the .env file with the following data:

- Register free openai account and get the API key (for developers of LLM module)
- Register free huggingface account and get the token (for developers of LLM module)
- Register free elevenlabs account and get the API key (for developers using Elevenlabs speech-to-text module)

Check periodically changes of the package.json file and install the new dependencies.

All non private global settings, like port numbers etc. you should store in config.json

### LLM

**Openai** - there is the connector class managing many kinds of interactions with the Openai API, mostly self explanatory.
I will add image generations in the nearest future. You should have an openai account and the [API key](https://platform.openai.com/api-keys) in .env file.

**Huggingface** - there is the connector class managing many kinds of interactions with the Huggingface API to multiple open-source LLMs, mostly self explanatory.
You should obtain [Hugginface token](https://huggingface.co/settings/tokens) and place it in .env file.
To compare manually performance and quality of open source models in parallel you can use [lmsys.org](https://chat.lmsys.org/).

**Ollama** - there is the connector class managing many kinds of interactions with multiple local LLMs.
You should install [Ollama](https://github.com/ollama/ollama) on your local machine to use this module. Then run following commands (with your preferred model - in this case llama2):

```
ollama serve
ollama run llama2
```

**Elevenlabs** - one of the most popular speech-to-text services. There is the connector class managing many kinds of interactions with the Elevenlabs API, mostly self explanatory. You should obtain [Elevenlabs API key](https://www.eleven-labs.com/en/docs/speech-to-text/getting-started) and place it in .env file.

## Testing

```bash
npm t
```

Alternatively, you can check manually if a method works by placing following code in the main.js file in the root (in this case we testing Elevenlabs module):

```javascript
const { openai } = require('./lib');

const { Chat } = openai;

const chat = new Chat({ apiKey: process.env.OPENAI_API_KEY });

(async () => {
  const msg = await chat.message({ text: 'Hello!' });
  console.log({ msg });
})();
```

Use common.callAPI universal method to call API endpoints in modules.

If LOG_API_CALL_TIME config variable is set to true, each method should measure and print the each API call time.

If LOG_API_CALL_RESULT config variable is set to true, each method should print the full api responce to pick required portion of data to return from a method.

For those who unfamiliar with backend, you run following command in the terminal:

```bash
node --env-file=.env main.js
```

Just don't forget to remove the code from the index.js file after testing.

## Diagnostics

I would like to use [Clinic.js](https://clinicjs.org/) for diagnostics, but we may set other systems in parrallel.
To use it, you should install it globally with npm install -g clinic and then run it with clinic doctor command. [Read more](https://clinicjs.org/documentation/) and check [examples](https://github.com/clinicjs/node-clinic-doctor-examples).

```bash
npm install -g clinic
npm install -g autocannon
clinic doctor -- node server.js

```

## Deployment

A user peak a required module folder (the folder should contain all the necessary files, except common.js in the lib).
The functionality of a module should be tested on the local machine and then deployed to the cloud.
A user should manually peak and install the module dependencies from the package.json.

## Contributing

Anyone is welcome to contribute to the project. The project is open for the public and I would like to keep it that way.
Peak a module you see a potential in and start working on it.

## TODO list

- Write tests for openaAI assisitants
- Finish Huggingface module and write JEST tests
- Add price calculation for all methods that return usage statistics
- Add price estimation function for all methods, that do not return usage statistics
- Add "my\_" prefix to all generated dusting tests files, so git will ignore them
- Make frontend allowing to interact with multiple LLMs in parralel and compare output
- Connect the frontend to openai, huggingface and ollama modules
- Make frontend to visualise dialogues and all other interactions with LLMs
- Allow dinamic API_KEY definition (stored on frontend side)

##

To be continued...
