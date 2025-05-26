import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Company extends Document {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  address: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User' })
  createdBy: mongoose.Types.ObjectId;

  @Prop({ type: Number, default: 1 })
  status: number;
}

export const CompanySchema = SchemaFactory.createForClass(Company);
