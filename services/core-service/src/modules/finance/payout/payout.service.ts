import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../libs/database/database.service';
import { PayoutRepository } from './payout.repository';
import { LedgerRepository } from '../ledger/ledger.repository';
import { PayoutStatusChangedPublisher } from './publishers/payout-status-changed.publisher';
import { CreatePayoutRequestDto, ApprovePayoutDto, RejectPayoutDto, ListPayoutsQueryDto } from './payout.dto';

@Injectable()
export class PayoutService {
  constructor(
    private readonly db: DatabaseService,
    private readonly payoutRepo: PayoutRepository,
    private readonly ledgerRepo: LedgerRepository,
    private readonly payoutPublisher: PayoutStatusChangedPublisher,
  ) {}

  async listByShop(shopId: string, query: ListPayoutsQueryDto) {
    const [data, total] = await this.payoutRepo.findByShopId(shopId, query);
    
    return {
      data,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        lastPage: Math.ceil(total / query.limit),
      },
      message: 'Shop payouts retrieved successfully',
    };
  }

  async requestPayout(userId: string, dto: CreatePayoutRequestDto & { shopId: string }) {
    return this.db.$transaction(async (tx) => {
      // 1. Cek balance shop real-time
      const ledgers = await tx.shopLedger.findMany({
        where: { shopId: dto.shopId },
        select: { type: true, amount: true },
      });
      
      const currentBalance = ledgers.reduce((acc, ledger) => {
        const amountVal = typeof ledger.amount.toNumber === 'function' ? ledger.amount.toNumber() : Number(ledger.amount);
        return ledger.type === 'CREDIT' ? acc + amountVal : acc - amountVal;
      }, 0);

      // Pastikan ada balance yang ditarik, dan ada fee
      const payoutAdminFee = 2500; 
      const amountToDeduct = dto.amount + payoutAdminFee; // The amount deducted covers requested amount + fee. Alternatively, simple amount deduction.
      
      // Let's assume the requested amount is exactly what gets deducted, and payout transfer to user is amount - fee, OR requested amount gets deducted + fee from shop balance. I'll stick to withdrawing EXACT amount from balance as requested by the prompt template: "if (currentBalance < dto.amount) throw Exception"
      if (currentBalance < dto.amount) {
        throw new BadRequestException('Insufficient balance');
      }

      // 2. Buat payout record
      const payout = await tx.payout.create({
        data: {
          shopId: dto.shopId,
          amount: dto.amount,
          status: 'PENDING',
        },
      });

      // 3. Catat debit di ledger (dana "dikunci" untuk payout)
      await tx.shopLedger.create({
        data: {
          shopId: dto.shopId,
          type: 'DEBIT',
          amount: dto.amount,
          reference: `PAYOUT_LOCK_${payout.id}`,
          description: `Payout request locked - ${payout.id}`,
        },
      });

      // 4. Update shop balance
      await tx.shop.update({
        where: { id: dto.shopId, deletedAt: null },
        data: { balance: { decrement: dto.amount } },
      });

      // 5. Publish event
      await this.payoutPublisher.publish({
        payoutId: payout.id,
        shopId: dto.shopId,
        amount: dto.amount,
        status: 'PENDING',
      });

      return {
        data: payout,
        message: 'Payout requested successfully',
      };
    });
  }

  async approveByAdmin(payoutId: string, dto: ApprovePayoutDto, adminId: string) {
    const payout = await this.payoutRepo.findById(payoutId);
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== 'PENDING') throw new BadRequestException(`Payout is already ${payout.status}`);

    const updated = await this.payoutRepo.updateStatus(payoutId, 'COMPLETED', new Date());

    // Publish event
    // @ts-ignore Prisma Decimal unwrap
    const amountVal = typeof payout.amount.toNumber === 'function' ? payout.amount.toNumber() : Number(payout.amount);
    
    await this.payoutPublisher.publish({
      payoutId: updated.id,
      shopId: updated.shopId,
      amount: amountVal,
      status: 'COMPLETED',
      approvedBy: adminId,
      paidAt: updated.paidAt?.toISOString(),
    });

    return {
      data: updated,
      message: 'Payout approved successfully',
    };
  }

  async rejectByAdmin(payoutId: string, dto: RejectPayoutDto) {
    const payout = await this.payoutRepo.findById(payoutId);
    if (!payout) throw new NotFoundException('Payout not found');
    if (payout.status !== 'PENDING') throw new BadRequestException(`Payout is already ${payout.status}`);

    const updated = await this.db.$transaction(async (tx) => {
      const rejected = await tx.payout.update({
        where: { id: payoutId },
        data: { status: 'FAILED' },
      });

      // Refund the balance since request was rejected
      await tx.shopLedger.create({
        data: {
          shopId: payout.shopId,
          type: 'CREDIT',
          amount: payout.amount,
          reference: `PAYOUT_REJECTED_${payout.id}`,
          description: `Payout rejected: ${dto.reason}`,
        },
      });

      await tx.shop.update({
        where: { id: payout.shopId },
        data: { balance: { increment: payout.amount } },
      });

      return rejected;
    });

    // Publish event
    // @ts-ignore Prisma Decimal unwrap
    const amountVal = typeof payout.amount.toNumber === 'function' ? payout.amount.toNumber() : Number(payout.amount);
    
    await this.payoutPublisher.publish({
      payoutId: updated.id,
      shopId: updated.shopId,
      amount: amountVal,
      status: 'FAILED',
    });

    return {
      data: updated,
      message: 'Payout rejected',
    };
  }
}
