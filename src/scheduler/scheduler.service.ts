import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AttendanceService } from '../attendance/attendance.service';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
// import { Attendance } from './schemas/attendance.schema';

@Injectable()
export class SchedulerService {
  constructor(
    private readonly attendanceService: AttendanceService,
    // @InjectModel(Attendance.name) private attendanceModel: Model<Attendance>
  ) {}

  // Runs every day at midnight
 
}
