import { Injectable, Logger } from '@nestjs/common';
import { Department, LeaveStatus, Roles } from 'src/common/constants/constants';
import { LeavesService } from 'src/leaves/leaves.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';
import { RequestContextService } from 'src/shared/request-context/request-context.service';
import { UsersService } from 'src/users/users.service';
import { Types } from 'mongoose';
import { OnDutyService } from 'src/on-duty/on-duty.service';
import { console } from 'inspector';
import e from 'express';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schemas/attendance.schema';
 import { PipelineStage } from 'mongoose';
import { HRStausService } from 'src/hr-status/hr-status.service';

@Injectable()
export class AttendanceService {
      private readonly logger = new Logger(AttendanceService.name);

    constructor(
        private httpService:HttpRequestsService,
        private requestContextService:RequestContextService,
        private cacheService:CacheService,
        private userService:UsersService,
        private leaves:LeavesService,
        private ODService:OnDutyService,
        private hrstatus:HRStausService,

        @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>
    ){}
async getAttendence(fromDate:Date,toDate:Date,userId?:string,employeeCode?:string,machineNumber?:string,page?:number,limit?:number){

let LoginUserId:any=this.requestContextService.get("userId")
let role= this.requestContextService.get("role")

let department:any= this.requestContextService.get("department")
let query={}

 page =  page || 1;  
 limit = limit || 10; 
 console.log("prev api",role)
    let response:any=await this.httpService.get(`http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${fromDate}&ToDate=${toDate}`)
    // console.log("rrrr",response)
   
  
  console.log("role",role,LoginUserId,employeeCode)
if(employeeCode && machineNumber){
 let res=this.filterData(employeeCode,machineNumber,response,fromDate,toDate)
 return res
}

    
  switch(role){
        case Roles.ADMIN:
       console.log("ADMIN")
        break;
        case Roles.MANAGER:
        case Roles.TEAM_LEAD:
          console.log("MANAGER")
          if( department?.includes(Department.HR)){
                        if(employeeCode && machineNumber){

           let res= this.filterData([employeeCode],[machineNumber],response,  fromDate,toDate)
           return res
                        }
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
            console.log("uuu",employeeCodes,serialNumbers) 
          let res= await this.filterData(employeeCodes,serialNumbers,response ,fromDate,toDate)
          return res
          }
          break;
        
        case Roles.MARKETING_MANAGER:
        
        case Roles.AGENT:
          if(department?.includes(Department.HR)){
            console.log("AGET finance case 1")
            if(employeeCode && machineNumber){
          let res= this.filterData([employeeCode],[machineNumber],response,  fromDate,toDate)
           return res
            }

          }
          else{
          
            let userData=await this.cacheService.getUserData(LoginUserId)
            
           let res= this.filterData([userData.employeeCode],[userData.machineNumber],response,  fromDate,toDate)
           return res
            }
          break;
        default:
          console.log("default case")

          query['generatedBy']=userId
        break
      }
const UserGroup: Record<string, any> = {};

try {
  // Step 1: Extract unique EmployeeCode-MachineNumber keys
  const uniqueEmployeeKeys = [
    ...new Set(response.map(log => log.EmployeeCode)),
  ];
  
  const totalEmployees = uniqueEmployeeKeys.length;
  const totalPages = Math.ceil(totalEmployees / limit);
  const paginatedKeys = uniqueEmployeeKeys.slice((page - 1) * limit, page * limit);
  
  // Step 2: Fetch user details from Redis/DB
  const userDetailsMap: Record<string, any> = {};
  console.log("Processing keys count:", paginatedKeys);
  
  try {
    await Promise.all(
      paginatedKeys.map(async (key: string) => {
        try {
          console.log("Running Promise for key:", key);
          // const [employeeCode, machineNumber] = key.split('-');
          
          // Try to get user from cache first
          console.log("Fetching user from cache for key:", key);
        let user = await this.cacheService.getEmployeeUserId(key)
          console.log("Cached user:", user);
          
          // If not in cache, fetch from database
          if (!user && employeeCode) {
            user = await this.userService.findOne({ employeeCode });
            console.log("DB user:", user);
          }
          
          // Skip if user not found
          if (!user) {
            console.warn(`User not found for key: ${key}`);
            return;
          }
          console.log("User found:",key, user);
          // Fetch user's approved leaves
          const leavesFilter = {};
          leavesFilter['userId']=Types.ObjectId.createFromHexString(user?._id)
          // leavesFilter['status']=LeaveStatus.APPROVED
          leavesFilter['fromDate'] = { $gte: new Date(fromDate) };
          leavesFilter['toDate'] = { $lte: new Date(toDate) }; 
          
          const leaves = await this.leaves.findAllWithouPagination(leavesFilter);

          const OnDuty = await this.ODService.findAllWithouPagination(leavesFilter);

          let hrStatusQuery = {}; 
          hrStatusQuery['userId'] = Types.ObjectId.createFromHexString(user?._id)
          hrStatusQuery['date'] = { $gte: new Date(fromDate), $lte: new Date(toDate) };
          const hrStatus=    await this.hrstatus.findAllWithouPagination({});

          console.log("onduty",OnDuty)
          // Prepare user details
          console.log("user",user )
          const userDetail = {
            shifts: user.workingHours,
            EmployeeCode: user?.EmployeeCode || user.employeeCode,
            Name: user?.Name || user.name,
            Department: user?.Department || user.department,
            userId: user?.userId || user._id,
            weekEnds: user?.weekEnds,
            hrStatus
          };
          
          // Store in map
          userDetailsMap[key] = { 
            leaves, 
            OnDuty,
            userDetail   
          };
          
        } catch (err) {
          console.error(`Error processing key ${key}:`, err);
          // Continue processing other keys even if one fails
        }
      })
    );
  } catch (e) {
    console.error("Error in Promise.all execution:", e);
    throw e; // Re-throw to be caught by outer try-catch
  }
  
  // Step 3: Filter logs for pagination
  const paginatedLogs = response.filter(log =>
    paginatedKeys.includes(log.EmployeeCode)
  );
  
  // console.log("Paginated logs count:", paginatedLogs.length);
  // console.log("User details map:", Object.keys(userDetailsMap));
  
  // Step 4: Process logs and group them
  for (const log of paginatedLogs) {
    const { EmployeeCode, LogDate, SerialNumber } = log;
    const logDate = new Date(LogDate).toISOString().split("T")[0]; // YYYY-MM-DD format
    const userKey = EmployeeCode;
    
    // console.log(`Processing log for ${userKey} on ${logDate}`);
    
    // Initialize EmployeeCode group if not exists
    if (!UserGroup[EmployeeCode]) { 
    console.log("Initializing group for EmployeeCode:", userDetailsMap);
      UserGroup[EmployeeCode] = { 
        leaves: userDetailsMap[userKey]?.leaves || [],
        OnDuty: userDetailsMap[userKey]?.OnDuty || [],
        userDetails: userDetailsMap[userKey]?.userDetail || null,
        logs: {} // Store logs grouped by date
      };
    }  
    
    // Initialize Date group if not exists
    if (!UserGroup[EmployeeCode].logs[logDate]) {
      UserGroup[EmployeeCode].logs[logDate] = [];
    }
    
    // Add log to the appropriate date group
    UserGroup[EmployeeCode].logs[logDate].push(log);
    // UserGroup[EmployeeCode]["leaves"]=
    // Sort logs by time for each date
    UserGroup[EmployeeCode].logs[logDate].sort(
      (a: any, b: any) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime()
    );                                     
  }
  
  // Convert UserGroup object to array format if needed
  const userGroupArray = Object.keys(UserGroup).map(employeeCode => ({
    employeeCode,
    ...UserGroup[employeeCode]
  }));
  
  return {data:userGroupArray, totalEmployees, totalPages, page};
  
} catch (e) {
  console.error("Unexpected error fetching user details:", e);
}

return {
  page,
  limit,
  // totalPages,
  // totalEmployees,
  data: UserGroup,
};

      
}


async  filterData(employeeCodes, serialNumbers,response ,fromDate:Date,toDate:Date){ 
  let filteredData = {};
console.log("emd",employeeCodes,serialNumbers)
let resultArr=[]
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
          let logEntry = { ...log }; // Replace full LogDate with only the date
          if (!acc[dateKey]) acc[dateKey] = [];
          acc[dateKey].push(logEntry);
          return acc;
      }, {});

      // Fetch user details from cache or database
      let userDetails = response.find(log => String(log.EmployeeCode) === String(empCode)) || {};
      const machineNumber = userDetails.MachineNumber || "default"; // Handle missing MachineNumber
      // const cacheKey = `userDetails:${empCode}-${machineNumber}`;
      // const cacheKey = `userDetails:${empCode}-${machineNumber}`;
            const cacheKey = empCode;


      console.log("Cache Key:", userDetails);
        let user = await this.cacheService.getEmployeeUserId(cacheKey)

      if (!user) {
         let user = await this.userService.findOne({ employeeCode: empCode }); // Fetch from DB
         console.log("DB User:", user);
          if (user) {
              await this.cacheService.setCache(cacheKey, user); // Store in Redis for 1 hour
          }
      }
      console.log("Res",user)
             // UserGroup[EmployeeCode].logs[logDate].push(log);
            //  return user
      if(user){
      let leavesFilter={}
      leavesFilter['userId']= user?._id ?Types.ObjectId.createFromHexString(user?._id):null
      // leavesFilter['status']=LeaveStatus.APPROVED
      leavesFilter['fromDate'] = { $gte: new Date(fromDate) };
      leavesFilter['toDate'] = { $lte: new Date(toDate) };

     let leaves=await this.leaves.findAllWithouPagination(leavesFilter)

    let OnDuty=await this.ODService.findAllWithouPagination(leavesFilter)
 let hrStatusQuery = {}; 
          hrStatusQuery['userId'] = Types.ObjectId.createFromHexString(user?._id)
          hrStatusQuery['date'] = { $gte: new Date(fromDate), $lte: new Date(toDate) };
          const hrStatus=    await this.hrstatus.findAllWithouPagination({});
      // Store  logs and user details inside the employeeCode object
      console.log("empdo",empCode)
      filteredData[empCode] = {
          logs: groupedLogs,
          leaves,
          OnDuty,
          hrStatus,
          employeeCode: empCode,
          userDetails: {
              EmployeeCode: user?.EmployeeCode || userDetails.EmployeeCode,
              Name: user?.Name || userDetails.Name,
              Department: user?.Department || userDetails.Department,
              userId: user?._id || null, 
               weekEnds: user?.weekEnds

          }
      };
    }
resultArr.push(filteredData[empCode])
  }   

  return {data:resultArr};
}

async getAttendanceList({ page = 1, limit = 10, employeeCode, fromDate, toDate }) {

    const query: any = {};
    
    if (employeeCode) query.EmployeeCode = employeeCode;
    if (fromDate || toDate) {
        query.logDate = {};
        if (fromDate) query.logDate.$gte = new Date(fromDate);
        if (toDate) query.logDate.$lte = new Date(toDate);
    }
    console.log("query",query)
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
        this.attendanceModel.find().skip(skip).limit(limit).sort({ LogDate: -1 }),
        this.attendanceModel.countDocuments(query)
    ]);
    return {
        data,
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
    };
}

async getEmployeeAttendanceDetails(
  query: any,
  fromDate?: string,
  toDate?: string,
  page: number = 1,
  limit: number = 10
) {
  const matchQuery: any = {};

  if (query.userId) matchQuery.userId = { $in: query.userId };

  // Optional filtering by date
  if (fromDate || toDate) {
    matchQuery.logDate = {
      ...(fromDate ? { $gte: new Date(fromDate) } : {}),
      ...(toDate ? { $lte: new Date(toDate) } : {})
    };
  }

  this.logger.log('Match Query:', JSON.stringify(matchQuery, null, 2));

  const countPipeline = [
    { $match: matchQuery },
    { $count: "total" }
  ];
  const countResult = await this.attendanceModel.aggregate(countPipeline);
  const totalCount = countResult[0]?.total || 0;
  const totalPages = Math.ceil(totalCount / limit);


const pipeline: PipelineStage[] = [
  // { $match: matchQuery },
  {
    $addFields: {
      logDate: {
        $cond: {
          if: { $eq: [{ $type: "$logDate" }, "date"] },
          then: "$logDate",
          else: null
        }
      }
    }
  },
  { $match: { logDate: { $ne: null } } },
  {
    $group: {
      _id: { $dateToString: { format: "%Y-%m-%d", date: "$logDate" } },
      logs: { $push: "$$ROOT" }
    }
  },
  { $sort: { _id: 1 } },
  { $skip: (page - 1) * limit },
  { $limit: limit },
  {
    $lookup: {
      from: "leaveApplication",
      let: { logUserId: { $arrayElemAt: ["$logs.userId", 0] }, date: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$userId", "$$logUserId"] },
                {
                  $eq: [
                    { $dateToString: { format: "%Y-%m-%d", date: "$fromDate" } },
                    "$$date"
                  ]
                }
              ]
            }
          }
        }
      ],
      as: "leaves"
    }
  },
  {
    $lookup: {
      from: "onDuty",
      let: { logUserId: { $arrayElemAt: ["$logs.userId", 0] }, date: "$_id" },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ["$userId", "$$logUserId"] },
                {
                  $eq: [
                    { $dateToString: { format: "%Y-%m-%d", date: "$fromDate" } },
                    "$$date"
                  ]
                }
              ]
            }
          }
        }
      ],
      as: "OnDuty"
    }
  },
  {
    $lookup: {
      from: "users",
      localField: "logs.userId",
      foreignField: "_id",
      as: "userDetails"
    }
  }
];

  const result = await this.attendanceModel.aggregate(pipeline);

  return {
    leaves: result[0]?.leaves || [],
    OnDuty: result[0]?.OnDuty || [],
    userDetails: result[0]?.userDetails?.[0] || null,
    logs: result.reduce((acc, curr) => {
      acc[curr._id] = curr.logs;
      return acc;
    }, {}),
    totalCount,
    totalPages,
    currentPage: page
  };
}



}
