// bullmq/bullmq.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { QueueDispatcherService } from './queue-dispatcher.service';
import { Queues } from './queues';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: Number(process.env.REDIS_PORT) || 6379,
      },
    }),

    // 💡 Dynamique !
    BullModule.registerQueue(
      ...Object.values(Queues).map((name) => ({ name }))
    ),
  ],
  providers: [QueueDispatcherService],
  exports: [QueueDispatcherService],
})
export class BullMqModule {}
