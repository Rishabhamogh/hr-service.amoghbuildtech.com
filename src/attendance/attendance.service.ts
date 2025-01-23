import { Injectable } from '@nestjs/common';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';

@Injectable()
export class AttendanceService {
    constructor(
        private httpService:HttpRequestsService
    ){}
async getAttendence(fromDate:Date,toDate:Date,userId?:string){
    let response:any=await this.httpService.get(`http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${fromDate}&ToDate=${toDate}`)
    // const groupedLogs = response.reduce((acc, log) => {
    //     const { EmployeeCode, LogDate } = log;
  
    //     // If EmployeeCode does not exist in acc, initialize it as an array
    //     if (!acc[EmployeeCode]) {
    //       acc[EmployeeCode] = [];
    //     }
  
    //     // Push the log entry to the respective EmployeeCode group
    //     acc[EmployeeCode].push(log);
  
    //     // Sort the logs for the EmployeeCode by LogDate
    //     acc[EmployeeCode].sort(
    //       (a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime(),
    //     );
  
    //     return acc;
    //   }, {});
  
    //   return groupedLogs;

    // const groupedLogs = response.reduce((acc, log) => {
    //   const { EmployeeCode, LogDate } = log;
    
    //   // Convert LogDate to YYYY-MM-DD format for consistent grouping
    //   const logDate = new Date(LogDate).toISOString().split("T")[0];
    
    //   // Initialize EmployeeCode group if not exists
    //   if (!acc[EmployeeCode]) {
    //     acc[EmployeeCode] = {};
    //   }
    
    //   // Initialize Date group if not exists
    //   if (!acc[EmployeeCode][logDate]) {
    //     acc[EmployeeCode][logDate] = [];
    //   }
    
    //   // Push the log into the respective date group under the employee
    //   acc[EmployeeCode][logDate].push(log);
    
    //   // Sort logs within the date group by time
    //   acc[EmployeeCode][logDate].sort(
    //     (a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime()
    //   );
    
    //   return acc;
    // }, {});
    // return groupedLogs
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
