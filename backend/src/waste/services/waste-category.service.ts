import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteCategory } from '../entities/waste-category.entity';
import { CreateWasteCategoryDto } from '../dto/waste-category.dto';

@Injectable()
export class WasteCategoryService {
  constructor(
    @InjectRepository(WasteCategory)
    private readonly wasteCategoryRepository: Repository<WasteCategory>,
  ) {}

  async findAll(): Promise<WasteCategory[]> {
    return await this.wasteCategoryRepository.find({
      order: { id: 'ASC' },
    });
  }

  async findOne(id: number): Promise<WasteCategory> {
    const category = await this.wasteCategoryRepository.findOne({
      where: { id },
      relations: ['materials'],
    });

    if (!category) {
      throw new NotFoundException(`Waste category with ID ${id} not found`);
    }

    return category;
  }

  async create(createDto: CreateWasteCategoryDto): Promise<WasteCategory> {
    // ตรวจสอบว่ามีชื่อซ้ำหรือไม่
    const existingCategory = await this.wasteCategoryRepository.findOne({
      where: { name: createDto.name },
    });

    if (existingCategory) {
      throw new ConflictException('หมวดหมู่นี้มีอยู่แล้ว');
    }

    const category = this.wasteCategoryRepository.create(createDto);
    return await this.wasteCategoryRepository.save(category);
  }
}
