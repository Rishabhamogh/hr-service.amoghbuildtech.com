import { Module } from '@nestjs/common';
import { OnDutyService } from './on-duty.service';
import { OnDutyController } from './on-duty.controller';

@Module({
  providers: [OnDutyService],
  controllers: [OnDutyController]
})
export class OnDutyModule {}
