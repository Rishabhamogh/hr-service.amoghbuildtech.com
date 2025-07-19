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
    @Get()
    async attendence(@Body() params:any){
        console.log("pp",params)
        let response=await this.attendenceService.getAttendence(params.fromDate,params.toDate,params?.userId, params?.employeeCode,params?.machineNumber,params?.page,params?.limit)
        return response
    }

    @Get('list')
    async getAttendanceList(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10,
        @Query('employeeCode') employeeCode?: string,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string
    ) {
        return await this.attendenceService.getAttendanceList({ page, limit, employeeCode, fromDate, toDate });
    }
}
