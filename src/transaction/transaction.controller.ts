import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { TransactionService } from './transaction.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateTransactionDto } from './dto/transaction.dto';
import { Prisma } from '@prisma/client';
import { UpdateTransactionDto } from './dto/update-transaction.dto';

@ApiTags('transactions')
@Controller('transactions')
export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  @ApiOperation({ summary: 'Create a transaction' })
  @ApiResponse({ status: 201, description: 'The transaction has been successfully created.' })
  @ApiResponse({ status: 400, description: 'Invalid input.' })
  @Post()
  async create(@Body() data: CreateTransactionDto) {
    const transactionData: Prisma.TransactionCreateInput = {
      telegramId: data.telegramId,
      displayName: data.displayName,
      amount: data.amount,
      walletNumber: data.walletNumber,
      status: data.status,
      user: { connect: { telegramId: data.telegramId } }
    };
    return this.transactionService.createTransaction(transactionData);
  }

  // @ApiOperation({ summary: 'Get all transactions for a user' })
  // @ApiResponse({ status: 200, description: 'Return all transactions for a user.' })
  // @ApiResponse({ status: 404, description: 'User not found.' })
  // @Get(':userId')
  // async findAll(@Param('userId') userId: number) {
  //   return this.transactionService.getTransactions(userId);
  // }

  @Get('recent')
  async getRecentTransactions() {
    return await this.transactionService.getRecentTransactions();
  }

  @Post('update')
  async updateTransactionMessage(@Body() body: UpdateTransactionDto) {
    return await this.transactionService.updateTransactionMessage(body.id, body.messageId, body.status);
  }

  @Get('message/:messageId')
  async getTransactionByMessageId(@Param('messageId') messageId: string) {
    return await this.transactionService.getTransactionByMessageId(Number(messageId));
  }
} 