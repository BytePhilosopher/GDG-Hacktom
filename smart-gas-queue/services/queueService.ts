import api from '@/lib/axios';
import { Queue, QueueRequest } from '@/types';

class QueueService {
  async joinQueue(data: QueueRequest): Promise<Queue> {
    const { data: res } = await api.post<Queue>('/queue/join', {
      stationId: data.stationId,
      fuelType:  data.fuelType,
      liters:    data.liters,
    });
    return res;
  }

  async getQueuePosition(queueId: string): Promise<Queue> {
    const { data } = await api.get<Queue>(`/queue/position/${queueId}`);
    return data;
  }

  async cancelQueue(queueId: string): Promise<void> {
    await api.delete(`/queue/cancel/${queueId}`);
  }

  async getActiveQueue(): Promise<Queue | null> {
    const { data } = await api.get<Queue | null>('/driver/active-queue');
    return data;
  }

  async getHistory(): Promise<Queue[]> {
    const { data } = await api.get<Queue[]>('/driver/history');
    return data;
  }
}

export const queueService = new QueueService();
