import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({
  timestamps: true, // Automatically adds `createdAt` and `updatedAt` fields
})
export class User {
  @Prop({ required: true })
  emailID: string;

  @Prop({ required: false })
  password: string;

  @Prop({ required: false })
  phoneNo: string;

  @Prop({ required: false })
  country: string;

  @Prop({ required: false })
  state: string;

  @Prop({ required: false })
  address: string;

  @Prop({ required: false })
  zipcode: string;
  // @Prop({ required: false, default: true })
  // showeRecurringMeet: boolean;

  @Prop({ required: false })
  image: string;

  @Prop({ required: false })
  firstname: string;

  @Prop({ required: false })
  lastname: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
