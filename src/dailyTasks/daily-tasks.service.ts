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
          chatId: createTaskDto.chatId ? String(createTaskDto.chatId) : null,
          channelLink: createTaskDto.channelLink,
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
      console.log(error);
      return {
        success: false,
        error: 'Failed to create task'
      };
    }
  }

  async getUserTasks(telegramId: string): Promise<{
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
        data: user.tasks
          .filter(task => task.status === 'available' || task.status === 'in_progress')
          .map(task => ({
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
      const user = await this.prisma.user.findUnique({
        where: { telegramId },
        include: { tasks: true }
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const task = await this.prisma.task.findUnique({
        where: { id: taskId }
      });

      if (!task) {
        return {
          success: false,
          error: 'Task not found'
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
          user: {
            connect: { telegramId }
          }
        }
      });

      // Update the user's tasks array to include the new task
      await this.prisma.user.update({
        where: { telegramId },
        data: {
          tasks: {
            connect: { id: taskId }
          }
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

      const chatIdNumber = task.chatId ? parseInt(task.chatId, 10) : undefined;
      if (chatIdNumber === undefined || isNaN(chatIdNumber)) {
        return {
          success: false,
          error: 'Invalid chatId'
        };
      }

      const subscriptionResult = await this.telegramSubService.checkSubscription(
        chatIdNumber,
        parseInt(telegramId, 10)
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

  async getAllTasks(): Promise<{
    success: boolean;
    error?: string;
    data?: Task[];
  }> {
    try {
      const tasks = await this.prisma.task.findMany();

      return {
        success: true,
        data: tasks.map(task => ({
          ...task,
          type: task.type as TaskType,
          status: task.status as 'available' | 'in_progress' | 'completed'
        }))
      };
    } catch (error) {
      return {
        success: false,
        error: 'Failed to retrieve tasks'
      };
    }
  }

  async testCheckSubscription(chatId: string, telegramId: string): Promise<{ success: boolean; isSubscribed?: boolean; error?: string }> {
    try {
      const response = await this.telegramSubService.checkSubscription(parseInt(chatId, 10), parseInt(telegramId, 10));
      return { success: true, isSubscribed: response.data?.isSubscribed };
    } catch (error) {
      return { success: false, error: 'Failed to check subscription' };
    }
  }
} 