import { Request, Response, RequestHandler } from 'express';
import { getRepository } from 'typeorm';
import Ajv, { JSONSchemaType, DefinedError } from 'ajv';
import Record from '../../models/Record';
import logger from '../../logger';
import requestWrapper from '../../middlewares/request-wrapper';

interface RecordPostBody {
  content: string
}

const schema: JSONSchemaType<RecordPostBody> = {
  type: 'object',
  properties: {
    content: { type: 'string'}
  },
  required: ['content'],
  additionalProperties: false
}

const validate = new Ajv().compile(schema);

const post: RequestHandler = async (req: Request, res: Response) => {
  if (!validate(req.body)) {
    const errors: DefinedError[] = validate.errors as DefinedError[];
    const message = errors.length ? errors[0].message : null;

    return res.status(400).json({
      error: 'EInvalidRequestBody',
      reason: message
    });
  }

  const recordId: number = Number(req.params.recordId);
  const { content } = req.body;
  logger.silly(`Post record with id ${recordId}`,
               { body: req.body });

  const recordRepository = getRepository(Record);
  const record = new Record();
  record.id = recordId;
  record.content = content;
  try {
    await recordRepository.insert(record);
  } catch (err: any) {
    if (err.code === 'ER_DUP_ENTRY') {
      logger.error(`Post record failed: entity exists`);
      return res.status(403).json({
        error: 'ECannotInsert',
        reason: 'Record already exists'
      });
    }
    throw err;
  }

  logger.silly('Post record success');
  return res.json({
    message: 'success',
    result: {
      record: record
    }
  });

};

export default requestWrapper(post)
