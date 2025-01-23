import { Controller, Get, Query } from '@nestjs/common';
import { query } from 'express';
import { AttendanceService } from './attendance.service';

@Controller('attendance')
export class AttendanceController {
    constructor(
        private attendenceService:AttendanceService
    ){}

    @Get()
    async getAttendence(@Query() params:any){
        let response=await this.attendenceService.getAttendence(params.fromDate,params.toDate,params.userId)
        return response
    }
}
