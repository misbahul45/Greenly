import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request = require('supertest');
import { AppModule } from '../../../app.module';

describe('MemberController (e2e)', () => {
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

  describe('/shops/:shopId/members', () => {
    it('POST should require auth and explicit guard permissions', () => {
      return request(app.getHttpServer())
        .post('/shops/test-shop/members')
        .send({ userId: 'u2', role: 'ADMIN' })
        .expect(401);
    });

    it('GET should require auth', () => {
      return request(app.getHttpServer())
        .get('/shops/test-shop/members')
        .expect(401);
    });
  });
});
