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
    const material = this.wasteMaterialRepository.create(createDto);
    return await this.wasteMaterialRepository.save(material);
  }

  async updateWasteMaterial(
    id: number,
    updateDto: UpdateWasteMaterialDto,
  ): Promise<WasteMaterial> {
    const material = await this.getWasteMaterialById(id);
    Object.assign(material, updateDto);
    return await this.wasteMaterialRepository.save(material);
  }

  async deleteWasteMaterial(id: number): Promise<void> {
    const material = await this.getWasteMaterialById(id);
    await this.wasteMaterialRepository.remove(material);
  }
}