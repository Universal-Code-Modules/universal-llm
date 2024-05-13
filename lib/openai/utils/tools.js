'use strict';

const getTool = ({ name, description, properties, required } = {}) => ({
  type: 'function',
  function: {
    name,
    description,
    parameters: {
      type: 'object',
      properties,
      required,
    },
  },
});

const defineTools = (params = []) => {
  const tools = new Array(params.length).fill(Object.create(null));
  const functions = {};

  for (let i = 0; i < params.length; i++) {
    const f = params[i];
    const name =
      f.name ||
      f.fn.name.replace(/([A-Z])/g, ($0, $1) => '_' + $1.toLowerCase());
    tools[i] = getTool({ ...f, name });
    const { fn, scope } = f;
    functions[name] = { fn, scope };
    // if (tool.type === 'code_interpreter'){
    //   functions.push({
    //     "type": "code_interpreter",
    //     "code": tool.code
    //   });
    // }
  }
  return { tools, functions };
};

module.exports = {
  defineTools,
};
