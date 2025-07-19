import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Attendance } from './schemas/attendance.schema';
import { HttpRequestsService } from 'src/shared/http-requests/http-requests.service';

@Injectable()
export class AttendanceCron {
  constructor(
    private readonly httpService: HttpRequestsService,
    @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>
  ) {}

  // Runs every day at midnight
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
          await this.attendanceModel.create({
            EmployeeCode: record.EmployeeCode,
            LogDate: logDate,
            SerialNumber: record.SerialNumber,
            PunchDirection: record.PunchDirection,
            Temperature: record.Temperature,
            TemperatureState: record.TemperatureState,
          });
        } else {
          console.log('Duplicate within 1 minute, skipping:', record);
        }
      }
    }
  }
}
