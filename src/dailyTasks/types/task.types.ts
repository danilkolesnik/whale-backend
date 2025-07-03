export type TaskType = 'subscription' | 'invite' | 'external_sub';

export interface Task {
  id: number;
  taskId: number;
  type: TaskType;
  coin: number;
  status: 'available' | 'in_progress' | 'completed';
  completedAt: Date | null;
  chatId: string | null;
} 