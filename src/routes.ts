import express from 'express';
import logger from './logger';
import * as RecordController from './controllers/record'

const router = express.Router();

router.get('/favicon.ico', (req, res) => res.status(204).end() );

router.get('/api/:recordId(\\d+)', RecordController.get);
router.post('/api/:recordId(\\d+)', RecordController.post);

router.all('/*', (req, res) => {
  if (!res.headersSent) {
    return res.status(404).json({
      error: 'ENotFound',
      reason: 'Incorrect path'
    });
  }
})

export default router;
