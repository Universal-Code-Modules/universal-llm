'use strict';

const { callAPI } = require('../../common.js');
const { DEFAULT_MODELS } = require('../config.json');

const defaultModels = DEFAULT_MODELS.tabular;

const tabular = (hf) => ({
  /*
    inputs = {
        data: {
        "Height": ["11.52", "12.48", "12.3778"],
        "Length1": ["23.2", "24", "23.9"],
        "Length2": ["25.4", "26.3", "26.5"],
        "Length3": ["30", "31.2", "31.1"],
        "Species": ["Bream", "Bream", "Bream"],
        "Width": ["4.02", "4.3056", "4.6961"]
        },
    },
  */
  async tabularRegression(inputs, model = defaultModels.tabularRegression) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.tabularRegression', args);
    return res;
  },

  /*
    inputs = {
        data: {
        "fixed_acidity": ["7.4", "7.8", "10.3"],
        "volatile_acidity": ["0.7", "0.88", "0.32"],
        "citric_acid": ["0", "0", "0.45"],
        "residual_sugar": ["1.9", "2.6", "6.4"],
        "chlorides": ["0.076", "0.098", "0.073"],
        "free_sulfur_dioxide": ["11", "25", "5"],
        "total_sulfur_dioxide": ["34", "67", "13"],
        "density": ["0.9978", "0.9968", "0.9976"],
        "pH": ["3.51", "3.2", "3.23"],
        "sulphates": ["0.56", "0.68", "0.82"],
        "alcohol": ["9.4", "9.8", "12.6"]
        },
    },
  */
  async tabularClassification(
    inputs,
    model = defaultModels.tabularClassification,
  ) {
    const args = { inputs, model };
    const res = await callAPI(hf, 'hf.tabularClassification', args);
    return res;
  },
});

module.exports = { tabular };
