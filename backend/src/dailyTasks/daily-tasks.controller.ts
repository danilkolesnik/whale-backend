import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiParam, ApiQuery } from '@nestjs/swagger';
import { DailyTasksService } from './daily-tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';

@ApiTags('Daily Tasks')
@Controller('daily-tasks')
export class DailyTasksController {
  constructor(private readonly dailyTasksService: DailyTasksService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.dailyTasksService.createTask(createTaskDto);
  }

  @Get('available')
  @ApiOperation({ summary: 'Get available tasks for a user' })
  @ApiQuery({ name: 'telegramId', type: 'string', description: 'User Telegram ID' })
  @ApiResponse({ status: 200, description: 'List of available tasks' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getAvailableTasks(@Query('telegramId') telegramId: string) {
    return await this.dailyTasksService.getUserTasks(telegramId);
  }

  @Post('take/:taskId')
  @ApiOperation({ summary: 'Take a task' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'Task ID' })
  @ApiBody({ schema: { type: 'object', properties: { telegramId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Task taken successfully' })
  @ApiResponse({ status: 404, description: 'User or task not found' })
  async takeTask(@Param('taskId') taskId: number, @Body('telegramId') telegramId: string) {
    return this.dailyTasksService.takeTask(telegramId, String(taskId));
  }

  @Post('complete/:taskId')
  @ApiOperation({ summary: 'Complete a subscription task' })
  @ApiParam({ name: 'taskId', type: 'number', description: 'Task ID' })
  @ApiBody({ schema: { type: 'object', properties: { telegramId: { type: 'string' } } } })
  @ApiResponse({ status: 200, description: 'Task completed successfully' })
  @ApiResponse({ status: 404, description: 'User or task not found' })
  async completeTask(@Param('taskId') taskId: number, @Body('telegramId') telegramId: string) {
    return this.dailyTasksService.checkAndCompleteTask(parseInt(telegramId, 10), taskId);
  }

  @Get('all')
  @ApiOperation({ summary: 'Get all tasks' })
  @ApiResponse({ status: 200, description: 'List of all tasks' })
  async getAllTasks() {
    return await this.dailyTasksService.getAllTasks();
  }

  @Get('test-subscription')
  @ApiOperation({ summary: 'Test subscription check' })
  @ApiQuery({ name: 'chatId', type: 'string', description: 'Chat ID' })
  @ApiQuery({ name: 'telegramId', type: 'string', description: 'User Telegram ID' })
  @ApiResponse({ status: 200, description: 'Subscription check result' })
  async testCheckSubscription(@Query('chatId') chatId: string, @Query('telegramId') telegramId: string) {
    return await this.dailyTasksService.testCheckSubscription(chatId, telegramId);
  }
} 