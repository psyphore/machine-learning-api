import { config } from 'dotenv';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';
import { createServer } from 'http';
import { machineLearning } from './routes';

config();
const app = express();

app.use(cors());
app.use(json());
app.use('/ml', machineLearning);

const conf = {
  port: process.env.PORT,
  host: process.env.HOST,
};

const server = createServer(app);

server.listen(conf, () => {
  console.group('Server Start up');
  console.log(`🚀 Server ready on http://${conf.host}:${conf.port}`);
  console.groupEnd();
});
