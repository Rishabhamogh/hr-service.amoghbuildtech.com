import { Controller } from '@nestjs/common';
import { MailService } from './mail.service';
import {
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    Logger,
    Query,
    UseGuards,
    HttpCode,
    HttpStatus,
    Req
} from '@nestjs/common';
import { MailDto } from './dto/mail.dto'
@Controller()
export class MailController {
    constructor(public mail: MailService) { }
    @Post('/v1/email')
    async create(@Req() request: any) {
        const response = await this.mail.sendByForm(request?.body);
        return response;
    }

}
