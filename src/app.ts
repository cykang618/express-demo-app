import express, { Request, Response, NextFunction } from 'express'
import expressWinston from 'express-winston';
import routes from './routes';
import logger, { runWithRequestId } from './logger';

const app = express();

const logHttpRequest = expressWinston.logger({
  winstonInstance: logger,
  expressFormat: true,
  colorize: true,
  meta: true
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  runWithRequestId(next);
});

app.use(logHttpRequest);

app.use(routes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (res.headersSent) {
    return next(err);
  }

  return res.status(500).json({
    error: 'EUnexpected',
    reason: err.message
  });
});

export default app;
