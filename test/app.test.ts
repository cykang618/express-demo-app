import request from 'supertest';
import { mocked } from 'ts-jest/utils';
import app from '../src/app';
import { getRepository } from 'typeorm';
import { getRequestId } from '../src/logger';

jest.mock('typeorm', () => {
  return {
    getRepository: jest.fn(),
    Entity: jest.fn(),
    Column: jest.fn(),
    PrimaryColumn: jest.fn()
  }
});

const getRepoMock = mocked(getRepository);
const mockedRepo: any = {
  findOne: jest.fn(),
  insert: jest.fn()
};

jest.mock('../src/logger', () => {
  const originalModule = jest.requireActual('../src/logger');
  const mockedGetRequestId = jest.fn(() => {
    return originalModule.getRequestId();
  });
  const mockedLog = jest.fn(() => {
    mockedGetRequestId();
    return;
  });
  const mockedLogger = {
    log: mockedLog,
    error: mockedLog,
    info: mockedLog,
    silly: mockedLog
  };

  return {
    __esModule: true,
    ...originalModule,
    getRequestId: mockedGetRequestId,
    default: mockedLogger
  };
});

const mockedGetRequestId = mocked(getRequestId);

beforeEach(() => {
  getRepoMock.mockReturnValueOnce(mockedRepo);
});

afterEach(() => {
  jest.clearAllMocks();
});

describe('API test', () => {
  describe('Default routes', () => {
    test('Wrong URL should return 404', async () => {
      await request(app).get('/abc').expect(404);
    });
  });

  describe('GET /api/<id>', () => {
    test('Should return 404 when record not exists', async () => {
      mockedRepo.findOne.mockResolvedValue();
      const res = await request(app).get('/api/123').expect(404);
      expect(res.body).toHaveProperty('error', 'ENotFound');
      expect(mockedRepo.findOne).toHaveBeenCalledWith({id: 123});
      expect(mockedRepo.findOne).toHaveBeenCalledTimes(1);
    });

    test('Should return corresponding data when record exists', async () => {
      const record = { id: 123, content: 'test content' };
      mockedRepo.findOne.mockResolvedValue(record);
      const res = await request(app).get('/api/123').expect(200);
      expect(res.body).toHaveProperty('record', record);
      expect(mockedRepo.findOne).toHaveBeenCalledWith({id: 123});
      expect(mockedRepo.findOne).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /api/<id>', () => {
    test('Should return 400 when payload has wrong structure', async () => {
      const payload = { wrongField: 'wrong' };
      const res = await request(app).post('/api/123').send(payload).expect(400);
      expect(res.body).toHaveProperty('error', 'EInvalidRequestBody');
      expect(mockedRepo.insert).toHaveBeenCalledTimes(0);
    });

    test('Should return 403 when record already exists', async () => {
      const payload = { content: 'test content' };
      mockedRepo.insert.mockRejectedValue({ code: 'ER_DUP_ENTRY' });
      const res = await request(app).post('/api/123').send(payload).expect(403);
      expect(res.body).toHaveProperty('error', 'ECannotInsert');
      expect(mockedRepo.insert).toHaveBeenCalledWith({ id: 123, ...payload });
      expect(mockedRepo.insert).toHaveBeenCalledTimes(1);
    });

    test('Should return 500 when database throw unexpected error', async () => {
      const payload = { content: 'test content' };
      mockedRepo.insert.mockRejectedValue();
      const res = await request(app).post('/api/123').send(payload).expect(500);
      expect(res.body).toHaveProperty('error', 'EUnexpected');
      expect(mockedRepo.insert).toHaveBeenCalledWith({ id: 123, ...payload });
      expect(mockedRepo.insert).toHaveBeenCalledTimes(1);
    });

    test('Should return corresponding data when record successfully inserted', async () => {
      const payload = { content: 'test content' };
      mockedRepo.insert.mockResolvedValue();
      const res = await request(app).post('/api/123').send(payload).expect(200);
      expect(res.body).toHaveProperty('result', { record: { id: 123, ...payload } });
      expect(mockedRepo.insert).toHaveBeenCalledWith({ id: 123, ...payload });
      expect(mockedRepo.insert).toHaveBeenCalledTimes(1);
    });
  });
});

describe('Logger with request unique ID', () => {
  test('ID within the same request should be the same', async () => {
    await request(app).get('/api/123');
    expect(mockedGetRequestId).toHaveReturnedTimes(3);
    const id = mockedGetRequestId.mock.results[0].value;
    expect(mockedGetRequestId).toHaveNthReturnedWith(2, id);
    expect(mockedGetRequestId).toHaveNthReturnedWith(3, id);
  });

  test('ID from different requests should be different', async () => {
    await request(app).get('/abc');
    await request(app).get('/def');
    expect(mockedGetRequestId).toHaveReturnedTimes(2);
    expect(mockedGetRequestId.mock.results[0].value)
      .not.toEqual(mockedGetRequestId.mock.results[1].value);
  });
});
