import { Test, TestingModule } from '@nestjs/testing';
import { FollowerService } from './follower.service';
import { FollowerRepository } from './follower.repository';
import { ShopFollowerPublisher } from '../publisher/shop.follower.publisher';
import { DatabaseService } from '../../../libs/database/database.service';
import { ShopNotFoundError, CannotFollowOwnShopError } from '../../../libs/errors/domain.error';

describe('FollowerService', () => {
  let service: FollowerService;
  let repo: any;
  let publisher: any;
  let db: any;

  beforeEach(async () => {
    repo = {
      findFollowers: jest.fn(),
      findFollowingShops: jest.fn(),
    };

    publisher = {
      publishShopFollowerAdded: jest.fn(),
      publishShopFollowerRemoved: jest.fn(),
    };

    db = {
      $transaction: jest.fn((cb) => cb(db)),
      shopFollower: {
        findUnique: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      shop: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FollowerService,
        { provide: FollowerRepository, useValue: repo },
        { provide: ShopFollowerPublisher, useValue: publisher },
        { provide: DatabaseService, useValue: db },
      ],
    }).compile();

    service = module.get<FollowerService>(FollowerService);
  });

  describe('follow', () => {
    it('should throw CannotFollowOwnShopError if following own shop', async () => {
      db.shop.findUnique.mockResolvedValue({ id: 'shop-1', ownerId: 'user-1' });
      db.shopFollower.findUnique.mockResolvedValue(null);

      await expect(service.follow('user-1', 'shop-1')).rejects.toThrow(CannotFollowOwnShopError);
    });

    it('should return already following if existing', async () => {
      db.shopFollower.findUnique.mockResolvedValue({ id: 'follower-1' });

      const result = await service.follow('user-1', 'shop-1');
      expect(result.data.followed).toBe(false);
      expect(result.message).toBe('Already following');
    });

    it('should follow and emit event atomically', async () => {
      db.shopFollower.findUnique.mockResolvedValue(null);
      db.shop.findUnique.mockResolvedValue({ id: 'shop-1', ownerId: 'user-2' });
      db.shopFollower.create.mockResolvedValue({});
      db.shop.update.mockResolvedValue({ followerCount: 5 });

      const result = await service.follow('user-1', 'shop-1');

      expect(db.shop.update).toHaveBeenCalled();
      expect(publisher.publishShopFollowerAdded).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-1',
        shopId: 'shop-1',
      }));
      expect(result.data.followerCount).toBe(5);
    });
  });

  describe('unfollow', () => {
    it('should unfollow and emit event atomically', async () => {
      db.shopFollower.findUnique.mockResolvedValue({ id: 'follower-1' });
      db.shopFollower.delete.mockResolvedValue({});
      db.shop.update.mockResolvedValue({ followerCount: 4 });

      await service.unfollow('user-1', 'shop-1');

      expect(db.shop.update).toHaveBeenCalled();
      expect(publisher.publishShopFollowerRemoved).toHaveBeenCalledWith(expect.objectContaining({
        userId: 'user-1',
        shopId: 'shop-1',
      }));
    });
  });
});
