import { Module } from '@nestjs/common';
import { OnDutyService } from './on-duty.service';
import { OnDutyController } from './on-duty.controller';
import { OnDutyDbService } from './on-duty-db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { OnDuty, OnDutySchema } from './schemas/on-duty.schema';
import { ErrorHandlingModule } from 'src/shared/error-handling/error-handling.module';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';

@Module({
 imports: [
 MongooseModule.forFeature([
       { name: OnDuty.name, schema: OnDutySchema },
     ]),
      ErrorHandlingModule,
      RequestContextModule
 ],
  providers: [OnDutyService,OnDutyDbService],
  controllers: [OnDutyController],
  exports:[OnDutyService]
})
export class OnDutyModule {}
