import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { Queues } from './queues';

@Injectable()
export class QueueDispatcherService implements OnModuleInit {
  private readonly queueMap = new Map<Queues, Queue>();

  constructor(
    @InjectQueue(Queues.MAIL) private readonly mailQueue: Queue,
    @InjectQueue(Queues.NOTIFICATION) private readonly notificationQueue: Queue,
    @InjectQueue(Queues.DEMANDE) private readonly userSyncQueue: Queue,
  ) {}

  onModuleInit() {
    const allQueues: Record<Queues, Queue> = {
      [Queues.MAIL]: this.mailQueue,
      [Queues.NOTIFICATION]: this.notificationQueue,
      [Queues.DEMANDE]: this.userSyncQueue,
    };

    for (const [name, queue] of Object.entries(allQueues) as [Queues, Queue][]) {
      this.queueMap.set(name, queue);
    }
  }

  getQueue(name: Queues): Queue {
    const queue = this.queueMap.get(name);
    if (!queue) throw new Error(`Queue "${name}" not found`);
    return queue;
  }

  async dispatch(name: Queues, data: unknown, options?: Record<string, any>) {
    const queue = this.getQueue(name);
    return queue.add(name, data, options);
  }
}
