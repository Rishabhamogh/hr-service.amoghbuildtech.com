import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { HttpRequestsModule } from 'src/shared/http-requests/http-requests.module';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LeavesModule } from 'src/leaves/leaves.module';
import { OnDutyModule } from 'src/on-duty/on-duty.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Attendance, AttendanceSchema } from './schemas/attendance.schema';
import { AttendanceCron } from './attendance.cron';
import { HRModule } from 'src/hr-status/hr-status.module';
import { AttendanceSummary, AttendanceSummarySchema } from './schemas/attendance-summary.schema';

@Module({
  imports:[
    HttpRequestsModule, 
    RequestContextModule, 
    CacheModule,
    UsersModule, 
    JwtModule,
    LeavesModule,
    OnDutyModule,
    MongooseModule.forFeature([{ name: Attendance.name, schema: AttendanceSchema },
        { name: AttendanceSummary.name, schema: AttendanceSummarySchema },

    ]),
    HRModule
  ],
  providers: [AttendanceService, AttendanceCron],
  controllers: [AttendanceController],
  exports:[AttendanceService]
})
export class AttendanceModule {}
