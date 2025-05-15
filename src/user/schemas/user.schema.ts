import { Role } from '@common/enums/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ unique: [true, 'Duplicate Email Entered'], required: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({
    type: String,
    enum: Object.values(Role),
    required: true,
  })
  role: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null })
  companyid: mongoose.Types.ObjectId;

  @Prop({ default: null })
  isVerified: boolean;

  @Prop({ type: String, default: null })
  otp?: string | null;

  @Prop({ type: Date, default: null })
  otpExpires?: Date | null;

  @Prop({ type: Date, default: null })
  otpSendAt?: Date | null;

  @Prop({ type: Number, default: 0 })
  otpResendCount?: number | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
