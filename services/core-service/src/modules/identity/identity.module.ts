import { Module } from '@nestjs/common';
import { MeModule } from './me/me.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';

@Module({
  imports: [MeModule, UsersModule, RolesModule]
})
export class IdentityModule {}
