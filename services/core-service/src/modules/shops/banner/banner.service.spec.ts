import { Test, TestingModule } from '@nestjs/testing';
import { ShopBannerService } from './banner.service';
import { ShopBannerRepository } from './banner.repository';
import { AppError } from '../../../libs/errors/app.error';

const mockRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('ShopBannerService', () => {
  let service: ShopBannerService;
  let repo: typeof mockRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ShopBannerService,
        { provide: ShopBannerRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<ShopBannerService>(ShopBannerService);
    repo = module.get(ShopBannerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    const shopId = 'shop_1';

    it('should return paginated banners', async () => {
      const mockData = {
        data: [{ id: 'banner_1', shopId }],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      };
      repo.findAll.mockResolvedValue(mockData);

      const result = await service.findAll(shopId, {
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toEqual([{ id: 'banner_1', shopId }]);
      expect(result.meta).toEqual(mockData.meta);
      expect(result.message).toBe('Shop banners fetched successfully');
    });
  });

  describe('findOne', () => {
    const shopId = 'shop_1';
    const mockBanner = { id: 'banner_1', title: 'Test Banner', shopId };

    it('should return banner when found', async () => {
      repo.findById.mockResolvedValue(mockBanner);

      const result = await service.findOne(shopId, 'banner_1');

      expect(result.data).toEqual(mockBanner);
      expect(result.message).toBe('Banner fetched successfully');
    });

    it('should throw 404 when banner not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne(shopId, 'nonexistent')).rejects.toThrow(AppError);
      await expect(service.findOne(shopId, 'nonexistent')).rejects.toThrow(
        'Banner not found'
      );
    });
  });

  describe('create', () => {
    const shopId = 'shop_1';
    const dto = {
      title: 'New Banner',
      imageUrl: 'https://example.com/image.jpg',
      isActive: true,
    };
    const mockBanner = {
      id: 'banner_1',
      ...dto,
      shopId,
    };

    it('should create banner successfully', async () => {
      repo.create.mockResolvedValue(mockBanner);

      const result = await service.create(shopId, dto);

      expect(result.data).toEqual(mockBanner);
      expect(result.message).toBe('Banner created successfully');
      expect(repo.create).toHaveBeenCalledWith(shopId, dto);
    });
  });

  describe('update', () => {
    const shopId = 'shop_1';
    const mockBanner = { id: 'banner_1', title: 'Old Title', shopId };
    const dto = { title: 'New Title' };

    it('should update banner when found', async () => {
      repo.findById.mockResolvedValue(mockBanner);
      repo.update.mockResolvedValue({ ...mockBanner, ...dto });

      const result = await service.update(shopId, 'banner_1', dto);

      expect(result.message).toBe('Banner updated successfully');
      expect(repo.update).toHaveBeenCalledWith('banner_1', dto);
    });

    it('should throw 404 when banner not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update(shopId, 'nonexistent', dto)
      ).rejects.toThrow('Banner not found');
    });
  });

  describe('remove', () => {
    const shopId = 'shop_1';
    const mockBanner = { id: 'banner_1', title: 'Test', shopId };

    it('should delete banner when found', async () => {
      repo.findById.mockResolvedValue(mockBanner);
      repo.softDelete.mockResolvedValue(mockBanner);

      const result = await service.remove(shopId, 'banner_1');

      expect(result.data).toBeNull();
      expect(result.message).toBe('Banner deleted successfully');
      expect(repo.softDelete).toHaveBeenCalledWith('banner_1');
    });

    it('should throw 404 when banner not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove(shopId, 'nonexistent')).rejects.toThrow(
        'Banner not found'
      );
    });
  });
});