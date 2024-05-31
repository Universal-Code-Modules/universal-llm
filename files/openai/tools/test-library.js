'use strict';

const locations = [
  {
    location: 'San Francisco, CA',
    temperature: '72',
    unit: 'fahrenheit',
    age: '72',
  },
  {
    location: 'Paris, France',
    temperature: '22',
    unit: 'fahrenheit',
    age: '22',
  },
  {
    location: 'Tokyo, Japan',
    temperature: '10',
    unit: 'celsius',
    age: '10',
  },
];

const getCurrentWeather = ({ location: targetLocation }) => {
  for (const { location, temperature, unit } of locations) {
    if (location === targetLocation) {
      const result = { location, temperature, unit };
      return JSON.stringify(result);
    }
  }
  return JSON.stringify({
    location,
    unit: 'unknown',
    temperature: 'unknown',
  });
};

const getCurrentAge = ({ location: targetLocation }) => {
  for (const { location, age, unit } of locations) {
    if (location === targetLocation) {
      const result = { location, age, unit };
      return JSON.stringify(result);
    }
  }
  return JSON.stringify({
    location,
    unit: 'unknown',
    age: 'unknown',
  });
};

const tools = [
  {
    // name: "get_current_weather",

    fn: getCurrentWeather,
    scope: this,
    description: 'Get the current weather in a given location',
    properties: {
      location: {
        type: 'string',
        description: 'The city and state, e.g. San Francisco, CA',
      },
      unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
    },
    required: ['location'],
  },
  {
    // name: "get_current_weather",

    fn: getCurrentAge,
    scope: this,
    description: 'Get the current population average age in a given location',
    properties: {
      location: {
        type: 'string',
        description: 'The city and state, e.g. San Francisco, CA',
      },
      unit: { type: 'string', enum: ['years', 'days'] },
    },
    required: ['location'],
  },
];

module.exports = {
  getCurrentWeather,
  getCurrentAge,
  tools,
};
