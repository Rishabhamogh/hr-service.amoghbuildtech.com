import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'onDuty', timestamps: true })
export class User {
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

export const UserSchema = SchemaFactory.createForClass(User);
