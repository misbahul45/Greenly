import { Controller, Get, Patch } from '@nestjs/common';

@Controller()
export class OrderController {
    @Get()
    findMany(){}

    @Get('/:id')
    findOne(){}

    @Patch('/:id/status')
    updateStatus(){}

    @Patch('/:id/refund/:refundId')
    updateRefund(){}
}
