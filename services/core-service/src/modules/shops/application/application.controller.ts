import { Controller, Get, Patch, Post } from '@nestjs/common';
import { Roles } from '../../auth/decorators/roles.decorator';

@Controller('')
export class ApplicationController {
    @Post()
    create(){}

    @Patch()
    update(){}


    @Roles('SUPER_ADMIN')
    @Patch('/review')
    review(){}

    @Get()
    findOne(){}

    @Roles('SUPER_ADMIN')
    @Get()
    findAll(){}

    @Get('/me')
    findMyApplications(){}
}
