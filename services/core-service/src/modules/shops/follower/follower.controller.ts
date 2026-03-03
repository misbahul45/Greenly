import { Controller, Get, Patch, Post } from '@nestjs/common';

@Controller()
export class FollowerController {
    @Post('/follow')
    follow(){}

    @Patch('/unfollow')
    unfollow(){}

    @Get('/followers')
    followers(){}
}
