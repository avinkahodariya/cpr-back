// courses.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Cources, SearchParamsDTO, UserRoles } from 'libs/schema/src';
import { CourcesService } from './courses.service';
import { CreateCourcesDto, UpdateCourcesDto } from './dto/create-courses.dto';
import { RoleGuard } from 'src/auth/role.guard';

@Controller('courses')
// @UseGuards(RoleGuard[UserRoles.Administrator])
export class CourcesController {
  constructor(private readonly coursesService: CourcesService) {}

  // Create a new course
  @Post()
  create(@Body() createCourcesDto: CreateCourcesDto): Promise<Cources> {
    return this.coursesService.create(createCourcesDto);
  }

  // Get all courses
  @Get()
  findAll(
    @Query() query: SearchParamsDTO,
  ): Promise<{ list: Cources[]; total: number }> {
    return this.coursesService.findAll(query);
  }

  // Get a specific course by ID
  @Get(':id')
  findOne(@Param('id') id: string): Promise<Cources> {
    return this.coursesService.findOne(id);
  }

  // Update a course by ID
  @Put(':id')
  update(
    @Param('id') id: string,
    @Body() updateCourcesDto: UpdateCourcesDto,
  ): Promise<Cources> {
    return this.coursesService.update(id, updateCourcesDto);
  }

  // Delete a course by ID
  @Delete(':id')
  remove(@Param('id') id: string): Promise<Cources> {
    return this.coursesService.remove(id);
  }
}
