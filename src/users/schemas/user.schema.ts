import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  role: string;

  @Prop({
    type: String,
    index: {
      unique: true,
      partialFilterExpression: { emailId: { $type: 'string' } },
    },
  })
  emailId: string;

  @Prop({ required: true })
  mobile: string;

  @Prop({ required: false })
  personalEmail: string;
  @Prop({ required: true })
  password: string;

  @Prop({ required: false, unique: true })
  employeeCode: string;

  @Prop({ required: false })
  managerId: string;

  @Prop({ required: false })
  machineNumber: string

  @Prop({ required: false })
  team: string[];

  @Prop({ required: false, default: false })
  isDeleted: Boolean

  @Prop({ required: false })
  teamLeadId: string

  @Prop({ required: false })
  workingHours: number

  @Prop({ required: false })
  weekEnds: string[]
  @Prop({ required: false })
  shiftStartAt: string
  @Prop({ required: false })
  shiftEndAt: string
  @Prop({ required: false, enum: ["Male", "Female", "Other"] })
  gender: string
  @Prop({ required: false, enum: ["Single", "Married", "Divorced", "Widowed"] })
  maritalStatus: string
  @Prop({ required: false })
  anniversary: Date
  @Prop({ required: false })
  birthday: Date
  @Prop({ required: false })
  department: string[]

}

export const UserSchema = SchemaFactory.createForClass(User);
UserSchema.index({ mobile: 1 }, { unique: true });
UserSchema.index({ employeeCode: 1 }, { unique: true });

