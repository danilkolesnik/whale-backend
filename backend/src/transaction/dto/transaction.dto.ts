import { IsString, IsNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransactionDto {
  @ApiProperty({ description: 'Telegram ID of the user' })
  @IsString()
  @IsNotEmpty()
  telegramId: string;

  @ApiProperty({ description: 'Display name of the user' })
  @IsString()
  @IsNotEmpty()
  displayName: string;

  @ApiProperty({ description: 'Amount to withdraw' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ description: 'Wallet number for withdrawal' })
  @IsString()
  @IsNotEmpty()
  walletNumber: string;

  @ApiProperty({ description: 'Status of the transaction' })
  @IsString()
  @IsNotEmpty()
  status: string;
} 