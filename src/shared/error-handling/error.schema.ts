import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ErrorDocument = HydratedDocument<Error>;

@Schema({ collection: 'error', timestamps: true })
export class Error {
  @Prop({ required:  false})
  error: string;

}

export const ErrorSchema = SchemaFactory.createForClass(Error);

