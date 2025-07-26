import { Module } from '@nestjs/common';
import { HRStausService } from './hr-status.service';
import { HRStatusController,  } from './hr-status.controller';
import { HRStatusDbService } from './hr-status.db.service';
import { MongooseModule } from '@nestjs/mongoose';
import { HRStatus, HRStatusSchema} from './schemas/hr-status.schema';
import { ErrorHandlingModule } from 'src/shared/error-handling/error-handling.module';
import { RequestContextModule } from 'src/shared/request-context/request-context.module';
import { CacheModule } from 'src/shared/cache/cache.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
 imports: [
 MongooseModule.forFeature([
       { name: HRStatus.name, schema: HRStatusSchema },
     ]),
      ErrorHandlingModule,
      RequestContextModule,
      CacheModule,
      JwtModule
 ],
  providers: [HRStausService,HRStatusDbService],
  controllers: [HRStatusController],
  exports:[HRStausService]
})
export class HRModule {}
