import { Injectable, BadRequestException } from '@nestjs/common';
import { CreateShopApplicationDTO, ReviewShopApplicationDTO, ShopApplicationQueryDTO } from './application.dto';
import { ApplicationRepository } from './application.repository';
import { ShopApplicationPublisher } from '../publisher/shop.application.publisher';
import { DatabaseService } from '../../../libs/database/database.service';
import { ApplicationNotFoundError, InvalidStateTransitionError } from '../../../libs/errors/domain.error';
import * as crypto from 'crypto';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repo: ApplicationRepository,
    private readonly publisher: ShopApplicationPublisher,
    private readonly db: DatabaseService,
  ) {}

  async create(shopId: string, body: CreateShopApplicationDTO) {
    const existing = await this.repo.findShopApplicationByShopId(shopId);

    if (existing && existing.status !== 'REJECTED') {
      throw new BadRequestException('Application already exists');
    }

    if (existing && existing.status === 'REJECTED') {
      const updated = await this.repo.updateByShopId(shopId, {
        ...body,
        status: 'PENDING',
        notes: null,
        reviewedAt: null,
      });

      await this.publisher.publishApplicationSubmitted({
        shopId,
        timestamp: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
      });

      return {
        data: updated,
        message: 'Application resubmitted successfully',
      };
    }

    const created = await this.repo.create({
      shopId,
      ...body,
    });

    await this.publisher.publishApplicationSubmitted({
      shopId,
      timestamp: new Date().toISOString(),
      correlationId: crypto.randomUUID(),
    });

    return {
      data: created,
      message: 'Successfully created shop application',
    };
  }

  async update(shopId: string, body: CreateShopApplicationDTO) {
    const existing = await this.repo.findShopApplicationByShopId(shopId);

    if (!existing) {
      throw new ApplicationNotFoundError(shopId);
    }

    if (existing.status !== 'REJECTED') {
      throw new BadRequestException('Only rejected applications can be updated');
    }

    const updated = await this.repo.updateByShopId(shopId, {
      ...body,
      status: 'PENDING',
      notes: null,
      reviewedAt: null,
    });

    return {
      data: updated,
      message: 'Application updated successfully',
    };
  }

  async review(shopId: string, body: ReviewShopApplicationDTO) {
    return this.db.$transaction(async (tx) => {
      const application = await tx.shopApplication.findUnique({
        where: { shopId },
        include: { shop: true },
      });

      if (!application) {
        throw new ApplicationNotFoundError(shopId);
      }

      if (application.status !== 'PENDING' && application.status !== 'REVIEW') {
        throw new InvalidStateTransitionError(application.status, body.status);
      }

      if (body.status === 'APPROVED') {
        const [updatedApp, updatedShop] = await Promise.all([
          tx.shopApplication.update({
            where: { shopId },
            data: {
              status: body.status,
              notes: body.notes ?? null,
              reviewedAt: new Date(),
            },
          }),
          tx.shop.update({
             where: { id: shopId },
             data: { status: 'APPROVED' },
          }),
        ]);

        const existingMember = await tx.shopMember.findUnique({
          where: {
            shopId_userId: {
              shopId,
              userId: application.shop.ownerId,
            },
          },
        });

        if (!existingMember) {
           await tx.shopMember.create({
             data: {
               shopId,
               userId: application.shop.ownerId,
               role: 'OWNER',
             },
           });
        }

        await this.publisher.publishShopApproved({
          shopId,
          ownerId: application.shop.ownerId,
          applicationId: application.id,
          timestamp: new Date().toISOString(),
          correlationId: crypto.randomUUID(),
        });

        return {
          data: updatedApp,
          message: 'Application reviewed and approved successfully',
        };
      }

      const rejectedApp = await tx.shopApplication.update({
        where: { shopId },
        data: {
          status: body.status,
          notes: body.notes ?? null,
          reviewedAt: new Date(),
        },
      });

      return {
        data: rejectedApp,
        message: 'Application reviewed and rejected successfully',
      };
    });
  }

  async findOne(shopId: string) {
    const data = await this.repo.findShopApplicationByShopId(shopId);
    if (!data) {
      throw new ApplicationNotFoundError(shopId);
    }
    return {
      data,
      message: 'Application retrieved successfully',
    };
  }

  async findAll(query: ShopApplicationQueryDTO) {
    const { page, limit, status, shopId, createdFrom, createdTo, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const { data, meta } = await this.repo.findAll({
      skip,
      take: limit,
      status,
      shopId,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
      search,
    });

    return {
      data,
      meta,
      message: 'Applications retrieved successfully',
    };
  }

  async findMyApplications(userId: string, query: ShopApplicationQueryDTO) {
    const { page, limit, sortBy, sortOrder, search } = query;
    const skip = (page - 1) * limit;

    const { data, meta } = await this.repo.findMyApplications(userId, {
      skip,
      take: limit,
      sortBy,
      sortOrder,
      search,
    });

    return {
      data,
      meta,
      message: 'My applications retrieved successfully',
    };
  }

  async delete(shopId: string) {
    const findApplication = await this.repo.findShopApplicationByShopId(shopId);
    if(!findApplication) throw new ApplicationNotFoundError(shopId);

    await this.repo.deleteApplicationById(findApplication.id);

    return {
      data: null,
      message: 'Successfully deleted application',
    };
  }
}