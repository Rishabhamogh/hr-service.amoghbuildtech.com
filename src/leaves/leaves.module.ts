import { Module } from '@nestjs/common';
import { LeavesService } from './leaves.service';
import { LeavesController } from './leaves.controller';
import { LeaveDbService } from './leave-db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Leave, LeaveSchema } from './schemas/leave.schema';
import { LeaveApplication, LeaveApplicationSchema } from './schemas/leaves-application.schema';
import { ErrorHandlingModule } from 'src/shared/error-handling/error-handling.module';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { JwtModule } from '@nestjs/jwt';
import { WhatsAppModule } from 'src/users/whatsapp/whatsapp.module';
import { MailModule } from 'src/mail/mail.module';
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Leave.name, schema: LeaveSchema },
      { name: LeaveApplication.name, schema: LeaveApplicationSchema },
    ]),
    ErrorHandlingModule,
    CacheModule,
    JwtModule,
    RequestContextModule,
    WhatsAppModule,
    MailModule,
    
 ],
  providers: [LeavesService, LeaveDbService],
  controllers: [LeavesController],
  exports:[LeavesService]
})
export class LeavesModule {}
