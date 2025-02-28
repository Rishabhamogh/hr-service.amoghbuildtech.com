import { Module } from '@nestjs/common';
import { DatabaseErrorService } from './database-error.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ErrorSchema } from './error.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Error.name, schema: ErrorSchema }
    ])
  ],
  providers: [DatabaseErrorService],
  exports: [DatabaseErrorService],
})
export class ErrorHandlingModule {}
