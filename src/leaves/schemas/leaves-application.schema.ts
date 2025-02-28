import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'leaves-appLication', timestamps: true })
export class User {
  
 
  @Prop({ required: false })
  managerId: string;
  
  @Prop({ required: false })
  teamLeadId: string;

  @Prop({required:false})
  totalLeaves:string

  @Prop({required:false})
  approvedLeaves:string
  @Prop({required:false})
  userId:string

}

export const UserSchema = SchemaFactory.createForClass(User);
