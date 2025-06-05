export type TaskType = 'subscription' | 'invite';

export interface Task {
  id: number;
  type: TaskType;
  coin: number;
  status: 'available' | 'in_progress' | 'completed';
  completedAt: Date | null;
  chatId: number | null;
} 