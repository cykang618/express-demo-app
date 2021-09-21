import 'dotenv/config';

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { MysqlConnectionOptions } from 'typeorm/driver/mysql/MysqlConnectionOptions';
import app from './app';
import logger from './logger';

const PORT = process.env.PORT || 8000;

async function serve() {
  try {
    logger.info('Connecting to MySQL server ...');
    const connection = await createConnection();
    const options = connection.options as MysqlConnectionOptions;
    const url = options.url ||
      `${options.username}@${options.host}:${options.port}/${options.database}`;
    logger.info(`Connected to MySQL server at ${url}`);

    app.listen(PORT, () => {
      logger.info(`Server is running on localhost:${PORT} ` + 
                  `with mode ${process.env.NODE_ENV}`);
    });
  } catch (err: any) {
    logger.error(`Failed to connect to MySQL server: ${err.message}`);
    setTimeout( () => serve(), 10000);
  }
}

serve();
