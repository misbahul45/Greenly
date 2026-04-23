import { Test, TestingModule } from '@nestjs/testing';
import { MemberService } from './member.service';
import { MemberRepository } from './member.repository';
import { ShopMemberPublisher } from '../publisher/shop.member.publisher';
import { ShopNotFoundError } from '../../../libs/errors/domain.error';
import { BadRequestException } from '@nestjs/common';

const mockAddMemberDTO = {
  userId: 'user-2',
  role: 'ADMIN' as const,
};

describe('MemberService', () => {
  let service: MemberService;
  let repo: any;
  let publisher: any;

  beforeEach(async () => {
    repo = {
      findMemberByShopIdAndUserId: jest.fn(),
      findShopById: jest.fn(),
      addMember: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      updateMemberRole: jest.fn(),
      deleteMember: jest.fn(),
    };

    publisher = {
      publishShopMemberAdded: jest.fn(),
      publishShopMemberRemoved: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MemberService,
        { provide: MemberRepository, useValue: repo },
        { provide: ShopMemberPublisher, useValue: publisher },
      ],
    }).compile();

    service = module.get<MemberService>(MemberService);
  });

  describe('addMember', () => {
    it('should throw BadRequestException if member already exists', async () => {
      repo.findMemberByShopIdAndUserId.mockResolvedValue({ id: 'm1' });
      await expect(service.addMember('shop-1', 'user-1', mockAddMemberDTO)).rejects.toThrow(BadRequestException);
    });

    it('should throw ShopNotFoundError if shop does not exist', async () => {
      repo.findMemberByShopIdAndUserId.mockResolvedValue(null);
      repo.findShopById.mockResolvedValue(null);
      await expect(service.addMember('shop-1', 'user-1', mockAddMemberDTO)).rejects.toThrow(ShopNotFoundError);
    });

    it('should throw BadRequestException if shop not approved', async () => {
      repo.findMemberByShopIdAndUserId.mockResolvedValue(null);
      repo.findShopById.mockResolvedValue({ status: 'PENDING' });
      await expect(service.addMember('shop-1', 'user-1', mockAddMemberDTO)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if role is OWNER', async () => {
      repo.findMemberByShopIdAndUserId.mockResolvedValue(null);
      repo.findShopById.mockResolvedValue({ status: 'APPROVED' });
      await expect(service.addMember('shop-1', 'user-1', { ...mockAddMemberDTO, role: 'OWNER' })).rejects.toThrow(BadRequestException);
    });

    it('should add member and emit event', async () => {
      repo.findMemberByShopIdAndUserId.mockResolvedValue(null);
      repo.findShopById.mockResolvedValue({ status: 'APPROVED' });
      repo.addMember.mockResolvedValue({ id: 'new-member' });

      const result = await service.addMember('shop-1', 'user-1', mockAddMemberDTO);

      expect(repo.addMember).toHaveBeenCalledWith('shop-1', mockAddMemberDTO);
      expect(publisher.publishShopMemberAdded).toHaveBeenCalledWith(expect.objectContaining({
        shopId: 'shop-1',
        userId: 'user-2',
        role: 'ADMIN',
        addedBy: 'user-1',
      }));
      expect(result.data).toBeDefined();
    });
  });

  describe('deleteMember', () => {
    it('should throw BadRequestException if member to delete is an OWNER', async () => {
      repo.findShopById.mockResolvedValue({ status: 'APPROVED' });
      repo.findMemberByShopIdAndUserId.mockResolvedValue({ role: 'OWNER' });
      
      await expect(service.deleteMember('shop-1', 'user-2', 'user-1')).rejects.toThrow(BadRequestException);
    });

    it('should delete member and emit removed event', async () => {
      repo.findShopById.mockResolvedValue({ status: 'APPROVED' });
      repo.findMemberByShopIdAndUserId.mockResolvedValue({ role: 'STAFF' });
      repo.deleteMember.mockResolvedValue(null);

      await service.deleteMember('shop-1', 'user-2', 'user-1');

      expect(repo.deleteMember).toHaveBeenCalledWith('shop-1', 'user-2');
      expect(publisher.publishShopMemberRemoved).toHaveBeenCalledWith(expect.objectContaining({
         shopId: 'shop-1',
         userId: 'user-2',
         removedBy: 'user-1',
      }));
    });
  });
});
