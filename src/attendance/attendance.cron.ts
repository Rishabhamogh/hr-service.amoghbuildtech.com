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
  @Cron(CronExpression.EVERY_DAY_AT_11PM) // Every 30 minutes
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
    const logs = apiData
  .filter(record => {
    const apiCode = record.EmployeeCode?.toString().trim();
    const userCode = user.employeeCode?.toString().trim();
    return apiCode && userCode && apiCode === userCode;
  })
  .sort((a, b) => new Date(a.LogDate).getTime() - new Date(b.LogDate).getTime())
  .map(record => ({
    logDate: new Date(record.LogDate),
    serialNumber: record.SerialNumber,
    punchDirection: record.PunchDirection,
    temperature: record.Temperature,
    temperatureState: record.TemperatureState,
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
    if (logs.length > 0) {
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
    }

    // 4. Create or update summary
    if (existingSummary) {
      existingSummary.logs = logs;
      existingSummary.status = status;
      await existingSummary.save();
    } else {
      await this.summaryModel.create({
        userId: user._id,
        logDate: todayStart,
        logs,
        status,
        employeeCode: user.employeeCode,
        duration: duration,
        date: dateString,
      });
    }
  }

  console.log('✅ Direct Attendance Summary Completed');
}


}
