import { Router } from 'express';
import { predict, trainNetworkModel } from '../services';

let routes = Router();

routes.use((req, res, next) => {
  console.group('Incoming request');
  console.log(`[${new Date().getTime()}] - ${JSON.stringify(req.originalUrl)}`);
  console.groupEnd();
  next();
});

routes.post('/train/:iterations', async (req, res) => {
  try {
    const {
      body,
      params: { iterations },
    } = req;
    const result = await trainNetworkModel(body, iterations);
    handleResponse(res, result);
  } catch (e) {
    res.status(500).json(e);
  }
});

routes.get('/predict/:phrase', async (req, res) => {
  try {
    const {
      params: { phrase },
    } = req;
    const result = await predict(phrase);
    handleResponse(res, result);
  } catch (e) {
    console.error(e);
    res.status(500).json(e.message);
  }
});

const handleResponse = (response, result) => {
  result ? response.json(result) : response.sendStatus(404);
};

export default routes;
