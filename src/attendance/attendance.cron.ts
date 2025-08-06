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
   @Cron('30 23 * * *')
async generateDailySummary() {
  console.log('⏰ Starting daily attendance summary...');

  const todayStart = moment().startOf('day').toDate();      // e.g. 2025-08-06T00:00:00.000Z
  const todayEnd = moment().endOf('day').toDate();          // e.g. 2025-08-06T23:59:59.999Z

  const users = await this.userService.getAllWithoutPagination({});           // Make sure this returns all users

  for (const user of users) {
    const logs = await this.attendanceModel.find({
      userId: user._id,
      logDate: {
        $gte: todayStart,
        $lte: todayEnd,
      },
    }).sort({ logDate: 1 });

this.logger.debug(`Processing user ${user._id} — Logs found: ${logs}`);
    let status = 'Absent';

    if (logs.length > 0) {
      const firstLog = logs[0].logDate;
      const lastLog = logs[logs.length - 1].logDate;
      if (logs.length === 1) { status="Missed Punch"}
      const diffInMs = new Date(lastLog).getTime() - new Date(firstLog).getTime();
      if(diffInMs < 1) status="Missed Punch"
      const diffInHours = diffInMs / (1000 * 60 * 60);

      if (diffInHours >= 8.5) {
        status = 'Full Day';
      } else if (diffInHours >= 5) {
        status = 'Half Day';
      } else {
        status = 'Absent'; 
      }
    }

    await this.summaryModel.create({
      userId: user._id,
      logDate: todayStart,
      logs,
      status,
    });

  }

}


}
