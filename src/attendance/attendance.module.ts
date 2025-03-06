import { Module } from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { HttpRequestsModule } from 'src/shared/http-requests/http-requests.module';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports:[HttpRequestsModule, RequestContextModule, CacheModule,UsersModule, 
    JwtModule
  ],
  providers: [AttendanceService],
  controllers: [AttendanceController]
})
export class AttendanceModule {}
