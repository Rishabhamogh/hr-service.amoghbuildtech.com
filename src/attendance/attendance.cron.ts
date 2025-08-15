import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schemas/attendance.schema';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';
import { CacheService } from 'src/shared/cache/cache.service';
import { console } from 'inspector';
import { UsersService } from 'src/users/users.service';
import * as moment from 'moment';
import { AttendanceSummary } from './schemas/attendance-summary.schema';
@Injectable()
export class AttendanceCron {
        private readonly logger = new Logger(AttendanceCron.name);
  
  
  constructor(
    private readonly httpService: HttpRequestsService,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,
     @InjectModel(AttendanceSummary.name) private summaryModel: Model<AttendanceSummary>,

    //  @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>,


    private cacheService: CacheService,
    private userService: UsersService
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_11PM)
  async handleAttendanceCron() {
    console.log('Attendance Cron Job started');
    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const dd = String(now.getDate()).padStart(2, '0');
    const todayStr = `${yyyy}-${mm}-${dd}`;
    const fromDate = todayStr;
    const toDate = todayStr;
    const apiUrl = `http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${fromDate}&ToDate=${toDate}`;
    const response = await this.httpService.get(apiUrl);
    try{
    if (Array.isArray(response)) {
      for (const record of response) {
        console.log('Processing record:', record);
        const logDate = new Date(record.LogDate);
        const oneMinuteBefore = new Date(logDate.getTime() - 60 * 1000);
        const oneMinuteAfter = new Date(logDate.getTime() + 60 * 1000);
        const exists = await this.attendanceModel.findOne({
          EmployeeCode: record.EmployeeCode,
          LogDate: { $gte: oneMinuteBefore, $lte: oneMinuteAfter }
        });
        if (!exists) {
          let userId = null;
          try {
            console.log('Finding user by employee code:', record?.EmployeeCode);
            
            const user = await this.userService.findOne({ employeeCode: record?.EmployeeCode.toString() });
            userId = user?._id || null;
          } catch (err) {
            userId = null; // If error, just set to null and continue
          }
          await this.attendanceModel.create({
            employeeCode: record.EmployeeCode,
            logDate: logDate,
            serialNumber: record.SerialNumber,
            punchDirection: record.PunchDirection,
            temperature: record.Temperature,
            temperatureState: record.TemperatureState,
            userId: userId
          });
        } else {
          console.log('Duplicate within 1 minute, skipping:', record);
        }
      }
    }
  } catch (error) {
      console.error('Error processing attendance records:', error);
    }
  }
  @Cron(CronExpression.EVERY_30_SECONDS) // Every 30 minutes
async handleAttendanceAndSummaryDirect() {
  console.log('⏰ Starting Direct Attendance Summary Process');

  const todayStart = moment().startOf('day').toDate();
  const todayEnd = moment().endOf('day').toDate();
  const dateString = moment(todayStart).format('YYYY-MM-DD');

  // Prepare date strings for API
  const yyyy = todayStart.getFullYear();
  const mm = String(todayStart.getMonth() + 1).padStart(2, '0');
  const dd = String(todayStart.getDate()).padStart(2, '0');
  const todayStr = `${yyyy}-${mm}-${dd}`;

  // 1. Fetch logs from API
  const apiUrl = `http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${todayStr}&ToDate=${todayStr}`;
  let apiData: any[] = [];

  try {
    const ap = await this.httpService.get(apiUrl);
    apiData = Array.isArray(ap) ? ap : [];
    // apiData = Array.isArray(data) ? data : [];
  } catch (error) {
    console.error('❌ Error fetching attendance API:', error);
    return;
  }

  // 2. Get all users
  const users = await this.userService.getAllWithoutPagination({});

  for (const user of users) {
    // Filter logs for this user from API directly
    let logs = apiData
  .filter(record => {
    const apiCode = record.EmployeeCode?.toString().trim();
    const userCode = user.employeeCode?.toString().trim();
    return apiCode && userCode && apiCode === userCode;
  })
  .sort((a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime())
  .map(record => ({
    logDate: new Date(record.LogDate),
    serialNumber: record.SerialNumber,
    employeeCode: record.EmployeeCode,
  }));
    // Check if summary exists for today
    const existingSummary :any = await this.summaryModel.findOne({
      userId: user._id,
      date: dateString,
    });
this.logger.log(`Processing user: ${user.employeeCode} `,logs);
    if (existingSummary && existingSummary.logs?.length === logs.length) {
      continue;
    }

    // 3. Calculate attendance status
    let duration = 0;
    let status = 'Absent';
    
let latePunchBy = 0;
let earlyExitBy = 0;
   if (logs.length > 0) {
  logs = [logs[0], logs[logs.length - 1]];

  const firstLog = logs[0].logDate;
  const lastLog = logs[logs.length - 1].logDate;


  if (logs.length === 1) status = 'Missed Punch';

  const diffInMs = new Date(lastLog).getTime() - new Date(firstLog).getTime();
  if (diffInMs < 1) status = 'Missed Punch';

  const diffInHours = diffInMs / (1000 * 60 * 60);
  duration = diffInHours;

  if (diffInHours >= 8.5) {
    status = 'Full Day';
  } else if (diffInHours >= 5) {
    status = 'Half Day';
  }

  // --- Substatus logic ---

    const punchInTime = new Date(firstLog);
    const punchOutTime = new Date(lastLog);

// Late Punch In check (after 10:35 AM)
const latePunchInThreshold = new Date(punchInTime);
latePunchInThreshold.setHours(10, 35, 0, 0);

if (punchInTime > latePunchInThreshold) {
  const diffMs = punchInTime.getTime() - latePunchInThreshold.getTime();
  latePunchBy = Math.floor(diffMs / 60000); // convert ms to minutes
}

// Early Exit check (before 7:00 PM)
const earlyExitThreshold = new Date(punchOutTime);
earlyExitThreshold.setHours(19, 0, 0, 0);

if (punchOutTime < earlyExitThreshold) {
  const diffMs = earlyExitThreshold.getTime() - punchOutTime.getTime();
  earlyExitBy = Math.floor(diffMs / 60000); // convert ms to minutes
}
}
    // 4. Create or update summary
    if (existingSummary) {
      existingSummary.logs = logs;
      existingSummary.status = status;
      existingSummary.duration = duration;
      existingSummary.earlyLeftBy = earlyExitBy;
      existingSummary.lateBy = latePunchBy;
      await existingSummary.save();
    } else {
      await this.summaryModel.create({
        userId: user._id,
        logDate: dateString,
        logs,
        status,
        employeeCode: user.employeeCode.toString(),
        duration: duration,
        earlyLeftBy: earlyExitBy,
        lateBy: latePunchBy,
        date: dateString,
      });
    }
  }

  console.log('✅ Direct Attendance Summary Completed');
}

// @Cron(CronExpression.EVERY_30_SECONDS) // Every 30 minutes
// async handleAttendanceAndSummaryDirects() {
//   console.log('⏰ Starting Direct Attendance Summary Process');

//   const fromDate = '2025-08-08';
//   const toDate = '2025-08-15';

//   const apiUrl = `http://amogh.ampletrail.com/api/v2/WebAPI/GetDeviceLogs?APIKey=100215012504&FromDate=${fromDate}&ToDate=${toDate}`;
//   let apiData: any[] = [];

//   try {
//     const ap = await this.httpService.get(apiUrl);
//     apiData = Array.isArray(ap) ? ap : [];
//   } catch (error) {
//     console.error('❌ Error fetching attendance API:', error);
//     return;
//   }

//   const users = await this.userService.getAllWithoutPagination({});

//   for (const user of users) {
//     // All logs in the date range for this user
//     let logs = apiData
//       .filter(record => {
//         const apiCode = record.EmployeeCode?.toString().trim();
//         const userCode = user.employeeCode?.toString().trim();
//         return apiCode && userCode && apiCode === userCode;
//       })
//       .sort((a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime())
//       .map(record => ({
//         logDate: new Date(record.LogDate),
//         serialNumber: record.SerialNumber,
//         punchDirection: record.PunchDirection,
//         temperature: record.Temperature,
//         temperatureState: record.TemperatureState,
//       }));

//     if (logs.length === 0) continue;

//     // Take only first punch from first day and last punch from last day in range
//     logs = [logs[0], logs[logs.length - 1]];

//     // Calculate duration
//     let duration = 0;
//     let status = 'Absent';
//     let subStatus = null;

//     const firstLog = logs[0].logDate;
//     const lastLog = logs[logs.length - 1].logDate;

//     const diffInMs = new Date(lastLog).getTime() - new Date(firstLog).getTime();
//     if (diffInMs < 1) status = 'Missed Punch';
//     else {
//       const diffInHours = diffInMs / (1000 * 60 * 60);
//       duration = diffInHours;

//       if (diffInHours >= 8.5) status = 'Full Day';
//       else if (diffInHours >= 5) status = 'Half Day';
//       else status = 'Short Hours';
//     }

//     let latePunchBy = 0;
// let earlyExitBy = 0;
//     const punchInTime = new Date(firstLog);
//     const punchOutTime = new Date(lastLog);

// // Late Punch In check (after 10:35 AM)
// const latePunchInThreshold = new Date(punchInTime);
// latePunchInThreshold.setHours(10, 35, 0, 0);

// if (punchInTime > latePunchInThreshold) {
//   const diffMs = punchInTime.getTime() - latePunchInThreshold.getTime();
//   latePunchBy = Math.floor(diffMs / 60000); // convert ms to minutes
// }

// // Early Exit check (before 7:00 PM)
// const earlyExitThreshold = new Date(punchOutTime);
// earlyExitThreshold.setHours(19, 0, 0, 0);

// if (punchOutTime < earlyExitThreshold) {
//   const diffMs = earlyExitThreshold.getTime() - punchOutTime.getTime();
//   earlyExitBy = Math.floor(diffMs / 60000); // convert ms to minutes
// }


//     // Check if a summary exists for the whole range
//     const existingSummary: any = await this.summaryModel.findOne({
//       userId: user._id,
//       fromDate,
//       toDate,
//     });

//     if (existingSummary) {
//       existingSummary.logs = logs;
//       existingSummary.status = status;
//       existingSummary.duration = duration;
//       existingSummary.earlyExitBy = earlyExitBy;
//       existingSummary.latePunchBy = latePunchBy;

//       await existingSummary.save();
//     } else {
//       await this.summaryModel.create({
//         userId: user._id,
//         fromDate,
//         toDate,
//         logs,
//         status,
//         logDate: new Date(),
//         employeeCode: user.employeeCode.toString(),
//         duration,
//         subStatus,
//       });
//     }
//   }

//   console.log('✅ Direct Attendance Summary Completed');
// }


}
