import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item, ItemDocument } from './schemas/item.schema';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(@InjectModel(Item.name) private itemModel: Model<ItemDocument>) {}
  //Create Item
  create(createItemDto: CreateItemDto) {
    return this.itemModel.create(createItemDto);
  }

  findAll() {
    return this.itemModel
      .find()
      .populate('companyId')
      .populate('itemType')
      .populate('brand')
      .populate('assignedTo')
      .exec();
  }

  async findOne(id: string) {
    const item = await this.itemModel.findById(id);

    if (!item) throw new NotFoundException('Item Not Found');
    return item;
  }

  async update(id: string, updateItemDto: UpdateItemDto) {
    const updated = await this.itemModel.findByIdAndUpdate(id, updateItemDto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Item Not Found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.itemModel.findByIdAndDelete(id);

    if (!deleted) throw new NotFoundException('Item Not Found');
    return { deleted: true };
  }
}
