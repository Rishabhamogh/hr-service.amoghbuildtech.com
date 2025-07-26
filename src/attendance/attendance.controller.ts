import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { query } from 'express';
import { AttendanceService } from './attendance.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { Department, Roles } from 'src/common/constants/constants';
import { CacheService } from 'src/shared/cache/cache.service';

@UseGuards(AuthGuard)
@Controller('attendance')

export class AttendanceController {
    constructor(
        private attendenceService:AttendanceService,
        private requestContextService:RequestContextService,
        private cacheService:CacheService,
        
    ){}

    @Post()
    async getAttendence(@Body() params:any){
        console.log("pp",params)
        let response=await this.attendenceService.getAttendence(params.fromDate,params.toDate,params?.userId, params?.employeeCode,params?.machineNumber,params?.page,params?.limit)
        return response
    }
    @Get()
    async attendence(@Body() params:any){
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
let LoginUserId:any=this.requestContextService.get("userId")
let role= this.requestContextService.get("role")

let department:any= this.requestContextService.get("department")
let query:any={}
        switch(role){
                case Roles.ADMIN:
               console.log("ADMIN")
                break;
                case Roles.MANAGER:
                case Roles.TEAM_LEAD:
                  console.log("MANAGER")
                  if( department?.includes(Department.HR)){
                   console.log("HR finance Manger 1")
                  }
                  else{
                    console.log("login",LoginUserId)
                    let team=await this.cacheService.getTeamByManager(LoginUserId)
                    console.log("tes",team)
                    let employeeCodes=[] 
                    let serialNumbers=[]
                   await Promise.all(team.map(async(user:any)=>{
                      let userData=await this.cacheService.getUserData(user)
                      console.log("user",userData)
                      employeeCodes.push(userData.employeeCode)
                      serialNumbers.push(userData.machineNumber)
                    }))
                   let manager=await this.cacheService.getUserData(LoginUserId)
                    employeeCodes.push(manager.employeeCode)
                    serialNumbers.push(manager.machineNumber)
                
                    query['userId']= {$in:employeeCodes}
                  }
                  break;
                
                case Roles.MARKETING_MANAGER:
                
                case Roles.AGENT:
                  if(department?.includes(Department.HR)){
                    console.log("AGET finance case 1")
                  }
                  else{
                  
                    let userData=await this.cacheService.getUserData(LoginUserId)
                    
                 
                    }
                  break;
                default:
                  console.log("default case")
        
                  query['generatedBy']=LoginUserId
                break
              }
       return await this.attendenceService.getAttendanceList({ page, limit, employeeCode, fromDate, toDate });
               return await this.attendenceService.getEmployeeAttendanceDetails(query,fromDate, toDate );

    }
}
