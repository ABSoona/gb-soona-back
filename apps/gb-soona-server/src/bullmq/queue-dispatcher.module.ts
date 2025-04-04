// bullmq/bullmq.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigModule } from '@nestjs/config';
import { QueueDispatcherService } from './queue-dispatcher.service';
import { Queues } from './queues';
import { redisConnection } from './queue-dispatcher.config';

@Module({
  imports: [
    ConfigModule,
    BullModule.forRoot({
      connection:redisConnection
    }),

    // 💡 Dynamique !
    BullModule.registerQueue(
      ...Object.values(Queues).map((name) => ({ name }))
    ),
  ],
  providers: [QueueDispatcherService],
  exports: [QueueDispatcherService],
})
export class QueueDispatcherModule {}
