import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { HttpRequestsModule } from 'src/shared/http-requests/http-requests.module';

@Module({
  imports:[HttpRequestsModule],
  providers: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
