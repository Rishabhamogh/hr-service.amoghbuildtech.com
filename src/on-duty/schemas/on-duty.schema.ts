import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type OnDutyDocument = HydratedDocument<OnDuty>;

export class Feedback {
  @Prop({ required: true })
  value: string;

  @Prop()
  userId: string;

  @Prop({ default: Date.now() })
  createdAt: Date;
}
@Schema({ collection: 'onDuty', timestamps: true })
export class OnDuty {
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
   
     @Prop({ default: [] })
     feedback: Feedback[];
    @Prop({ required: false })
    reason: string;
    @Prop({ required: false })
    duration:string

     @Prop({ required: false })
    statusUpadtedBy:string
    
    @Prop({required:true})
    userId:mongoose.Types.ObjectId;
  
    @Prop({required:false, default:"PENDING"})
    status:string
  
    @Prop({required:false, default:false})
    isVerified:boolean
    @Prop({required:false})
    approvalAt:Date

}

export const OnDutySchema = SchemaFactory.createForClass(OnDuty);
