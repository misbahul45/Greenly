import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../../app.module';

describe('ApplicationController (e2e)', () => {
  let app: INestApplication;
  let rabbitmq: any;

  beforeAll(async () => {
    rabbitmq = { emit: jest.fn().mockReturnValue({ toPromise: jest.fn().mockResolvedValue(undefined) }) };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider('RABBITMQ_CLIENT')
    .useValue(rabbitmq)
    .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/shops/:shopId/application', () => {
    it('POST should require auth', () => {
      return request(app.getHttpServer())
        .post('/shops/test-shop/application')
        .send({ bankName: 'TEST' })
        .expect(401);
    });

    it('GET should require auth', () => {
      return request(app.getHttpServer())
        .get('/shops/test-shop/application')
        .expect(401);
    });
  });
});
