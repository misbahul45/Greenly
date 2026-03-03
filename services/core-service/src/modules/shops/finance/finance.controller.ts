import { Controller, Get, Post } from '@nestjs/common';

@Controller()
export class FinanceController {
    @Get('/balance')
    balance(){}

    @Get('/ledger')
    ledger(){}

    @Post('/payout')
    payout(){}

    @Get('/payouts')
    findPayouts(){}
}
