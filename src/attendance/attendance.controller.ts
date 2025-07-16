import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { query } from 'express';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from 'src/auth/auth.guard';

@UseGuards(AuthGuard)
@Controller('attendance')

export class AttendanceController {
    constructor(
        private attendenceService:AttendanceService
    ){}

    @Post()
    async getAttendence(@Body() params:any){
        console.log("pp",params)
        let response=await this.attendenceService.getAttendence(params.fromDate,params.toDate,params?.userId, params?.employeeCode,params?.machineNumber,params?.page,params?.limit)
        return response
    }
}
