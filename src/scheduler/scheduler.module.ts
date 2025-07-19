import { Module, forwardRef } from '@nestjs/common';
import { SchedulerService } from './scheduler.service';
// import { StartupService } from 'src/startup/startup.service';
import { StartupModule } from 'src/startup/startup.module';
import { AttendanceModule } from 'src/attendance/attendance.module';
// import { CacheService } from 'src/shared/cache/cache.service';
// import { UsersService } from 'src/users/users.service';
// import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    AttendanceModule
  ],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
