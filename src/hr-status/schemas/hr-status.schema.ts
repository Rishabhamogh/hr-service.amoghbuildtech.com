import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument, Types } from 'mongoose';

export type OnDutyDocument = HydratedDocument<HRStatus>;


@Schema({ collection: 'hrStatus', timestamps: true })
class Logs{
    @Prop()
    employeeCode: string;
  
    @Prop({ required: false })
    type: string;
  
    @Prop({ required: false })
    date: Date;
    
    
    
    @Prop({required:true})
    userId:mongoose.Types.ObjectId;
  

    @Prop({required:false})
    status:string

     @Prop()
    reason:string
}
export class HRStatus {

    
    @Prop()
    employeeCode: string;
  
    @Prop({ required: false })
    type: string;
  
    @Prop({ required: false })
    date: Date;
    
    
    
    @Prop({required:true})
    userId:mongoose.Types.ObjectId;
  

    @Prop({required:false})
    status:string

     @Prop()
    reason:string
  
    @Prop({ required: false })
    logs:[Logs]
    
  

}

export const HRStatusSchema = SchemaFactory.createForClass(HRStatus);
