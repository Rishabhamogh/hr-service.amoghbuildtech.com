// schemas/attendance-summary.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';


class Logs{ 
     @Prop({ required: true })
        logDate: Date;
    @Prop()
    employeeCode: string;
    @Prop()
    userId: string;

}
@Schema({ collection: 'attendenceSummary', timestamps: true })
export class AttendanceSummary {
  @Prop({ type: Types.ObjectId, ref: 'Users', required: true })
  userId: Types.ObjectId;

  @Prop({ required: false })
  logDate: Date;

  
  @Prop({ required: true })
  employeeCode: string;

    @Prop({ required: false })
  lateBy: number;
    @Prop({ required: false })
  earlyLeftBy: number;
  @Prop({ required: true })
  duration: number;
  @Prop({ required: false })
  date: string;

  @Prop({ type: Array })
  logs: Logs[];

  @Prop({ enum: ['Full Day', 'Half Day', 'Absent',"Missed Punch"], default: 'Absent' })
  status: string;
}

export type AttendanceSummaryDocument = AttendanceSummary & Document;
export const AttendanceSummarySchema = SchemaFactory.createForClass(AttendanceSummary);
AttendanceSummarySchema.index({ userId: 1, date: 1 }, { unique: true }); // Ensure unique userId and logDate combination
