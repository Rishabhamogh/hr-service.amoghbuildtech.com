import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type LeaveDocument = HydratedDocument<Leave>;

@Schema({ collection: 'leaves', timestamps: true })
export class Leave {
  
 
  // @Prop({ required: false })
  // managerId: string;

  // @Prop({ required: false })
  // teamLeadId: string;

  @Prop({required:false})
  totalLeaves:number
  @Prop({required:false})
  totalLeavesProvided:number
  @Prop({required:false})
  type:string
  @Prop({ required: false })
  year: string;
  // @Prop({required:false})
  // approvedLeaves:string
  @Prop({required:true})
  userId:mongoose.Types.ObjectId

}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
LeaveSchema.index({ userId: 1, year: 1, type:1 }, { unique: true }); // Ensure unique leave records per user per year