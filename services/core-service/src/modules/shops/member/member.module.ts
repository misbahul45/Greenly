import { Module } from '@nestjs/common';
import { MemberService } from './member.service';
import { MemberController } from './member.controller';
import { MemberRepository } from './member.repository';

@Module({
  providers: [MemberService, MemberRepository],
  controllers: [MemberController]
})
export class MemberModule {}
