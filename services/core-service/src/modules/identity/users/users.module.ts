import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepositository } from './users.repository';
import { ScheduleService } from './schedule.service';

@Module({
  providers: [UsersService, UsersRepositository, ScheduleService],
  controllers: [UsersController]
})
export class UsersModule {}
