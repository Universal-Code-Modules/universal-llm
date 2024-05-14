'use strict';

const locations = [
  {
    location: 'San Francisco',
    temperature: '72',
    unit: 'fahrenheit',
    age: '72',
  },
  {
    location: 'Paris',
    temperature: '22',
    unit: 'fahrenheit',
    age: '22',
  },
  {
    location: 'Tokyo',
    temperature: '10',
    unit: 'celsius',
    age: '10',
  },
];

const getCurrentWeather = ({ location /*,unit = 'fahrenheit'*/ }) => {
  const targetLocation = location.toLowerCase();
  for (const expectedLocation of locations) {
    const { location } = expectedLocation;
    if (location.toLowerCase() === targetLocation) {
      const result = { ...expectedLocation };
      delete result.age;
      return JSON.stringify(result);
    }
  }
  return JSON.stringify({
    location,
    unit: 'unknown',
    temperature: 'unknown',
  });
};

const getCurrentAge = ({ location /*unit = 'years'*/ }) => {
  const targetLocation = location.toLowerCase();
  for (const expectedLocation of locations) {
    const { location } = expectedLocation;
    if (location.toLowerCase() === targetLocation) {
      const result = { ...expectedLocation };
      delete result.temperature;
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
