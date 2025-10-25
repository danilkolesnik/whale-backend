import { IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ContributeToWhaleDto {
  @ApiProperty({ 
    description: 'Telegram ID of the user making the contribution',
    example: '123456789'
  })
  @IsString()
  userId: string; // telegramId пользователя

  @ApiProperty({ 
    description: 'ID of the whale to contribute to',
    example: 'abc123def'
  })
  @IsString()
  whaleId: string; // ID кита

  @ApiProperty({ 
    description: 'Amount to contribute to the whale',
    example: 100.50,
    minimum: 0.01
  })
  @IsNumber()
  @Min(0.01)
  amount: number; // сумма для внесения
}
