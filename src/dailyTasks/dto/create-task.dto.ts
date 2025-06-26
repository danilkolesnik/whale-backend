import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsEnum(['subscription', 'invite', 'external_sub'])
  type: 'subscription' | 'invite' | 'external_sub';

  @IsNumber()
  coin: number;

  @IsOptional()
  @IsString()
  chatId?: string;

  @IsOptional()
  @IsString()
  channelLink?: string;

  @IsOptional()
  @IsNumber()
  requiredFriends?: number;

  @IsString()
  title: string;
} 