import { Module } from '@nestjs/common';
import { MailService } from './mail.service';
import { BullModule } from '@nestjs/bullmq';
import { Queues } from 'src/bullmq/queues';
import { QueueDispatcherModule } from 'src/bullmq/queue-dispatcher.module';
import { MailProcessor } from './mail.processor';

@Module({
  imports: [
    BullModule.registerQueue({ name: Queues.MAIL }),QueueDispatcherModule
  ],
  providers: [MailService,MailProcessor],
  exports: [MailService],
})
export class MailModule {}