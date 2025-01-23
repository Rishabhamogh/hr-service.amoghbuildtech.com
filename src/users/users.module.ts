import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schemas/user.schema';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule } from '@nestjs/config';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';
import { UserDbService } from './user-db.service';
import { ErrorHandlingModule } from 'src/shared/error-handling/error-handling.module';
import { CacheModule } from 'src/shared/cache/cache.module';
// import { StartupModule } from 'src/startup/startup.module';
// import { StartupService } from 'src/startup/startup.service';
import { ReloadService } from 'src/startup/reload.service';
import { AccessControlService } from 'src/shared/access-control/access-control.service';
import { AuthGuard } from 'src/auth/auth.guard';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule,
    ConfigModule,
    RequestContextModule,
    ErrorHandlingModule,
    CacheModule,
   // AuthGuard
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserDbService,
    // StartupService,
    ReloadService,
    AccessControlService,
  ],
  exports: [UsersService], 
})
export class UsersModule {}
