import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import requestLogger from './middlewares/requestLogger';
import errorHandler from './middlewares/errorHandler';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use('/api', routes);
app.use(errorHandler);

export default app;
