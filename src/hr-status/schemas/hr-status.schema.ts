import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type HRStatusDocument = HydratedDocument<HRStatus>;

class Logs {
  @Prop()
  employeeCode: string;

  @Prop()
  type?: string;

  @Prop()
  date?: Date;

  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;

  @Prop()
  status?: string;

  @Prop()
  reason?: string;
}

@Schema({ collection: 'hrStatus', timestamps: true })
export class HRStatus {
  @Prop()
  employeeCode: string;

  @Prop()
  type?: string;

  @Prop()
  date?: Date;

  @Prop({ required: true })
  userId: mongoose.Types.ObjectId;

  @Prop()
  status?: string;

  @Prop()
  reason?: string;

  @Prop({ type: [Logs], required: false })
  logs?: Logs[];
}

export const HRStatusSchema = SchemaFactory.createForClass(HRStatus);
