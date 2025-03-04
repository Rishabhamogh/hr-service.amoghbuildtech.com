import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type LeaveDocument = HydratedDocument<Leave>;

@Schema({ collection: 'leaves', timestamps: true })
export class Leave {
  
 
  @Prop({ required: false })
  managerId: string;

  @Prop({ required: false })
  teamLeadId: string;

  @Prop({required:false})
  totalLeaves:string
  @Prop({required:false})
  type:string
  @Prop({required:false})
  approvedLeaves:string
  @Prop({required:false})
  userId:string

}

export const LeaveSchema = SchemaFactory.createForClass(Leave);
