import { Test, TestingModule } from '@nestjs/testing';
import { FinanceService } from './finance.service';
import { FinanceRepository } from './finance.repo';
import { ShopFinancePublisher } from '../publisher/shop.finance.publisher';
import { InsufficientBalanceError } from '../../../libs/errors/domain.error';

describe('FinanceService', () => {
  let service: FinanceService;
  let repo: any;
  let publisher: any;

  beforeEach(async () => {
    repo = {
      getBalance: jest.fn(),
      getPendingPayoutTotal: jest.fn(),
      findLedgerEntries: jest.fn(),
      createPayout: jest.fn(),
      findPayouts: jest.fn(),
    };

    publisher = {
      publishPayoutRequested: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FinanceService,
        { provide: FinanceRepository, useValue: repo },
        { provide: ShopFinancePublisher, useValue: publisher },
      ],
    }).compile();

    service = module.get<FinanceService>(FinanceService);
  });

  describe('requestPayout', () => {
    it('should throw InsufficientBalanceError on INSUFFICIENT_BALANCE repo error', async () => {
      repo.createPayout.mockRejectedValue(new Error('INSUFFICIENT_BALANCE'));

      await expect(service.requestPayout('shop-1', { amount: 100 })).rejects.toThrow(InsufficientBalanceError);
    });

    it('should create payout and emit request event', async () => {
      repo.createPayout.mockResolvedValue({ id: 'payout-1', amount: 100 });

      const result = await service.requestPayout('shop-1', { amount: 100 });

      expect(repo.createPayout).toHaveBeenCalledWith('shop-1', 100);
      expect(publisher.publishPayoutRequested).toHaveBeenCalledWith(expect.objectContaining({
        shopId: 'shop-1',
        payoutId: 'payout-1',
        amount: "100",
      }));
      const data = result.data as any;
      expect(data.id).toBe('payout-1');
    });
  });

  describe('getBalance', () => {
    it('should aggregate valid balance', async () => {
      repo.getBalance.mockResolvedValue("500");
      repo.getPendingPayoutTotal.mockResolvedValue("50");

      const result = await service.getBalance('shop-1');
      const data = result.data as any;
      expect(data.currentBalance).toBe("500");
    });
  });
});
