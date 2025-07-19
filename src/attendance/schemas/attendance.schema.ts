import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ required: true })
  EmployeeCode: string;

  @Prop({ required: true })
  LogDate: string;

  @Prop({ required: true })
  SerialNumber: string;

  @Prop()
  PunchDirection: string;

  @Prop()
  Temperature: number;

  @Prop()
  TemperatureState: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
