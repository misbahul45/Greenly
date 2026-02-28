import { Module } from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UsersController } from './users.controller';
import { UsersRepositository } from './users.repository';
import { ScheduleService } from './services/schedule.service';
import { DeletedUserPublisher } from './publisher/deleted.user.publisher';

@Module({
  providers: [UsersService, UsersRepositository, ScheduleService, DeletedUserPublisher],
  controllers: [UsersController]
})
export class UsersModule {}
