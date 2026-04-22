import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface CurrentMember {
  userId: number;
  wxOpenid?: string;
}

export const CurrentMember = createParamDecorator(
  (_data: unknown, context: ExecutionContext): CurrentMember => context.switchToHttp().getRequest().member,
);
