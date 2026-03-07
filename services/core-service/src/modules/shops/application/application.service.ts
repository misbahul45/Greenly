import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  CreateShopApplicationDTO,
  ReviewShopApplicationDTO,
  ShopApplicationQueryDTO,
} from './application.dto';
import { ApplicationRepository } from './application.repository';
import { ApplicationStatus } from '../../../../generated/prisma/enums';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly repo: ApplicationRepository,
  ) {}

  async create(shopId: number, body: CreateShopApplicationDTO) {
    const existing =
      await this.repo.findShopApplicationByShopId(shopId);

    if (
      existing &&
      existing.status !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Application already exists',
      );
    }

    if (
      existing &&
      existing.status === ApplicationStatus.REJECTED
    ) {
      const updated =
        await this.repo.updateByShopId(shopId, {
          ...body,
          status: ApplicationStatus.PENDING,
          notes: null,
          reviewedAt: null,
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

    return {
      data: created,
      message: 'Successfully created shop application',
    };
  }

  async update(
    shopId: number,
    body: CreateShopApplicationDTO,
  ) {
    const existing =
      await this.repo.findShopApplicationByShopId(shopId);

    if (!existing) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    if (
      existing.status !== ApplicationStatus.REJECTED
    ) {
      throw new BadRequestException(
        'Only rejected application can be updated',
      );
    }

    const updated =
      await this.repo.updateByShopId(shopId, {
        ...body,
        status: ApplicationStatus.PENDING,
        notes: null,
        reviewedAt: null,
      });

    return {
      data: updated,
      message: 'Application updated successfully',
    };
  }

  async review(
    shopId: number,
    body: ReviewShopApplicationDTO,
  ) {
    const existing =
      await this.repo.findShopApplicationByShopId(shopId);

    if (!existing) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    if (
      existing.status !== ApplicationStatus.PENDING &&
      existing.status !== ApplicationStatus.REVIEW
    ) {
      throw new BadRequestException(
        'Application cannot be reviewed',
      );
    }

    const reviewed =
      await this.repo.updateByShopId(shopId, {
        status: body.status,
        notes: body.notes ?? null,
        reviewedAt: new Date(),
      });

    return {
      data: reviewed,
      message: 'Application reviewed successfully',
    };
  }

  async findOne(shopId: number) {
    const data =
      await this.repo.findShopApplicationByShopId(shopId);

    if (!data) {
      throw new NotFoundException(
        'Application not found',
      );
    }

    return {
      data,
      message: 'Application retrieved successfully',
    };
  }

  async findAll(query: ShopApplicationQueryDTO) {
    const {
      page,
      limit,
      status,
      shopId,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    } = query;

    const skip = (page - 1) * limit;

    const data = await this.repo.findAll({
      skip,
      take: limit,
      status,
      shopId,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    });

    return {
      data,
      message: 'Applications retrieved successfully',
    };
  }

  async findMyApplications(userId: number) {
    const data =
      await this.repo.findMyApplications(userId);

    return {
      data,
      message:
        'My applications retrieved successfully',
    };
  }
}