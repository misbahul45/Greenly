import { Controller, Delete, Get, Patch, Post } from '@nestjs/common';

@Controller('')
export class MemberController {

    @Post()
    addMember(){}

    @Get()
    findMany(){}

    @Patch('/:memberId')
    updateMember(){}

    @Delete('/:memberId')
    deleteMember(){}
}
