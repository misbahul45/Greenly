import { Test, TestingModule } from '@nestjs/testing';
import { DashboardService } from './dashboard.service';
import { DashboardRepository } from './dashboard.repository';

describe('DashboardService', () => {
  let service: DashboardService;
  let repo: any;

  beforeEach(async () => {
    repo = {
      getOrderStats: jest.fn(),
      getTotalRevenue: jest.fn(),
      getBalance: jest.fn(),
      getPendingPayout: jest.fn(),
      getMonthlyRevenue: jest.fn(),
      getRecentOrders: jest.fn(),
      getRevenueByRange: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        { provide: DashboardRepository, useValue: repo },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('summary should aggregate accurately', async () => {
    repo.getOrderStats.mockResolvedValue({ totalOrders: 10 });
    repo.getTotalRevenue.mockResolvedValue('100');
    repo.getBalance.mockResolvedValue('50');
    repo.getPendingPayout.mockResolvedValue('10');
    repo.getMonthlyRevenue.mockResolvedValue('100');

    const result = await service.getSummary('shop-1');
    const data = result.data as any;
    expect(data.totalOrders).toBe(10);
    expect(data.totalRevenue).toBe('100');
  });

  it('recent orders should bound limit', async () => {
     repo.getRecentOrders.mockResolvedValue([]);
     await service.getRecentOrders('shop-1', 100);
     expect(repo.getRecentOrders).toHaveBeenCalledWith('shop-1', 50);
  });

  it('revenue should fetch chart data', async () => {
     repo.getRevenueByRange.mockResolvedValue({ labels: [], values: [] });
     await service.getRevenue('shop-1', '7d');
     expect(repo.getRevenueByRange).toHaveBeenCalledWith('shop-1', 7);
  });
});
