import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('shops')
export class ShopsController {
    @Get('/')
    findAll(){

    }
    
    @Post('/')
    create(){

    }

    @Get(':id')
    findOne(){

    }

    @Get('/me')
    findMyShop(){}


    @Patch('/:id')
    update(){}

    @Delete('/:id')
    delete(){}
}
