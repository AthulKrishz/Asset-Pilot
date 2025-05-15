import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';
import { Model } from 'mongoose';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Injectable()
export class BrandService {
  constructor(@InjectModel(Brand.name) private model: Model<BrandDocument>) {}

  create(createBrandDto: CreateBrandDto) {
    return this.model.create(createBrandDto);
  }

  findAll() {
    return this.model.find().exec();
  }

  async findOne(id: string) {
    const brand = await this.model.findById(id);

    if (!brand) throw new NotFoundException('Brand Not Founnd');
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const updated = await this.model.findByIdAndUpdate(id, updateBrandDto, {
      new: true,
    });
    if (!updated) throw new NotFoundException('Brand Not Found');
    return updated;
  }

  async remove(id: string) {
    const deleted = await this.model.findByIdAndDelete(id);
    if (!deleted) throw new NotFoundException('Brand Not Found');
    return { deleted: true };
  }
}
