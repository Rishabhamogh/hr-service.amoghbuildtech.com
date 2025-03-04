import { Injectable } from '@nestjs/common';
import { Department, Roles } from 'src/common/constants/constants';
import { CacheService } from 'src/shared/cache/cache.service';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AttendanceService {
    constructor(
        private httpService:HttpRequestsService,
        private requestContextService:RequestContextService,
        private chacheService:CacheService,
        private userService:UsersService
    ){}
async getAttendence(fromDate:Date,toDate:Date,userId?:string,employeeCode?:string){

let LoginUserId= this.requestContextService.get("userId")
let role= this.requestContextService.get("role")
let department:any= this.requestContextService.get("department")
let query={}


    let response:any=await this.httpService.get(`http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${fromDate}&ToDate=${toDate}`)
    
  switch(role){
        case Roles.ADMIN:
       
        break;
        case Roles.MANAGER:
          if( department.includes(Department.FINANCE)){
           
          }
          else{
          query['generatedBy']=userId
          }
          break;
        
        case Roles.MARKETING_MANAGER:
          query['generatedBy']=userId
          break;
        
        case Roles.AGENT:
          if(department.includes(Department.FINANCE)){
            console.log("AGET finance case 1")
          }
          else{
          query['generatedBy']=userId
          }
          break;
        default:
          console.log("default case")

          query['generatedBy']=userId
        break
      }
      const UserGroup: Record<string, any> = {};

      // Step 1: Extract unique EmployeeCodes
      const uniqueEmployeeCodes = [...new Set(response.map(log => log.EmployeeCode))];
      
      // Step 2: Fetch user details for all employees before processing logs
      const userDetailsMap: Record<string, any> = {};
      
      try {
        await Promise.all(
          uniqueEmployeeCodes.map(async (code:any) => {
            try {
              const user = await this.userService.findOne({ employeeCode: code });
              if (user) {
                userDetailsMap[code] = {
                  weekEnds: user.weekEnds,
                  workingHours: user.workingHours,
                  shifts: user.shifts,
                };
              }
            } catch (e) {
              console.error(`Error fetching user details for ${code}:`, e);
            }
          })
        );
      } catch (e) {
        console.error("Unexpected error fetching user details:", e);
      }
      
      // Step 3: Process logs after fetching user details
      for (const log of response) {
        const { EmployeeCode, LogDate } = log;
        const logDate = new Date(LogDate).toISOString().split("T")[0]; // YYYY-MM-DD format
      
        // Initialize EmployeeCode group if not exists
        if (!UserGroup[EmployeeCode]) {
          UserGroup[EmployeeCode] = {
            userDetails: userDetailsMap[EmployeeCode] || null, // Attach user details
            logs: {}, // Store logs grouped by date
          };
        }
      
        // Initialize Date group if not exists
        if (!UserGroup[EmployeeCode].logs[logDate]) {
          UserGroup[EmployeeCode].logs[logDate] = [];
        }
      
        // Push log into the respective date group under the employee
        UserGroup[EmployeeCode].logs[logDate].push(log);
      
        // Sort logs within the date group by time
        UserGroup[EmployeeCode].logs[logDate].sort(
          (a: any, b: any) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime()
        );
      }
      
      return UserGroup;
      
      
    // Return full grouped data
      

    // const UserGroup = response.reduce(async (acc, log) => {
    //     const { EmployeeCode, LogDate } = log;
  
        
    //     // If EmployeeCode does not exist in acc, initialize it as an array
    //     if (!acc[EmployeeCode]) {
    //       acc[EmployeeCode] = [];
    //     }
    //     try{
    //     let user:any=await   this.userService.findOne({employeeCode:EmployeeCode})
    //     if(user) {
    //       acc['userDetails']={
    //         "weekEnds":user.weekEnds,
    //         "workingHours":user.workingHours,
    //         "shifts":user.shifts
    //       }
    //     }
    //     }
    //     catch(e){

    //     }
    //     // Push the log entry to the respective EmployeeCode group
    //     acc[EmployeeCode].push(log);
       
    //     // Sort the logs for the EmployeeCode by LogDate
    //     acc[EmployeeCode].sort(
    //       (a:any, b:any) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime(),
    //     );
  
    //     return acc;
    //   }, {});
    //   if(employeeCode){
       
    //    return UserGroup[employeeCode]
    //      }
    //   return UserGroup;

    const UserLogs = response.reduce((acc, log) => {
      const { EmployeeCode, LogDate } = log;
    
      // Convert LogDate to YYYY-MM-DD format for consistent grouping
      const logDate = new Date(LogDate).toISOString().split("T")[0];
    
      // Initialize EmployeeCode group if not exists
      if (!acc[EmployeeCode]) {
        acc[EmployeeCode] = {};
      }
    
      // Initialize Date group if not exists
      if (!acc[EmployeeCode][logDate]) {
        acc[EmployeeCode][logDate] = [];
      }
    
      // Push the log into the respective date group under the employee
      acc[EmployeeCode][logDate].push(log);
    
      // Sort logs within the date group by time
      acc[EmployeeCode][logDate].sort(
        (a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime()
      );
    
      return acc;
    }, {});
    return UserLogs
    const groupedLogs = response.reduce((acc, log) => {
      const { EmployeeCode, LogDate } = log;
    
      // Convert LogDate to YYYY-MM-DD format for consistent grouping
      const logDate = new Date(LogDate).toISOString().split("T")[0];
    
      // Initialize Date group if not exists
      if (!acc[logDate]) {
        acc[logDate] = {};
      }
    
      // Initialize EmployeeCode group within the Date group if not exists
      if (!acc[logDate][EmployeeCode]) {
        acc[logDate][EmployeeCode] = [];
      }
    
      // Push the log into the respective EmployeeCode group under the date
      acc[logDate][EmployeeCode].push(log);
    
      // Sort logs within the EmployeeCode group by time
      acc[logDate][EmployeeCode].sort(
        (a:any, b:any) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime()
      );
    
      return acc;
    }, {});
    return groupedLogs
    
}

}
