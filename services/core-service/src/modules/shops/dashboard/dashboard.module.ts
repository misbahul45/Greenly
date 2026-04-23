import { Module } from "@nestjs/common";
import { DashboardService } from "./dashboard.service";
import { DashboardController } from "./dashboard.controller";
import { DashboardRepository } from "./dashboard.repository";
import { MemberModule } from "../member/member.module";

@Module({
  providers: [DashboardService, DashboardRepository],
  controllers: [DashboardController],
  imports:[MemberModule]
})
export class DashboardModule {}
