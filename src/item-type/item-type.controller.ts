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
import { ItemTypeService } from './item-type.service';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from '@common/gaurds/roles.gaurd';
import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/enums/role.enum';
import { CreateItemTypeDto } from './dto/create-item-type.dto';
import { UpdateItemTypeDto } from './dto/update-item-type.dto';

@Controller('item-type')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ItemTypeController {
  constructor(private readonly itemTypeService: ItemTypeService) {}

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Post()
  create(@Body() createItemTypeDto: CreateItemTypeDto) {
    return this.itemTypeService.create(createItemTypeDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get()
  findAll() {
    return this.itemTypeService.finadAll();
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemTypeService.findOne(id);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateItemTypeDto: UpdateItemTypeDto,
  ) {
    return this.itemTypeService.update(id, updateItemTypeDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemTypeService.remove(id);
  }
}
