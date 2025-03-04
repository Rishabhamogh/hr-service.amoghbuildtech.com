import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

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
  duration:string
  
  @Prop({required:false})
  userId:string

  @Prop({required:false, default:"PENDING"})
  status:string


}

export const LeaveApplicationSchema = SchemaFactory.createForClass(LeaveApplication);
