'use strict';

const { encoding_for_model } = require('tiktoken');
const { Tiktoken } = require('tiktoken/lite');
const cl100k_base = require('tiktoken/encoders/cl100k_base.json');

const tokens = {
  count({ text, model = 'gpt-4-turbo-2024-04-09' }) {
    let enc;
    try {
      enc = encoding_for_model(model);
    } catch (error) {
      enc = new Tiktoken(
        cl100k_base.bpe_ranks,
        cl100k_base.special_tokens,
        cl100k_base.pat_str,
      );
    }
    const tokens = enc.encode(text);
    enc.free();
    return tokens.length;
  },
};

module.exports = { tokens };

// tokens.count({text, model}) => integer
