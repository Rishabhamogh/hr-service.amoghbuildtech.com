import { Body, Controller, Post } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';

@Controller()

export class WhatsAppController {
    constructor(public whatApp:WhatsAppService ){}
    @Post('/v1/whats-app')
    async create(@Body() body: any) {
        const response = await this.whatApp.sendWhatsAppMessage(body?.mobile,[body?.name,body?.leadId],"amogh_crm_camp");
        return response;
    }
}
