import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ItemType, ItemTypeDocument } from './schemas/item-type.schema';
import { Model } from 'mongoose';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { UpdateItemTypeDto } from './dto/update-item-type.dto';

@Injectable()
export class ItemTypeService {
  constructor(
    @InjectModel(ItemType.name) private model: Model<ItemTypeDocument>,
  ) {}

  create(createItemTypeDto: CreateItemTypeDto) {
    return this.model.create(createItemTypeDto);
  }

  finadAll() {
    return this.model.find().exec();
  }

  async findOne(id: string) {
    const type = await this.model.findById(id);

    if (!type) throw new NotFoundException('Item Type Not Found');
    return type;
  }

  async update(id: string, updateItemTypeDto: UpdateItemTypeDto) {
    const updated = await this.model.findByIdAndUpdate(id, updateItemTypeDto, {
      new: true,
    });

    if (!updated) throw new NotFoundException('Item Type Not Found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Item Type Not Found');
    return { deleted: true };
  }
}
