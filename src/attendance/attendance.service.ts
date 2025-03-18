import { Injectable } from '@nestjs/common';
import { Department, Roles } from 'src/common/constants/constants';
import { LeavesService } from 'src/leaves/leaves.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { UsersService } from 'src/users/users.service';
import { Types } from 'mongoose';

@Injectable()
export class AttendanceService {
    constructor(
        private httpService:HttpRequestsService,
        private requestContextService:RequestContextService,
        private cacheService:CacheService,
        private userService:UsersService,
        private leaves:LeavesService
    ){}
async getAttendence(fromDate:Date,toDate:Date,userId?:string,employeeCode?:string,machineNumber?:string,page?:number,limit?:number){

let LoginUserId:any= this.requestContextService.get("userId")
let role= this.requestContextService.get("role")
let department:any= this.requestContextService.get("department")
let query={}

 page =  page || 1;  
 limit = limit || 10; 
    let response:any=await this.httpService.get(`http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${fromDate}&ToDate=${toDate}`)
    // function filterData(employeeCodes, serialNumbers) {
    //  if(serialNumbers.length){
    //   return response.filter(log => 
    //     employeeCodes.map(String).includes(String(log.EmployeeCode)) && 
    //    serialNumbers.map(String).includes(String(log.SerialNumber))
    //   );
    // }
    // else{
    //    let data= response.filter(log => 
    //     employeeCodes.map(String).includes(String(log.EmployeeCode)))
    //     return {data}
    // }
    // }
    async function filterData(employeeCodes, serialNumbers) { 
      let filteredData = {};
  
      for (const empCode of employeeCodes) {
          // Filter logs for the given employeeCode
          let logs = response
              .filter(log => String(log.EmployeeCode) === String(empCode) &&
                  (serialNumbers.length === 0 || serialNumbers.map(String).includes(String(log.SerialNumber))))
              .sort((a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime());
  
          // Group logs by date (YYYY-MM-DD format)
          let groupedLogs = logs.reduce((acc, log) => {
              let dateKey = log.LogDate.split("T")[0]; // Extract only the date part (YYYY-MM-DD)
              let logEntry = { ...log, LogDate: dateKey }; // Replace full LogDate with only the date
              if (!acc[dateKey]) acc[dateKey] = [];
              acc[dateKey].push(logEntry);
              return acc;
          }, {});
  
          // Fetch user details from cache or database
          let userDetails = response.find(log => String(log.EmployeeCode) === String(empCode)) || {};
          const machineNumber = userDetails.MachineNumber || "default"; // Handle missing MachineNumber
          const cacheKey = `userDetails:${empCode}-${machineNumber}`;
  
          let user = await this.cacheService.getCache(cacheKey); // Try Redis cache first
  
          if (!user) {
              user = await this.userService.findOne({ employeeCode: empCode, machineNumber }); // Fetch from DB
              if (user) {
                  await this.cacheService.setCache(cacheKey, user, 3600); // Store in Redis for 1 hour
              }
          }
          console.log("Res",user)
          return
          let leavesFilter={}
          leavesFilter['_id']=Types.ObjectId.createFromHexString(user.userId)
         let leaves=await this.leaves.findAllWithouPagination(leavesFilter)
          // Store logs and user details inside the employeeCode object
          filteredData[empCode] = {
              logs: groupedLogs,
              leaves,
              userDetails: {
                  EmployeeCode: user?.EmployeeCode || userDetails.EmployeeCode,
                  Name: user?.Name || userDetails.Name,
                  Department: user?.Department || userDetails.Department,
                  UserID: user?.UserID || null // Ensure UserID is included
              }
          };
      }
  
      return filteredData;
  }
  
  
  
if(employeeCode && machineNumber){
  console.log("employe code",employeeCode)
 let res= filterData(employeeCode,machineNumber)
 return res
}

    
  switch(role){
        case Roles.ADMIN:
       
        break;
        case Roles.MANAGER:
          if( department?.includes(Department.FINANCE)){
           
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
            console.log("uuu",employeeCodes,serialNumbers) 
            filterData(employeeCodes,serialNumbers)
          }
          break;
        
        case Roles.MARKETING_MANAGER:
        
        case Roles.AGENT:
          if(department?.includes(Department.FINANCE)){
            console.log("AGET finance case 1")
          }
          else{
          
          //   let userData=await this.cacheService.getUserData(LoginUserId)
          //  let res= filterData([userData.employeeCode],[userData.machineNumber])
          //  return res
            }
          break;
        default:
          console.log("default case")

          query['generatedBy']=userId
        break
      }
      const UserGroup: Record<string, any> = {};

      // Step 1: Extract unique EmployeeCode-MachineNumber keys
      const uniqueEmployeeKeys = [
        ...new Set(response.map(log => `${log.EmployeeCode}-${log.MachineNumber}`)),
      ];
      const totalEmployees = uniqueEmployeeKeys.length;
      const totalPages = Math.ceil(totalEmployees / limit);
      const paginatedKeys = uniqueEmployeeKeys.slice((page - 1) * limit, page * limit);
      // Step 2: Fetch user details from Redis instead of DB
      console.log("pp",paginatedKeys)
      const userDetailsMap: Record<string, any> = {};
      
      try {
        await Promise.all(
          paginatedKeys.map(async (key: string) => {
            const [employeeCode, machineNumber] = key.split('-'); // Extract values
            const cacheKey = `userDetails:${employeeCode}-${machineNumber}`; // Cache key format
      
           // let user = await this.cacheService.getCache(cacheKey); // Try Redis first
      
            //if (!user) {
             let user = await this.userService.findOne({ employeeCode }); // Fetch if not in cache
            //  if (user) {
              //  await this.cacheService.setCache(cacheKey, user); // Store in Redis for 1 hour
             // }
           // }
            console.log("u",user)
            
            let leavesFilter={}
            let userObject=user._id
            leavesFilter['userId']= user._id.toString()
           let leaves=await this.leaves.findAllWithouPagination(leavesFilter)
           console.log("ll",leaves)
            if (user) {
              userDetailsMap[key] = {
                leaves,
                weekEnds: user.weekEnds,
                workingHours: user.workingHours,
                shifts: user.shifts,
              };
            }
          })
        );
      } catch (e) {
        console.error("Unexpected error fetching user details:", e);
      }
      const paginatedLogs = response.filter(log =>
        paginatedKeys.includes(`${log.EmployeeCode}-${log.MachineNumber}`)
      );
      // Step 3: Process logs after fetching user details
      for (const log of paginatedLogs) {
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
    
     // return ;
      return {
        page,
        limit,
        totalPages,
        totalEmployees,
        data: UserGroup,
      };
      
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
