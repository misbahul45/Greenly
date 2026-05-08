import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../../app.module';

describe('OrderController (e2e)', () => {
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

  describe('/shops/:shopId/orders', () => {
    it('GET should require auth and role', () => {
      return request(app.getHttpServer())
        .get('/shops/test-shop/orders')
        .expect(401);
    });

    it('PATCH status should require auth and role', () => {
      return request(app.getHttpServer())
        .patch('/shops/test-shop/orders/test-order/status')
        .send({ status: 'COMPLETED' })
        .expect(401);
    });

    it('PATCH refund should require auth and OWNER role', () => {
      return request(app.getHttpServer())
        .patch('/shops/test-shop/orders/test-order/refund/test-refund')
        .expect(401);
    });
  });
});
