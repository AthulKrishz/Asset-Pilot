import { RolesGuard } from '@common/gaurds/roles.gaurd';
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { BrandService } from './brand.service';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/enums/role.enum';
import { CreateBrandDto } from './dto/create-brand.dto';
import { UpdateBrandDto } from './dto/update-brand.dto';

@Controller('brand')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Post()
  create(@Body() createBrandDto: CreateBrandDto) {
    return this.brandService.create(createBrandDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get()
  findAll() {
    return this.brandService.findAll();
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandService.findOne(id);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandDto: UpdateBrandDto) {
    return this.brandService.update(id, updateBrandDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandService.remove(id);
  }
}
