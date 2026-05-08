import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { Prisma } from '../../../../generated/prisma/browser';
import { CreateLedgerDto } from './dto';
import { ListLedgersQueryDto } from './dto';

@Injectable()
export class LedgerRepository {
  constructor(private readonly db: DatabaseService) {}

  async createLedger(data: CreateLedgerDto) {
    return this.db.shopLedger.create({
      data: {
        shopId: data.shopId,
        type: data.type,
        amount: data.amount,
        reference: data.reference,
        description: data.description,
        createdAt: new Date(),
      },
    });
  }

  async findByShopId(shopId: string, filters: ListLedgersQueryDto) {
    const where: Prisma.ShopLedgerWhereInput = {
      shopId,
      ...(filters.type && { type: filters.type as any }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            createdAt: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    };

    const skip = (filters.page - 1) * filters.limit;
    
    return this.db.$transaction([
      this.db.shopLedger.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: filters.limit,
        skip,
      }),
      this.db.shopLedger.count({ where }),
    ]);
  }

  async getBalanceByShopId(shopId: string): Promise<number> {
    const ledgers = await this.db.shopLedger.findMany({
      where: { shopId },
      select: { type: true, amount: true },
    });
    
    return ledgers.reduce((balance, ledger) => {
      // @ts-ignore Prisma Decimal coercion mapping if not matching TS config exactly
      const amountVal = typeof ledger.amount.toNumber === 'function' ? ledger.amount.toNumber() : Number(ledger.amount);
      return ledger.type === 'CREDIT' 
        ? balance + amountVal
        : balance - amountVal;
    }, 0);
  }
}
