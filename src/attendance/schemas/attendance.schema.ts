import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Attendance extends Document {
  @Prop({ required: true ,unique: true})
  employeeCode: string;

  @Prop()
  logDate: Date;

  @Prop({ required: true })
  serialNumber: string;

  @Prop({ required: false })
  userId: string;


  @Prop()
  punchDirection: string;

  @Prop()
  temperature: number;

  @Prop()
  temperatureState: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
