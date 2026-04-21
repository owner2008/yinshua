import { Module } from '@nestjs/common';
import { MemberController } from './members.controller';
import { MembersService } from './members.service';

@Module({
  controllers: [MemberController],
  providers: [MembersService],
})
export class MembersModule {}
