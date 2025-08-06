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
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  logDate: Date;

  @Prop({ type: Array })
  logs: Logs[];

  @Prop({ enum: ['Full Day', 'Half Day', 'Absent'], default: 'Absent' })
  status: string;
}

export type AttendanceSummaryDocument = AttendanceSummary & Document;
export const AttendanceSummarySchema = SchemaFactory.createForClass(AttendanceSummary);
