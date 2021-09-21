import { Request, Response, RequestHandler } from 'express';
import { getRepository } from 'typeorm';
import Record from '../../models/Record';
import logger from '../../logger';
import requestWrapper from '../../middlewares/request-wrapper';

const get: RequestHandler = async (req: Request, res: Response) => {
  const recordId: number = Number(req.params.recordId);
  logger.silly(`Get record with id : ${recordId}`);

  const recordRepository = getRepository(Record);
  const record = await recordRepository.findOne({ id: recordId});

  if (!record) {
    logger.silly(`Get record failed: not found`);
    return res.status(404).json({
      error: 'ENotFound',
      reason: 'Record not found'
    });
  }

  logger.silly(`Get record success`);
  return res.status(200).json({
    record: record
  });
};

export default requestWrapper(get);
