// courses.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cources, CourcesDocument, SearchParamsDTO } from 'libs/schema/src';
import { CreateCourcesDto, UpdateCourcesDto } from './dto/create-courses.dto';

@Injectable()
export class CourcesService {
  constructor(
    @InjectModel(Cources.name) private coursesModel: Model<CourcesDocument>,
  ) {}

  // Create
  async create(createCourcesDto: CreateCourcesDto): Promise<Cources> {
    const createdCourse = new this.coursesModel(createCourcesDto);
    return createdCourse.save();
  }

  // Find All with Pagination and Count
  async findAll(
    query: SearchParamsDTO,
  ): Promise<{ list: Cources[]; total: number }> {
    const { page = 0, limit = 1000000000000000, search } = query;

    // Build the search query object
    const searchQuery = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } }, // Case-insensitive search on the title
            { description: { $regex: search, $options: 'i' } }, // Case-insensitive search on the description
          ],
        }
      : {};

    // Get the total count of the documents matching the search query
    const total = await this.coursesModel.countDocuments(searchQuery).exec();

    // Get the paginated courses
    const courses = await this.coursesModel
      .find(searchQuery)
      .skip(page * limit)
      .limit(limit)
      .exec();

    return { list: courses, total };
  }

  // Find One
  async findOne(id: string): Promise<Cources> {
    return this.coursesModel.findById(id).exec();
  }

  // Update
  async update(
    id: string,
    updateCourcesDto: UpdateCourcesDto,
  ): Promise<Cources> {
    return this.coursesModel
      .findByIdAndUpdate(id, updateCourcesDto, {
        new: true,
      })
      .exec();
  }

  // Delete (soft delete)
  async remove(id: string): Promise<Cources> {
    return this.coursesModel.findByIdAndUpdate(id, { isActive: false }).exec();
  }
}
