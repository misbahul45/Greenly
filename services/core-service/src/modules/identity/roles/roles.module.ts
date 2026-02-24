import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RolesRepositository } from './roles.repository';

@Module({
  providers: [RolesService, RolesRepositository],
  controllers: [RolesController]
})
export class RolesModule {}
