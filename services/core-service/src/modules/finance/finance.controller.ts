import { Controller, Get, Query } from '@nestjs/common';
import { FinanceService } from './finance.service';
import { RequireFinanceAccess } from './shared/decorators/require-finance-access.decorator';
import { ZodValidationPipe } from '../../libs/pipes/zod-validation.pipe';
import ErrorHandler from '../../libs/errors/handler.error';
import { FinanceOverviewQuerySchema, type FinanceOverviewQueryDto } from './finance.dto';

@Controller('admin/finance')
export class FinanceController {
  constructor(private readonly financeService: FinanceService) {}

  @Get('overview')
  @RequireFinanceAccess('PLATFORM_ADMIN')
  async getFinanceOverview(
    @Query(new ZodValidationPipe(FinanceOverviewQuerySchema)) query: FinanceOverviewQueryDto,
  ) {
    return ErrorHandler(() => this.financeService.getPlatformOverview(query));
  }
}
