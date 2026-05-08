import { Injectable } from "@nestjs/common";
import { FinanceRepository } from "./finance.repo";
import {
  LedgerQueryDTO,
  CreatePayoutDTO,
  PayoutQueryDTO,
} from "./finance.dto";
import { InsufficientBalanceError } from "../../../libs/errors/domain.error";
import { ShopFinancePublisher } from "../publisher/shop.finance.publisher";
import * as crypto from "crypto";

@Injectable()
export class FinanceService {
  constructor(
    private readonly repo: FinanceRepository,
    private readonly publisher: ShopFinancePublisher,
  ) {}

  async getBalance(shopId: string) {
    const [currentBalance, pendingPayout] = await Promise.all([
      this.repo.getBalance(shopId),
      this.repo.getPendingPayoutTotal(shopId),
    ]);

    return {
      data: {
        currentBalance,
        pendingPayout,
      },
      message: "Balance fetched successfully",
    };
  }

  async getLedger(shopId: string, query: LedgerQueryDTO) {
    const { page, limit, type, search, createdFrom, createdTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { data, meta } = await this.repo.findLedgerEntries({
      shopId,
      skip,
      take: limit,
      type,
      search,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    });

    return {
      data,
      meta,
      message: "Ledger entries fetched successfully",
    };
  }

  async requestPayout(shopId: string, body: CreatePayoutDTO) {
    try {
      const payout = await this.repo.createPayout(shopId, body.amount);

      await this.publisher.publishPayoutRequested({
        shopId,
        payoutId: payout.id,
        amount: body.amount.toString(),
        timestamp: new Date().toISOString(),
        correlationId: crypto.randomUUID(),
      });

      return {
        data: payout,
        message: "Payout requested successfully",
      };
    } catch (error) {
      if (error instanceof Error && error.message === "INSUFFICIENT_BALANCE") {
        throw new InsufficientBalanceError("current", body.amount.toString());
      }
      throw error;
    }
  }

  async getPayouts(shopId: string, query: PayoutQueryDTO) {
    const { page, limit, status, createdFrom, createdTo, sortBy, sortOrder } = query;
    const skip = (page - 1) * limit;

    const { data, meta } = await this.repo.findPayouts({
      shopId,
      skip,
      take: limit,
      status,
      createdFrom,
      createdTo,
      sortBy,
      sortOrder,
    });

    return {
      data,
      meta,
      message: "Payouts fetched successfully",
    };
  }
}
