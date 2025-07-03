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
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const taskIdInt = parseInt(taskId, 10);
      const task = await this.prisma.task.findUnique({
        where: { id: taskIdInt },
      });

      if (!task) {
        return {
          success: false,
          error: 'Task not found'
        };
      }

      const existingUserTask = await this.prisma.userTask.findUnique({
        where: {
          userId_taskId: {
            userId: user.id,
            taskId: taskIdInt
          }
        }
      });

      if (existingUserTask) {
        return {
          success: false,
          error: 'Task already taken by the user'
        };
      }

      const userTask = await this.prisma.userTask.create({
        data: {
          userId: user.id,
          taskId: taskIdInt,
          status: 'in_progress' as const
        }
      });

      return {
        success: true,
        data: {
          ...task,
          type: task.type as TaskType,
          status: userTask.status as 'available' | 'in_progress' | 'completed'
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
      const taskIdInt = parseInt(taskId.toString(), 10);
      const userTask = await this.prisma.userTask.findUnique({
        where: {
          userId_taskId: {
            userId: user.id,
            taskId: taskIdInt
          }
        },
        include: {
          task: true
        }
      });

      console.log(userTask);

      if (!userTask) {
        return {
          success: false,
          error: 'Task not found for user'
        };
      }


      if (userTask.status === 'completed') {
        return {
          success: false,
          error: 'Task already completed'
        };
      }
      if (userTask.task.type === 'subscription') {
        if (userTask.task.chatId) {
          const chatIdNumber = parseInt(userTask.task.chatId, 10);
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
      else if (userTask.task.type === 'invite') {
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
        const requiredCount = userTask.task.requiredFriends ?? 0;
  
        await this.prisma.userTask.update({
          where: {
            userId_taskId: {
              userId: user.id,
              taskId: taskIdInt
            }
          },
          data: {
            friendsCount: friendsCount,
            status: 'in_progress',
            completedAt: null
          }
        });
  
        if (friendsCount < requiredCount) {
          return {
            success: false,
            error: 'Not enough new friends added'
          };
        }
  
        console.log(`Number of new friends added: ${friendsCount}`);
  
        await this.prisma.userTask.update({
          where: {
            userId_taskId: {
              userId: user.id,
              taskId: taskIdInt
            }
          },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });
      } else if (userTask.task.type === 'external_sub') {
        await this.prisma.userTask.update({
          where: {
            userId_taskId: {
              userId: user.id,
              taskId: taskIdInt
            }
          },
          data: {
            status: 'completed',
            completedAt: new Date()
          }
        });
      }
  
      if (!user.balance) {
        return {
          success: false,
          error: 'User balance not found'
        };
      }
      const balance = user.balance as { money: number; shield: number; tools: number; usdt: number };
      balance.money += userTask.task.coin;
  
      await this.prisma.user.update({
        where: { telegramId },
        data: {
          balance: {
            money: balance.money,
            shield: balance.shield,
            tools: balance.tools,
            usdt: balance.usdt
          }
        }
      });
  
      return {
        success: true,
        data: {
          task: {
            ...userTask.task,
            status: 'completed',
            type: userTask.task.type as TaskType
          },
          reward: userTask.task.coin
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

  // async createInviteTask(telegramId: string, requiredFriends: number): Promise<{ success: boolean; error?: string; data?: Task }> {
  //   try {
  //     const task = await this.prisma.task.create({
  //       data: {
  //         type: 'invite',
  //         coin: 0, // Set the reward for completing the task
  //         status: 'available',
  //         user: {
  //           connect: { telegramId }
  //         },
  //         channelLink: null,
  //         chatId: null
  //       }
  //     });

  //     return {
  //       success: true,
  //       data: {
  //         ...task,
  //         type: task.type as TaskType,
  //         status: task.status as 'available' | 'in_progress' | 'completed'
  //       }
  //     };
  //   } catch (error: any) {
  //     console.log(error);
  //     return {
  //       success: false,
  //       error: 'Failed to create invite task'
  //     };
  //   }
  // }
} 