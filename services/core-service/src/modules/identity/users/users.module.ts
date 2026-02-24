import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UsersRepositository } from './users.repository';

@Module({
  providers: [UsersService, UsersRepositository],
  controllers: [UsersController]
})
export class UsersModule {}
