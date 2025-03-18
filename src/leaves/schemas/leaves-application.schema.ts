import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LeaveApplicationDocument = HydratedDocument<LeaveApplication>;

@Schema({ collection: 'leaves-application', timestamps: true })
export class LeaveApplication {
  
 
  @Prop({ required: false })
  managerId: string;
  
  @Prop({ required: false })
  teamLeadId: string;

  @Prop({ required: false })
  type: string;

  @Prop({ required: false })
  fromDate: Date;
  
  @Prop({ required: false })
  toDate: Date;
  @Prop({ required: false })
  startHalf: string;

  @Prop({ required: false })
  endHalf: string;

  @Prop({ required: false })
  reason: string;
  @Prop({ required: false })
  duration:string
  
  @Prop({required:false})
  userId:mongoose.Types.ObjectId;

  @Prop({required:false, default:"PENDING"})
  status:string

  @Prop({required:false, default:false})
  isVerified:boolean
  @Prop({required:false})
  approvalAt:Date


}

export const LeaveApplicationSchema = SchemaFactory.createForClass(LeaveApplication);
