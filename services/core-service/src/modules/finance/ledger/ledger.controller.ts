import { Controller, Get, Param, Query } from '@nestjs/common';
import { LedgerService } from './ledger.service';
import { RequireFinanceAccess } from '../shared/decorators/require-finance-access.decorator';
import { ZodValidationPipe } from '../../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../../libs/errors/handler.error';
import { ListLedgersQuerySchema, type ListLedgersQueryDto } from './dto';

@Controller('shops/:shopId/finance')
export class LedgerController {
  constructor(private readonly ledgerService: LedgerService) {}

  @Get('ledgers')
  @RequireFinanceAccess('PLATFORM_ADMIN', 'SHOP_OWNER')
  async getLedgers(
    @Param('shopId') shopId: string,
    @Query(new ZodValidationPipe(ListLedgersQuerySchema)) query: ListLedgersQueryDto,
  ) {
    return ErrorHandler(() => this.ledgerService.listByShop(shopId, query));
  }
}
