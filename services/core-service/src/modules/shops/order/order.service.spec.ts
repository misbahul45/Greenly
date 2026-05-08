import { Test, TestingModule } from '@nestjs/testing';
import { OrderService } from './order.service';
import { OrderRepository } from './order.repository';
import { ShopOrderPublisher } from '../publisher/shop.order.publisher';
import { DatabaseService } from '../../../libs/database/database.service';
import { InvalidStateTransitionError } from '../../../libs/errors/domain.error';
import { AppError } from '../../../libs/errors/app.error';

describe('OrderService', () => {
  let service: OrderService;
  let repo: any;
  let publisher: any;
  let db: any;

  beforeEach(async () => {
    repo = {
      findMany: jest.fn(),
      count: jest.fn(),
      findOne: jest.fn(),
    };

    publisher = {
      publishShopOrderStatusChanged: jest.fn(),
      publishRefundProcessed: jest.fn(),
    };

    db = {
      $transaction: jest.fn((cb) => cb(db)),
      order: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        update: jest.fn(),
      },
      shopLedger: {
        create: jest.fn(),
      },
      shop: {
        update: jest.fn(),
      },
      refund: {
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: OrderRepository, useValue: repo },
        { provide: ShopOrderPublisher, useValue: publisher },
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  describe('updateOrderStatus', () => {
    it('should throw AppError if order not found', async () => {
      db.order.findUnique.mockResolvedValue(null);
      await expect(service.updateOrderStatus('shop-1', 'order-1', 'PAID')).rejects.toThrow(AppError);
    });

    it('should throw InvalidStateTransitionError on invalid transition', async () => {
      db.order.findUnique.mockResolvedValue({ id: 'order-1', shopId: 'shop-1', status: 'PENDING' });
      await expect(service.updateOrderStatus('shop-1', 'order-1', 'SHIPPED')).rejects.toThrow(InvalidStateTransitionError);
    });

    it('should update status and emit event', async () => {
      db.order.findUnique.mockResolvedValue({ id: 'order-1', shopId: 'shop-1', status: 'SHIPPED' });
      db.order.update.mockResolvedValue({ id: 'order-1', status: 'COMPLETED' });

      const result = await service.updateOrderStatus('shop-1', 'order-1', 'COMPLETED');
      expect(db.order.update).toHaveBeenCalled();
      expect(publisher.publishShopOrderStatusChanged).toHaveBeenCalledWith(expect.objectContaining({
        orderId: 'order-1',
        newStatus: 'COMPLETED',
      }));
    });

    it('should update ledger upon COMPLETED status', async () => {
      db.order.findUnique.mockResolvedValue({
         id: 'order-1',
         shopId: 'shop-1',
         status: 'SHIPPED',
         payment: { netAmount: 100 }
      });
      db.order.update.mockResolvedValue({ id: 'order-1', status: 'COMPLETED' });
      db.shopLedger.create.mockResolvedValue({});
      db.shop.update.mockResolvedValue({});

      await service.updateOrderStatus('shop-1', 'order-1', 'COMPLETED');
      expect(db.shopLedger.create).toHaveBeenCalled();
      expect(db.shop.update).toHaveBeenCalled();
    });
  });

  describe('updateRefund', () => {
    it('should update refund to APPROVED and emit event', async () => {
      db.order.findFirst.mockResolvedValue({ id: 'order-1', shopId: 'shop-1', status: 'PAID' });
      db.refund.update.mockResolvedValue({ amount: 50 });

      await service.updateRefund('shop-1', 'order-1', 'refund-1');
      expect(db.refund.update).toHaveBeenCalled();
      expect(publisher.publishRefundProcessed).toHaveBeenCalled();
    });
  });
});
