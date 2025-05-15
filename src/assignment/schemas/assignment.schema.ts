import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Company } from 'src/companies/schemas/company.schema';
import { Item } from 'src/items/schemas/item.schema';
import { User } from 'src/user/schemas/user.schema';

@Schema({ timestamps: true })
export class Assignment {
  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Item', required: true })
  item: Item;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  assignedTo: User;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
  assignedBy: User;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Company',
    required: true,
  })
  companyId: Company;

  @Prop({ type: Date, required: true })
  assignedAt: Date;

  @Prop({ type: Date })
  assignedTill?: Date;

  @Prop({ type: Date })
  unassignedAt?: Date;
}

export const AssignmentSchema = SchemaFactory.createForClass(Assignment);
