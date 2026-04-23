import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../../app.module';

describe('FinanceController (e2e)', () => {
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

  describe('/shops/:shopId/finance', () => {
    it('GET /balance should require auth and role', () => {
      return request(app.getHttpServer())
        .get('/shops/test-shop/balance')
        .expect(401);
    });

    it('POST /payout should require auth and OWNER role', () => {
      return request(app.getHttpServer())
        .post('/shops/test-shop/payout')
        .send({ amount: 100 })
        .expect(401);
    });
  });
});
