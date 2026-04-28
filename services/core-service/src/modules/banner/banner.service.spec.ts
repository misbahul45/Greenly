import { Test, TestingModule } from '@nestjs/testing';
import { BannerService } from './banner.service';
import { BannerRepository } from './banner.repository';
import { AppError } from '../../libs/errors/app.error';

const mockRepository = {
  findAll: jest.fn(),
  findActive: jest.fn(),
  findById: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  softDelete: jest.fn(),
};

describe('BannerService', () => {
  let service: BannerService;
  let repo: typeof mockRepository;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BannerService,
        { provide: BannerRepository, useValue: mockRepository },
      ],
    }).compile();

    service = module.get<BannerService>(BannerService);
    repo = module.get(BannerRepository);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return paginated banners', async () => {
      const mockData = {
        data: [{ id: 'banner_1' }],
        meta: { total: 1, page: 1, limit: 10, lastPage: 1 },
      };
      repo.findAll.mockResolvedValue(mockData);

      const result = await service.findAll({
        page: 1,
        limit: 10,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });

      expect(result.data).toEqual([{ id: 'banner_1' }]);
      expect(result.meta).toEqual(mockData.meta);
      expect(result.message).toBe('Banners fetched successfully');
    });
  });

  describe('findActive', () => {
    it('should return active banners', async () => {
      const mockData = [{ id: 'banner_1', isActive: true }];
      repo.findActive.mockResolvedValue(mockData);

      const result = await service.findActive('HOME');

      expect(result.data).toEqual(mockData);
      expect(result.message).toBe('Active banners fetched successfully');
    });
  });

  describe('findOne', () => {
    const mockBanner = { id: 'banner_1', title: 'Test Banner' };

    it('should return banner when found', async () => {
      repo.findById.mockResolvedValue(mockBanner);

      const result = await service.findOne('banner_1');

      expect(result.data).toEqual(mockBanner);
      expect(result.message).toBe('Banner fetched successfully');
    });

    it('should throw 404 when banner not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.findOne('nonexistent')).rejects.toThrow(AppError);
      await expect(service.findOne('nonexistent')).rejects.toThrow('Banner not found');
    });
  });

  describe('create', () => {
    const dto = {
      title: 'New Banner',
      imageUrl: 'https://example.com/image.jpg',
      type: 'HOME' as const,
      isActive: true,
    };
    const mockBanner = {
      id: 'banner_1',
      ...dto,
    };

    it('should create banner successfully', async () => {
      repo.create.mockResolvedValue(mockBanner);

      const result = await service.create(dto);

      expect(result.data).toEqual(mockBanner);
      expect(result.message).toBe('Banner created successfully');
      expect(repo.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('update', () => {
    const mockBanner = { id: 'banner_1', title: 'Old Title' };

    it('should update banner when found', async () => {
      const dto = { title: 'New Title' };
      repo.findById.mockResolvedValue(mockBanner);
      repo.update.mockResolvedValue({ ...mockBanner, ...dto });

      const result = await service.update('banner_1', dto);

      expect(result.message).toBe('Banner updated successfully');
      expect(repo.update).toHaveBeenCalledWith('banner_1', dto);
    });

    it('should throw 404 when banner not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(
        service.update('nonexistent', { title: 'New Title' })
      ).rejects.toThrow('Banner not found');
    });
  });

  describe('remove', () => {
    const mockBanner = { id: 'banner_1', title: 'Test' };

    it('should delete banner when found', async () => {
      repo.findById.mockResolvedValue(mockBanner);
      repo.softDelete.mockResolvedValue(mockBanner);

      const result = await service.remove('banner_1');

      expect(result.data).toBeNull();
      expect(result.message).toBe('Banner deleted successfully');
      expect(repo.softDelete).toHaveBeenCalledWith('banner_1');
    });

    it('should throw 404 when banner not found', async () => {
      repo.findById.mockResolvedValue(null);

      await expect(service.remove('nonexistent')).rejects.toThrow('Banner not found');
    });
  });
});