import { Request, Response, NextFunction, RequestHandler } from 'express';
import logger from '../logger';

const requestWrapper = (
  handler: RequestHandler
): RequestHandler => async (req: Request, res: Response, next: NextFunction) => {
  try {
    await handler(req, res, next);
    next();
  } catch (err: any) {
    logger.log({
      level: 'error',
      message: `Unexpected error in request handler: ${err.message}`,
      error: err
    });
    next(err);
  }
};

export default requestWrapper;
