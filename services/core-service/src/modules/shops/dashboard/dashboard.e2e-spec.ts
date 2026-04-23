import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../../app.module';

describe('DashboardController (e2e)', () => {
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

  describe('/shops/:shopId/dashboard', () => {
    it('GET /summary should require auth and STAFF access', () => {
      return request(app.getHttpServer())
        .get('/shops/test-shop/dashboard/summary')
        .expect(401);
    });

    it('GET /revenue should require auth and OWNER access', () => {
      return request(app.getHttpServer())
        .get('/shops/test-shop/dashboard/revenue')
        .expect(401);
    });

    it('GET /recent-orders should require auth and STAFF access', () => {
       return request(app.getHttpServer())
        .get('/shops/test-shop/dashboard/recent-orders')
        .expect(401);
    });
  });
});
