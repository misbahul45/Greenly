import { Injectable, NotFoundException } from '@nestjs/common';
import { LedgerRepository } from './ledger.repository';
import { ListLedgersQueryDto } from './dto';
import { CreateLedgerDto } from './dto';
import { LedgerCreatedPublisher } from './publishers/ledger-created.publisher';

@Injectable()
export class LedgerService {
  constructor(
    private readonly ledgerRepo: LedgerRepository,
    private readonly ledgerCreatedPublisher: LedgerCreatedPublisher,
  ) {}

  async listByShop(shopId: string, query: ListLedgersQueryDto) {
    const [data, total] = await this.ledgerRepo.findByShopId(shopId, query);

    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
      message: 'Shop ledgers retrieved successfully',
    };
  }

  async createLedger(dto: CreateLedgerDto) {
    const ledger = await this.ledgerRepo.createLedger(dto);
    
    // @ts-ignore Decimal safe unwrap
    const amountVal = typeof ledger.amount.toNumber === 'function' ? ledger.amount.toNumber() : Number(ledger.amount);

    await this.ledgerCreatedPublisher.publish({
      shopId: ledger.shopId,
      type: ledger.type,
      amount: amountVal,
      reference: ledger.reference,
      description: ledger.description || undefined,
      timestamp: ledger.createdAt.toISOString(),
    });

    return ledger;
  }

  async getBalance(shopId: string): Promise<number> {
    return this.ledgerRepo.getBalanceByShopId(shopId);
  }
}
