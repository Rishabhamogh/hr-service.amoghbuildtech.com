import { Module } from '@nestjs/common';
import { WhatsAppController } from './whatsapp.controller';
import { WhatsAppService } from './whatsapp.service';
import { HttpRequestsModule } from 'src/shared/http-requests/http-requests.module';
import { UsersService } from 'src/users/users.service';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports :[HttpRequestsModule,UsersModule],
  controllers: [WhatsAppController],
  providers: [WhatsAppService],
  exports:[WhatsAppService]
})
export class WhatsAppModule {}
