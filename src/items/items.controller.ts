import { Roles } from '@common/decorators/role.decorator';
import { Role } from '@common/enums/role.enum';
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
import { CreateItemDto } from './dto/create-item.dto';
import { ItemsService } from './items.service';
import { UpdateItemDto } from './dto/update-item.dto';

@Controller('items')
@UseGuards(AuthGuard('jwt'), RolesGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}
  //create Items
  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get()
  findAll() {
    return this.itemsService.findAll();
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsService.findOne(id);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Roles(Role.SuperAdmin, Role.Admin, Role.CompanyAdmin, Role.Manager)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsService.remove(id);
  }
}
