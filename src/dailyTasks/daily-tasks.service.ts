import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TelegramSubService } from '../telegram/telegram-sub.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { Task, TaskType } from './types/task.types';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class DailyTasksService {
  constructor(
    private prisma: PrismaService,
    private telegramSubService: TelegramSubService
  ) {}

  async createTask(createTaskDto: CreateTaskDto): Promise<{
    success: boolean;
    error?: string;
    data?: Task;
  }> {
    try {
      const task = await this.prisma.task.create({
        data: {
          type: createTaskDto.type,
          coin: createTaskDto.coin,
          status: 'available' as const,
          chatId: createTaskDto.chatId,
          user: {
            connect: {
              telegramId: createTaskDto.userId
            }
          }
        }
      });

      return {
        success: true,
        data: {
          ...task,
          type: task.type as TaskType,
          status: task.status as 'available' | 'in_progress' | 'completed'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to create task'
      };
    }
  }

  async getAvailableTasks(telegramId: string): Promise<{
    success: boolean;
    error?: string;
    data?: Task[];
  }> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: {
          tasks: true
        }
      }) as (User & { tasks: any[] }) | null;

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      return {
        success: true,
        data: user.tasks.map(task => ({
          ...task,
          type: task.type as TaskType,
          status: task.status as 'available' | 'in_progress' | 'completed'
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to get tasks'
      };
    }
  }

  async takeTask(telegramId: string, taskId: number): Promise<{
    success: boolean;
    error?: string;
    data?: Task;
  }> {
    try {
      const [user, task] = await Promise.all([
        this.prisma.user.findUnique({
          where: { telegramId }
        }),
        this.prisma.task.findUnique({
          where: { id: taskId }
        })
      ]);

      if (!user || !task) {
        return {
          success: false,
          error: 'User or task not found'
        };
      }

      if (task.status !== 'available') {
        return {
          success: false,
          error: 'Task is not available'
        };
      }

      const updatedTask = await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: 'in_progress' as const,
          userId: telegramId
        }
      });

      return {
        success: true,
        data: {
          ...updatedTask,
          type: updatedTask.type as TaskType,
          status: updatedTask.status as 'available' | 'in_progress' | 'completed'
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to take task'
      };
    }
  }

  async checkAndCompleteSubscriptionTask(
    telegramId: string,
    taskId: number
  ): Promise<{
    success: boolean;
    error?: string;
    data?: {
      task: Task;
      reward: number;
    };
  }> {
    try {
      const [user, task] = await Promise.all([
        this.prisma.user.findUnique({
          where: { telegramId }
        }),
        this.prisma.task.findUnique({
          where: { id: taskId }
        })
      ]);

      if (!user || !task) {
        return {
          success: false,
          error: 'User or task not found'
        };
      }

      if (task.type !== 'subscription' || !task.chatId) {
        return {
          success: false,
          error: 'Invalid task type or missing chatId'
        };
      }

      const subscriptionResult = await this.telegramSubService.checkSubscription(
        task.chatId,
        parseInt(telegramId)
      );

      if (!subscriptionResult.success || !subscriptionResult.data?.isSubscribed) {
        return {
          success: false,
          error: 'User is not subscribed'
        };
      }

      const [updatedTask, updatedUser] = await Promise.all([
        this.prisma.task.update({
          where: { id: taskId },
          data: {
            status: 'completed' as const,
            completedAt: new Date()
          }
        }),
        this.prisma.user.update({
          where: { telegramId },
          data: {
            balance: {
              money: (user.balance as any).money + task.coin,
              shield: (user.balance as any).shield
            }
          }
        })
      ]);

      return {
        success: true,
        data: {
          task: {
            ...updatedTask,
            type: updatedTask.type as TaskType,
            status: updatedTask.status as 'available' | 'in_progress' | 'completed'
          },
          reward: task.coin
        }
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to complete task'
      };
    }
  }
} 