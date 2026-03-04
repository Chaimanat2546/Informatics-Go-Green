import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import { WasteMaterial } from '../entities/waste-material.entity';
import { CreateWasteMaterialDto, UpdateWasteMaterialDto } from '../dto/waste-material.dto';

@Injectable()
export class WasteMaterialService {
  constructor(
    @InjectRepository(WasteMaterial)
    private wasteMaterialRepository: Repository<WasteMaterial>,
  ) {}

  async getAllWasteMaterials(
    search?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    data: WasteMaterial[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const skip = (page - 1) * limit;
    const whereCondition: Record<string, unknown>[] = [];

    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      whereCondition.push(
        { name: Like(searchTerm) },
        { unit: Like(searchTerm) },
        { wasteCategory: { name: Like(searchTerm) } },
      );
    }

    const [data, total] = await this.wasteMaterialRepository.findAndCount({
      where: whereCondition.length > 0 ? whereCondition : undefined,
      relations: ['wasteCategory'],
      order: { id: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getWasteMaterialById(id: number): Promise<WasteMaterial> {
    const material = await this.wasteMaterialRepository.findOne({
      where: { id },
      relations: ['wasteCategory'],
    });

    if (!material) {
      throw new NotFoundException(`Waste material with ID ${id} not found`);
    }

    return material;
  }

  async createWasteMaterial(createDto: CreateWasteMaterialDto): Promise<WasteMaterial> {
    const material = this.wasteMaterialRepository.create({
      name: createDto.name,
      emission_factor: createDto.emissionFactor,
      unit: createDto.unit,
      material_image: createDto.materialImage,
      waste_categoriesid: createDto.wasteCategoriesId,
    });
    return await this.wasteMaterialRepository.save(material);
  }

  async updateWasteMaterial(
    id: number,
    updateDto: UpdateWasteMaterialDto,
  ): Promise<WasteMaterial> {
    const material = await this.getWasteMaterialById(id);
    if (updateDto.name !== undefined) material.name = updateDto.name;
    if (updateDto.emissionFactor !== undefined) material.emission_factor = updateDto.emissionFactor;
    if (updateDto.unit !== undefined) material.unit = updateDto.unit;
    if (updateDto.materialImage !== undefined) material.material_image = updateDto.materialImage;
    if (updateDto.wasteCategoriesId !== undefined) material.waste_categoriesid = updateDto.wasteCategoriesId;
    return await this.wasteMaterialRepository.save(material);
  }

  async deleteWasteMaterial(id: number): Promise<void> {
    const material = await this.getWasteMaterialById(id);
    await this.wasteMaterialRepository.remove(material);
  }
}