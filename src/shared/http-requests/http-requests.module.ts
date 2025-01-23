import { Module } from '@nestjs/common';
import { HttpRequestsService } from './http-requests.service';
import { HttpModule } from '@nestjs/axios';
import { RequestContextModule } from '../request-context/request-context.module';

@Module({
  imports: [HttpModule, RequestContextModule],
  providers: [HttpRequestsService],
  exports: [HttpRequestsService],
})
export class HttpRequestsModule {}
