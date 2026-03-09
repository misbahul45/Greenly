import { Controller, Get } from '@nestjs/common';

@Controller()
export class DashboardController {
    @Get('/summary')
    summary(){}

    @Get('revenue')
    findRevenue(){}

    @Get('/recent-orders')
    findOrder(){

    }
    
}
