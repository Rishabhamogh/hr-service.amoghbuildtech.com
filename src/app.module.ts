import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AttendanceModule } from './attendance/attendance.module';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { CacheModule } from '@nestjs/cache-manager';
import { OnDutyModule } from './on-duty/on-duty.module';
import { LeavesModule } from './leaves/leaves.module';
import { StartupModule } from './startup/startup.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      expandVariables: true,
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('database.uri')
      }),
      inject: [ConfigService],
    }),
    CacheModule.register({
      isGlobal: true
    }),
    AuthModule,
    AttendanceModule,
    OnDutyModule,
    LeavesModule,
    StartupModule
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
