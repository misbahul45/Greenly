import { Module } from "@nestjs/common";
import { FollowerService } from "./follower.service";
import { FollowerController } from "./follower.controller";
import { FollowerRepository } from "./follower.repository";
import { ShopFollowerPublisher } from "../publisher/shop.follower.publisher";

@Module({
  providers: [FollowerService, FollowerRepository, ShopFollowerPublisher],
  controllers: [FollowerController],
})
export class FollowerModule {}
