import { Injectable } from '@nestjs/common';
import { Department, LeaveStatus, Roles } from 'src/common/constants/constants';
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
    
   
  
  
if(employeeCode && machineNumber){
  console.log("employe code",employeeCode)
 let res=this.filterData(employeeCode,machineNumber,response)
 return res
}

    
  switch(role){
        case Roles.ADMIN:
       console.log("ADMIN")
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
            this.filterData(employeeCodes,serialNumbers,response)
          }
          break;
        
        case Roles.MARKETING_MANAGER:
        
        case Roles.AGENT:
          if(department?.includes(Department.FINANCE)){
            console.log("AGET finance case 1")
          }
          else{
          
            let userData=await this.cacheService.getUserData(LoginUserId)
           // console.log("uuesr dta",userData)
            
           let res= this.filterData([userData.employeeCode],[userData.machineNumber],response)
           return res
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
      ...new Set(response.map(log => `${log.EmployeeCode}-${log.SerialNumber}`)),
        //...new Set(response.map(log => `${log.EmployeeCode}`)),

      ];
      const totalEmployees = uniqueEmployeeKeys.length;
      const totalPages = Math.ceil(totalEmployees / limit);
      const paginatedKeys = uniqueEmployeeKeys.slice((page - 1) * limit, page * limit);
      // Step 2: Fetch user details from Redis instead of DB
      //console.log("pp",paginatedKeys)
      const userDetailsMap: Record<string, any> = {};
      console.log("pppp",paginatedKeys.length)
      
      try {
        await Promise.all(
          paginatedKeys.map(async (key: string) => {
            try {
              console.log("Running Promise for key:", key);
              const [employeeCode, machineNumber] = key.split('-');
              let user=await this.cacheService.getEmployeeUserId(employeeCode+'-'+machineNumber)
              console.log("uu",user)
              
              // let user={}
              if(!user){
                 user = await this.userService.findOne({ employeeCode, machineNumber });

              }
              
              console.log("User:", user);
              let leavesFilter={}
                 leavesFilter['userId']=user._id
               leavesFilter['status']=LeaveStatus.APPROVED
              const leaves = await this.leaves.findAllWithouPagination(leavesFilter);
              let userDetail={shifts: user.workingHours ,
              EmployeeCode: user?.EmployeeCode || user.EmployeeCode,
              Name: user?.Name || user.Name,
              Department: user?.Department || user.Department,
              userId: user?.userId || null,
              weekEnds:user?.weekEnds
              }
              userDetailsMap[key] = { leaves, userDetail
              }
            } catch (err) {
              console.error(`Error inside map for key ${key}:`, err);
            }
          })
        );
      // } catch (e) {
      //   console.error("Unexpected error fetching user details:", e);
      // }
      const paginatedLogs =
      response.filter(log =>
        paginatedKeys.includes(`${log.EmployeeCode}-${log.SerialNumber}`)
      );
      console.log("paginatedKeys",paginatedLogs.length)
      
      // Step 3: Process logs after fetching user details
      console.log("PP",paginatedLogs)
      for (const log of paginatedLogs) {
       // console.log("user",userDetailsMap)
       // console.log("paginated run")
        
        const { EmployeeCode, LogDate ,SerialNumber } = log;
        const logDate = new Date(LogDate).toISOString().split("T")[0]; // YYYY-MM-DD format
      console.log("user detail ",userDetailsMap)
   //   return userDetailsMap
        // Initialize EmployeeCode group if not exists
        if (!UserGroup[EmployeeCode]) { 
          UserGroup[EmployeeCode] = {
            leaves:userDetailsMap[EmployeeCode+'-'+SerialNumber]?.leaves || null,
            
            userDetails: userDetailsMap[EmployeeCode+'-'+SerialNumber]?.userDetail || null, // Attach user details
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
    } catch (e) {
         console.error("Unexpected error fetching user details:", e);
      }
    
      return {
        page,
        limit,
        totalPages,
        totalEmployees,
        data: UserGroup,
      };
      
}


async  filterData(employeeCodes, serialNumbers,response) { 
  let filteredData = {};
console.log("emd",employeeCodes,serialNumbers)

  for (const empCode of employeeCodes) {
    console.log("Eee",empCode)
      // Filter logs for the given employeeCode
      let logs = response
          .filter(log => String(log.EmployeeCode) === String(empCode) )
          // &&
          //     (serialNumbers.length === 0 || serialNumbers.map(String).includes(String(log.SerialNumber))))
          .sort((a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime());

      // Group logs by date (YYYY-MM-DD format)
      let groupedLogs = logs.reduce((acc, log) => {
          let dateKey = new Date(log.LogDate).toISOString().split("T")[0]; // Extract only the date part (YYYY-MM-DD)
          //new Date(LogDate).toISOString().split("T")[0]
          let logEntry = { ...log }; // Replace full LogDate with only the date
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(logEntry);
          return acc;
      }, {});

      // Fetch user details from cache or database
      let userDetails = response.find(log => String(log.EmployeeCode) === String(empCode)) || {};
      const machineNumber = userDetails.MachineNumber || "default"; // Handle missing MachineNumber
      const cacheKey = `userDetails:${empCode}-${machineNumber}`;

      //let user = await this.cacheService.getCache(cacheKey); // Try Redis cache first

     // if (!user) {
         let user = await this.userService.findOne({ employeeCode: empCode }); // Fetch from DB
      //     if (user) {
      //         await this.cacheService.setCache(cacheKey, user, 3600); // Store in Redis for 1 hour
      //     }
      // }
      console.log("Res",user)
             // UserGroup[EmployeeCode].logs[logDate].push(log);

      let leavesFilter={}
      leavesFilter['userId']=user._id.toString()
      leavesFilter['status']=LeaveStatus.APPROVED
      
     let leaves=await this.leaves.findAllWithouPagination(leavesFilter)
      // Store logs and user details inside the employeeCode object
      console.log("empdo",empCode)
      filteredData[empCode] = {
          logs: groupedLogs,
          leaves,
          userDetails: {
              EmployeeCode: user?.EmployeeCode || userDetails.EmployeeCode,
              Name: user?.Name || userDetails.Name,
              Department: user?.Department || userDetails.Department,
              UserId: user?.UserId || null // Ensure UserID is included
          }
      };
  }

  return {data:filteredData};
}

}
