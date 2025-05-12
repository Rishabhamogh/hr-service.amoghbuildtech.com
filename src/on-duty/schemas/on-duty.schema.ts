import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type OnDutyDocument = HydratedDocument<OnDuty>;

@Schema({ collection: 'onDuty', timestamps: true })
export class OnDuty {
  @Prop({ required: true })
  name: string;

  @Prop({ required: false })
  employeeCode: string;

  @Prop({ required: false })
  managerId: string;

  @Prop({required:false})
  teamLeadId:string

  @Prop({required:false})
  department:string

}

export const OnDutySchema = SchemaFactory.createForClass(OnDuty);
