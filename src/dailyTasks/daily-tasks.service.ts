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
          title: createTaskDto.title
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

  async takeTask(telegramId: string, taskId: string): Promise<{
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

      const taskIdInt = parseInt(taskId, 10);
      const task = await this.prisma.task.findUnique({
        where: { id: taskIdInt }
      });

      if (!task) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      // if (task.status !== 'available') {
      //   return {
      //     success: false,
      //     error: 'Task is not available'
      //   };
      // }

      const existingTask = user.tasks.find(t => t.id === taskIdInt);
      if (existingTask) {
        return {
          success: false,
          error: 'Task already taken by the user'
        };
      }

      const updatedTask = await this.prisma.task.update({
        where: { id: taskIdInt },
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
            connect: { id: taskIdInt }
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
      console.log(error);
      return {
        success: false,
        error: 'Failed to take task'
      };
    }
  }

  async checkAndCompleteTask(
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

      const task = user.tasks.find(t => t.id === taskId);
      console.log(task);
      console.log(taskId);
      

      if (!task) {
        return {
          success: false,
          error: 'Task not found for user'
        };
      }

      if (task.status === 'completed') {
        return {
          success: false,
          error: 'Task already completed'
        };
      }
  
      if (task.type === 'subscription') {
        if (task.chatId) {
          const chatIdNumber = parseInt(task.chatId, 10);
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
        } else {
          return {
            success: false,
            error: 'Invalid chatId'
          };
        }
      }
  
      else if (task.type === 'invite') {
        const friends = Array.isArray(user.friends) ? user.friends : [];
        const newFriends = await Promise.all(
          friends.map(async (telegramId: string) => {
            const friend = await this.prisma.user.findUnique({
              where: { telegramId },
            });
            return friend && friend.isNewUser ? friend : null;
          })
        ).then(results => results.filter(friend => friend !== null));
  
        const friendsCount = newFriends.length;
        const requiredCount = 0;
  
        if (friendsCount < requiredCount) {
          return {
            success: false,
            error: 'Not enough new friends added'
          };
        }
      }
  
      else {
        return {
          success: false,
          error: 'Invalid task type'
        };
      }
  
      if (!user.balance) {
        return {
          success: false,
          error: 'User balance not found'
        };
      }
      const balance = user.balance as { money: number; shield: number };
      balance.money += task.coin;
  
      await this.prisma.user.update({
        where: { telegramId },
        data: {
          tasks: {
            update: {
              where: { id: taskId },
              data: {
                status: 'completed',
                completedAt: new Date()
              }
            }
          },
          balance: {
            set: {
              money: balance.money,
              shield: balance.shield
            }
          }
        }
      });
  
      return {
        success: true,
        data: {
          task: {
            ...task,
            status: 'completed',
            type: task.type as TaskType
          },
          reward: task.coin
        }
      };
    } catch (error: unknown) {
      console.error('Error completing task:', error);
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
      console.log(error);
      return { success: false, error: 'Failed to check subscription' };
    }
  }

  async createInviteTask(telegramId: string, requiredFriends: number): Promise<{ success: boolean; error?: string; data?: Task }> {
    try {
      const task = await this.prisma.task.create({
        data: {
          type: 'invite',
          coin: 0, // Set the reward for completing the task
          status: 'available',
          user: {
            connect: { telegramId }
          },
          channelLink: null,
          chatId: null
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
    } catch (error: any) {
      console.log(error);
      return {
        success: false,
        error: 'Failed to create invite task'
      };
    }
  }
} 