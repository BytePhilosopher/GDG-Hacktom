import { Queue, QueueRequest } from '@/types';
import { MOCK_ACTIVE_QUEUE, MOCK_QUEUE_HISTORY, MOCK_STATIONS } from '@/lib/mockData';

export class QueueService {
  async joinQueue(data: QueueRequest): Promise<Queue> {
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const station = MOCK_STATIONS.find((s) => s.id === data.stationId);
    const queue: Queue = {
      id: 'q-' + Date.now(),
      driverId: 'user-1',
      stationId: data.stationId,
      stationName: station?.name || 'Unknown Station',
      fuelType: data.fuelType,
      liters: data.liters,
      totalPrice: data.totalPrice,
      advancePayment: data.advancePayment,
      paidAmount: data.advancePayment,
      position: Math.floor(Math.random() * 15) + 5,
      estimatedWait: Math.floor(Math.random() * 40) + 10,
      status: 'active',
      paymentStatus: 'paid',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return queue;
  }

  async getQueuePosition(queueId: string): Promise<Queue> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return { ...MOCK_ACTIVE_QUEUE, id: queueId };
  }

  async cancelQueue(queueId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  async getActiveQueue(): Promise<Queue | null> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return MOCK_ACTIVE_QUEUE;
  }

  async getHistory(): Promise<Queue[]> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    return MOCK_QUEUE_HISTORY;
  }
}

export const queueService = new QueueService();
