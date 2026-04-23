import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberRepository } from './member.repository';
import { ShopMemberPublisher } from '../publisher/shop.member.publisher';

@Module({
  providers: [MemberService, MemberRepository, ShopMemberPublisher],
  controllers: [MemberController],
  exports:[MemberRepository]
})
export class MemberModule {}
