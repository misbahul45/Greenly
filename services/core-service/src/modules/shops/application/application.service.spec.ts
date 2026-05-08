import { Test, TestingModule } from '@nestjs/testing';
import { ApplicationService } from './application.service';
import { ApplicationRepository } from './application.repository';
import { DatabaseService } from '../../../libs/database/database.service';
import { ShopApplicationPublisher } from '../publisher/shop.application.publisher';
import { ApplicationNotFoundError, InvalidStateTransitionError } from '../../../libs/errors/domain.error';
import { BadRequestException } from '@nestjs/common';

const mockCreateShopApplicationDTO = {
  bankName: 'BCA',
  bankAccount: '12345678',
  accountName: 'John Doe',
  idCardUrl: 'http://example.com/id.jpg',
};

describe('ApplicationService', () => {
  let service: ApplicationService;
  let repo: any;
  let publisher: any;
  let db: any;

  beforeEach(async () => {
    repo = {
      findShopApplicationByShopId: jest.fn(),
      updateByShopId: jest.fn(),
      create: jest.fn(),
      findAll: jest.fn(),
      findMyApplications: jest.fn(),
      deleteApplicationById: jest.fn(),
    };

    publisher = {
      publishApplicationSubmitted: jest.fn(),
      publishShopApproved: jest.fn(),
    };

    db = {
      $transaction: jest.fn((cb) => cb(db)),
      shopApplication: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      shop: {
        update: jest.fn(),
      },
      shopMember: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationService,
        { provide: ApplicationRepository, useValue: repo },
        { provide: ShopApplicationPublisher, useValue: publisher },
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<ApplicationService>(ApplicationService);
  });

  describe('review', () => {
    it('should throw ApplicationNotFoundError if not found', async () => {
      db.shopApplication.findUnique.mockResolvedValue(null);
      await expect(service.review('shop1', { status: 'APPROVED' })).rejects.toThrow(ApplicationNotFoundError);
    });

    it('should throw InvalidStateTransitionError if state is not PENDING/REVIEW', async () => {
      db.shopApplication.findUnique.mockResolvedValue({ status: 'REJECTED' });
      await expect(service.review('shop1', { status: 'APPROVED' })).rejects.toThrow(InvalidStateTransitionError);
    });

    it('should approve, add member, and emit event', async () => {
      db.shopApplication.findUnique.mockResolvedValue({
        id: 'app1',
        status: 'PENDING',
        shop: { ownerId: 'user1' },
      });
      db.shopApplication.update.mockResolvedValue({ id: 'app1', status: 'APPROVED' });
      db.shop.update.mockResolvedValue({ id: 'shop1', status: 'APPROVED' });
      db.shopMember.findUnique.mockResolvedValue(null);

      const result = await service.review('shop1', { status: 'APPROVED' });

      expect(db.shopMember.create).toHaveBeenCalled();
      expect(publisher.publishShopApproved).toHaveBeenCalledWith(expect.objectContaining({
        shopId: 'shop1',
        ownerId: 'user1',
      }));
      expect(result.data.status).toBe('APPROVED');
    });
  });

  describe('create', () => {
    it('should throw BadRequestException if application exists and is not rejected', async () => {
      repo.findShopApplicationByShopId.mockResolvedValue({ status: 'PENDING' });
      await expect(service.create('shop1', mockCreateShopApplicationDTO)).rejects.toThrow(BadRequestException);
    });

    it('should create new application and emit submitted event', async () => {
      repo.findShopApplicationByShopId.mockResolvedValue(null);
      repo.create.mockResolvedValue({ id: 'app1', status: 'PENDING' });

      const result = await service.create('shop1', mockCreateShopApplicationDTO);

      expect(repo.create).toHaveBeenCalled();
      expect(publisher.publishApplicationSubmitted).toHaveBeenCalled();
      expect(result.data.id).toBe('app1');
    });
  });
});
