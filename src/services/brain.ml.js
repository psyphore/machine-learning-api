const brain = require('brain.js'),
  moment = require('moment'),
  { existsSync, readFile, writeFile } = require('fs'),
  { join } = require('path'),
  data = require('../configuration/data.training.json');

const network = new brain.recurrent.LSTM();

const networkPath = join(
  process.cwd(),
  'src',
  'training-models',
  `${moment().format('YYYYMMDD')}-training-cached.network.json`,
);

export const sampleNeuralNetwork = async () => {
  let duration = new Date().getTime();
  let networkData = null;

  if (existsSync(networkPath)) {
    console.group('reading from cached network model');
    networkData = await JSON.parse(readFile(networkPath));
    network.fromJSON(networkData);
    console.groupEnd();
  } else {
    console.group('training network model');
    let trainingDuration = new Date().getTime();

    const trainingData = data.map(item => ({
      input: item.text,
      output: item.category,
    }));

    await network.trainAsync(trainingData, {
      iterations: 10000,
    });

    trainingDuration -= new Date().getTime();
    trainingDuration = (trainingDuration * -1) / 1000;

    console.log(`all trained up in ${trainingDuration}s`);
    console.log('caching network model...');

    await writeFile(networkPath, JSON.stringify(network.toJSON(), null, 2));

    console.log('network model cached');
    console.groupEnd();
  }

  const input = 'I found 6 bugs my program';
  const output = network.run(input);

  duration -= new Date().getTime();
  duration = (duration * -1) / 1000;

  console.info(`input: '${input}', belongs to category: '${output}' @ ${duration}s`);
};

export const trainNetworkModel = async (trainingDataSet, iterations = 5000) => {
  console.group('training network model');
  let trainingDuration = new Date().getTime();
  console.log(`networkPath: ${networkPath}`);
  console.log(`trainingDataSet: ${trainingDataSet.length}`);
  const trainingData = trainingDataSet.map(item => ({
    input: item.text,
    output: item.category,
  }));

  await network.trainAsync(trainingData, {
    iterations,
  });

  trainingDuration -= new Date().getTime();
  trainingDuration = (trainingDuration * -1) / 1000;

  console.log(`all trained up in ${trainingDuration}s`);
  console.log('caching network model...');

  await writeFile(networkPath, JSON.stringify(network.toJSON(), null, 2));

  console.log('network model cached');
  console.groupEnd();

  return 'done';
};

export const predict = async input => {
  let networkData = null;
  if (existsSync(networkPath)) {
    console.group('reading from cached network model');

    networkData = await JSON.parse(readFile(networkPath));
    network.fromJSON(networkData);

    const output = network.run(input);
    console.groupEnd();

    return output;
  } else {
    throw new Error('No cached model found, please train me?');
  }
};
