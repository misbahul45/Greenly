import { Test, TestingModule } from '@nestjs/testing';
import { ShopsService } from './shops.service';
import { ShopsRepository } from './shops.repository';
import { ShopCreatedPublisher } from './publisher/shop.created.publisher';
import { AppError } from '../../libs/errors/app.error';

const mockRepository = {
  findAll: jest.fn(),
  findMyShop: jest.fn(),
  findOne: jest.fn(),
  findByNameAndOwner: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
  findOneWithMembers: jest.fn(),
};

const mockPublisher = {
  publish: jest.fn(),
};

describe('ShopsService', () => {
  let service: ShopsService;
  let repo: typeof mockRepository;
  let publisher: typeof mockPublisher;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopsService,
        { provide: ShopsRepository, useValue: mockRepository },
        { provide: ShopCreatedPublisher, useValue: mockPublisher },
      ],
    }).compile();

    service = module.get<ShopsService>(ShopsService);
    repo = module.get(ShopsRepository);
    publisher = module.get(ShopCreatedPublisher);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const userId = 'user_123';
    const dto = { name: 'Eco Store', description: 'Green products' };
    const mockShop = {
      id: 'shop_456',
      name: 'Eco Store',
      description: 'Green products',
      status: 'PENDING',
      ownerId: userId,
      balance: 0,
      followerCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null,
    };

    it('should create shop with PENDING status and emit event', async () => {
      repo.findByNameAndOwner.mockResolvedValue(null);
      repo.create.mockResolvedValue(mockShop);
      publisher.publish.mockResolvedValue(undefined);

      const result = await service.create(userId, dto);

      expect(result.data).toEqual(mockShop);
      expect(result.message).toBe('Shop created successfully');
      expect(repo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Eco Store',
          description: 'Green products',
          status: 'PENDING',
          owner: { connect: { id: userId } },
        })
      );
      expect(publisher.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          shopId: 'shop_456',
          ownerId: userId,
          name: 'Eco Store',
          status: 'PENDING',
        })
      );
    });

    it('should throw error if shop name already exists for user', async () => {
      repo.findByNameAndOwner.mockResolvedValue(mockShop);

      await expect(service.create(userId, dto)).rejects.toThrow(AppError);
      await expect(service.create(userId, dto)).rejects.toThrow(
        'You already have a shop with this name'
      );
      expect(repo.create).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return shop when found', async () => {
      const mockShop = { id: 'shop_1', name: 'Test', ownerId: 'user_1' };
      repo.findOne.mockResolvedValue(mockShop);

      const result = await service.findOne('shop_1');

      expect(result.data).toEqual(mockShop);
      expect(result.message).toBe('Successfully get shop');
    });

    it('should throw 404 when shop not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(AppError);
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        'Shop not found'
      );
    });
  });

  describe('update', () => {
    const shopId = 'shop_1';
    const ownerId = 'user_1';
    const otherId = 'user_other';
    const mockShop = {
      id: shopId,
      name: 'Old Name',
      ownerId,
      description: null,
    };

    it('should update shop when user is owner', async () => {
      repo.findOne.mockResolvedValue(mockShop);
      repo.findByNameAndOwner.mockResolvedValue(null);
      repo.update.mockResolvedValue({ ...mockShop, name: 'New Name' });

      const result = await service.update(shopId, ownerId, { name: 'New Name' });

      expect(result.message).toBe('Shop updated successfully');
      expect(repo.update).toHaveBeenCalledWith(shopId, { name: 'New Name' });
    });

    it('should throw 403 when user is not owner', async () => {
      repo.findOne.mockResolvedValue(mockShop);

      await expect(
        service.update(shopId, otherId, { name: 'New Name' })
      ).rejects.toThrow('You are not authorized to update this shop');
    });

    it('should throw 404 when shop not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.update(shopId, ownerId, { name: 'New Name' })
      ).rejects.toThrow('Shop not found');
    });

    it('should throw error if new name conflicts', async () => {
      repo.findOne.mockResolvedValue(mockShop);
      repo.findByNameAndOwner.mockResolvedValue({ id: 'other_shop' });

      await expect(
        service.update(shopId, ownerId, { name: 'Taken Name' })
      ).rejects.toThrow('Shop name already used');
    });
  });

  describe('delete', () => {
    const shopId = 'shop_1';
    const ownerId = 'user_1';
    const otherId = 'user_other';
    const mockShop = { id: shopId, ownerId, name: 'Test' };

    it('should soft delete shop when user is owner', async () => {
      repo.findOne.mockResolvedValue(mockShop);
      repo.softDelete.mockResolvedValue(mockShop);

      const result = await service.delete(shopId, ownerId);

      expect(result.data).toBeNull();
      expect(result.message).toBe('Shop deleted successfully');
      expect(repo.softDelete).toHaveBeenCalledWith(shopId);
    });

    it('should throw 403 when user is not owner', async () => {
      repo.findOne.mockResolvedValue(mockShop);

      await expect(service.delete(shopId, otherId)).rejects.toThrow(
        'You are not authorized to delete this shop'
      );
      expect(repo.softDelete).not.toHaveBeenCalled();
    });

    it('should throw 404 when shop not found', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.delete(shopId, ownerId)).rejects.toThrow(
        'Shop not found'
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated shops', async () => {
      const mockData = {
        data: [{ id: 'shop_1' }],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      };
      repo.findAll.mockResolvedValue(mockData);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toEqual([{ id: 'shop_1' }]);
      expect(result.meta).toEqual(mockData.meta);
    });
  });

  describe('findMyShop', () => {
    it('should return shops owned by user', async () => {
      const mockData = {
        data: [{ id: 'shop_1', ownerId: 'user_1' }],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      };
      repo.findMyShop.mockResolvedValue(mockData);

      const result = await service.findMyShop('user_1', {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toHaveLength(1);
      expect(repo.findMyShop).toHaveBeenCalledWith('user_1', expect.any(Object));
    });
  });
});
