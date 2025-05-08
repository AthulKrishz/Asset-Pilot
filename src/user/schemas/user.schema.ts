import { Role } from '@common/enums/role.enum';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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

  @Prop({ default: null })
  companyid: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
