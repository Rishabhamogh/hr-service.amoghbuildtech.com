import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { HttpRequestsModule } from 'src/shared/http-requests/http-requests.module';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { LeavesModule } from 'src/leaves/leaves.module';

@Module({
  imports:[HttpRequestsModule, RequestContextModule, CacheModule,UsersModule, 
    JwtModule,
    LeavesModule
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
