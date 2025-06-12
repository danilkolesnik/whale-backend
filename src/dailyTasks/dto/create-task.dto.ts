import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsEnum(['subscription', 'invite'])
  type: 'subscription' | 'invite';

  @IsNumber()
  coin: number;

  @IsOptional()
  chatId?: string;

  @IsOptional()
  @IsString()
  channelLink?: string;

  @IsOptional()
  @IsNumber()
  requiredFriends?: number;
} 