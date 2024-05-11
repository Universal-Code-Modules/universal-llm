# OpenAI/openai-connector.js 

## class `Chat`

Build conversation
 
- `constructor({system, model = DEFAULT_MODELS.completions, tools, maxTokens = 1000, maxPrice = 0.1})`
  - `system: ` 
  - `model: ` 
  - `tools: ` 
  - `maxTokens: ` 
  - `maxPrice: ` 
- `message ({text})`
- `voiceMessage ({text, inputFilePath, outputFilePath, voice = DEFAULT_VOICE, returnIntermediateResult = false})`
- `voiceAnswer ({inputText, outputText, outputFilePath, voice = DEFAULT_VOICE})`


## class `Assistant`



- `constructor({assistant_id, thread_id, model = DEFAULT_MODELS.completions, maxTokens = 1000, maxPrice = 0.1})`
- `message({text})`

- `defineTools(params = [])`


## object `language`



- `generate({text, messages = [], system = `You are a useful assistant. You can answer questions, provide information, and help with tasks.`, model = DEFAULT_MODELS.completions,  tools = [], tool_choice = "auto",})`
  - `text: string`
  - `messages: Array<string>`
  - `system: string`
  - `model: DEFAULT_MODELS.completions`
  - `tools: Array<>`
  - `tool_choice: "auto"`

- `embedding({text = "Sample text", model = DEFAULT_MODELS.embedding,})`
  - `text`
  - `model`

- `classification({ text, model = DEFAULT_MODELS.classification })`
  - `text`
  - `model`


## object `files`



- `countFileTokens({pathToFile, model = DEFAULT_MODELS.completions, })`
  - `pathToFile`
  - `model`

- `create({ pathToFile, purpose = "fine-tune" })`
  - `pathToFile`
  - `purpose`

- `list()`

- `retrieve({ file_id })`
  - `file_id`

- `content({ file_id })`
  - `file_id`

- `del({ file_id })`
  - `file_id`

## object `fineTune`





- `create({
    pathToFile,
    training_file,
    hyperparameters = {
      batch_size: "auto",
      learning_rate_multiplier: "auto",
      n_epochs: "auto",
    },
    suffix = "",
    model = DEFAULT_MODELS.fineTune,
    deleteFile = false,
    maxTokens = 0,
  })`
  - `pathToFile`
  - `training_file`
  - `hyperparameters`
    - `batch_size`
    - `learning_rate_multiplier`
    - `n_epochs`
  - `suffix`
  - `model`
  - `deleteFile`
  - `maxTokens`

- `list()`


- `events({ id, limit = 2 })`
  - `id`
  - `limit`

- `retrieve({ id })`
  - `id`

- `cancel({ id })`
  - `id`

## object `models`



- `list()`

- `retrieve({ model_id })`
  - `model_id`

- `del({ model_id })`
  - `model_id`

## object `speech`



- `textToSpeech({
    text,
    pathToFile = "./tests/test-speech.mp3",
    voice = DEFAULT_VOICE,
    speed = 1.0,
    model = DEFAULT_MODELS.textToSpeech,
  })`
  - `text`
  - `pathToFile`
  - `voice`
  - `speed`
  - `model`

- `speechToText({
    pathToFile = "./tests/test-speech.mp3",
    model = DEFAULT_MODELS.speech,
  })`
  - `pathToFile`
  - `model`

- `speechTranslation({
    pathToFile = "./tests/test-speech.mp3",
    model = DEFAULT_MODELS.speech,
  })`
  - `pathToFile`
  - `model`

## object `images`



- `create({
    text,
    saveAs = "",
    size = "1024x1024",
    quality = "standard",
    n = 1,
    model = DEFAULT_MODELS.imageCreate,
  })`
  - `text`
  - `saveAs`
  - `size`
  - `quality`
  - `n`
  - `model`

- `edit({
    text,
    pathToFile,
    pathToMask = "",
    saveAs = "",
    size = "1024x1024",
    n = 1,
    model = DEFAULT_MODELS.image,
  })`
  - `text`
  - `pathToFile`
  - `pathToMask`
  - `saveAs`
  - `size`
  - `n`
  - `model`

- `variation({
    pathToFile,
    saveAs = "",
    size = "1024x1024",
    n = 1,
    model = DEFAULT_MODELS.image,
  })`
  - `pathToFile`
  - `saveAs`
  - `size`
  - `n`
  - `model`

## object `recognition`



- `image({
    url,
    pathToFile,
    prompt = "What’s in this image?",
    detail = "auto",
    max_tokens = 300,
    model = DEFAULT_MODELS.vision,
  })`
  - `url`
  - `pathToFile`
  - `prompt`
  - `detail`
  - `max_tokens`
  - `model`

- `video({
    pathToFile,
    outputDir,
    max_tokens = 300,
    frameRate = 1,
    model = DEFAULT_MODELS.vision,
  })`
  - `pathToFile`
  - `outputDir`
  - `max_tokens`
  - `frameRate`
  - `model`

## object `assistants`

- `create({
    name,
    instructions,
    tools = [],
    model = DEFAULT_MODELS.completions,
  })`
  - `name`
  - `instructions`
  - `tools`
  - `model`
- `list()`
- `retrieve({ assistant_id })`
  - `assistant_id`
- `update({
    assistant_id,
    name,
    instructions,
    tools,
    model,
    file_ids,
  })`
  - `assistant_id`
  - `name`
  - `instructions`
  - `tools`
  - `model`
  - `file_ids`
- `del({ assistant_id })`
- `files: Object`
  - `create({ assistant_id, file_id })`
    - `assistant_id`
    - `file_id`
  - `list({ assistant_id })`
    - `assistant_id`
  - `retrieve({ assistant_id, file_id })`
    - `assistant_id`
    - `file_id`
  - `del({ assistant_id, file_id })`
    - `assistant_id`
    - `file_id`

- `threads: Object`
  - `create({ messages = [] })`
    - `messages: Array<>`
    - `createAndRun({ assistant_id, thread = { messages: [] } })`
      - `assistant_id `
      - `thread: Array<messages>`
    - `retrieve({ thread_id })`
      - `thread_id`
    - `update({ thread_id, params = {} })`
      - `thread_id`
      - `params`
    - `del({ thread_id })`
      - `thread_id`
    - `messages: Object`
      - `create({ thread_id, role = "user", content = "" })`
          - `thread_id`
          - `role`
          - `content`
      - `list({ thread_id, clean = false })`
        - `thread_id`
        - `clean: boolean`
      - `listFiles({ thread_id, message_id })`
        - `thread_id`
        - `message_id`
      - `retrieve({ thread_id, message_id })`
        - `thread_id`
        - `message_id`
      - `retrieveFile({ thread_id, message_id, file_id })`
        - `thread_id`
        - `message_id`
        - `file_id`
      - `update({
        thread_id,
        message_id,
        params = {
          metadata: {
            metadata: {
              modified: "true",
              user: "test",
            },
          },
        },
      })`
        - `thread_id`
        - `message_id`
        - `params: Object`
    - `runs: Object`
      - `create({ thread_id, assistant_id })`
        - `thread_id`
        - `assistant_id`
      - `list({ thread_id })`
        - `thread_id`
      - `retrieve({ thread_id, run_id })`
        - `thread_id`
        - `run_id`
      - `listRunSteps({ thread_id, run_id, limit = 20, clean })`
        - `thread_id`
        - `run_id`
        - `limit`
        - `clean`
      - `retrieveRunStep({ thread_id, run_id, step_id })`
        - `thread_id`
        - `run_id`
        - `step_id`
      - `update({ thread_id, run_id, props = {} })`
        - `thread_id`
        - `run_id`
        - `props: Object`
      - `submitToolOutput({
        thread_id,
        run_id,
        output = { tool_outputs: [] },
      })`
        - `thread_id`
        - `run_id`
        - `output: Object`
      - `cancel({ thread_id, run_id })`
        - `thread_id`
        - `run_id`
