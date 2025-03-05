import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { User } from './user-data.schema';

export type CourcesDocument = HydratedDocument<Cources>;

@Schema({
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
})
export class Cources {
  @Prop({ required: true })
  title: string;

  @Prop({ required: false })
  category: string;

  @Prop({ required: false })
  description: string;

  @Prop({ required: false })
  duration: string;

  @Prop({ required: false })
  enrollmentCount: string;

  @Prop({ required: false, ref: 'User' })
  createdBy: User;

  @Prop({ required: true, type: Boolean, default: true })
  isActive: boolean;
}

export const CourcesSchema = SchemaFactory.createForClass(Cources);
