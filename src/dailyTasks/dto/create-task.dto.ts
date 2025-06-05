import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateTaskDto {
  @IsEnum(['subscription', 'invite'])
  type: 'subscription' | 'invite';

  @IsNumber()
  coin: number;

  @IsNumber()
  @IsOptional()
  chatId?: number;

  @IsString()
  userId: string;
} 