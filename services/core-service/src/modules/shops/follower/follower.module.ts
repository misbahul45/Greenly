import { Module } from '@nestjs/common';
import { FollowerService } from './follower.service';
import { FollowerController } from './follower.controller';

@Module({
  providers: [FollowerService],
  controllers: [FollowerController]
})
export class FollowerModule {}
