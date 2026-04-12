import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { WasteMaterial } from '../entities/waste-material.entity';
import { WasteCategory } from '../entities/waste-category.entity';
import { WasteHistory } from '../entities/waste-history.entity';
import { MaterialGuide } from '../entities/material-guide.entity';
import {
  CreateWasteMaterialDto,
  UpdateWasteMaterialDto,
} from '../dto/waste-material.dto';

@Injectable()
export class WasteMaterialService {
  constructor(
    @InjectRepository(WasteMaterial)
    private wasteMaterialRepository: Repository<WasteMaterial>,
    @InjectRepository(WasteCategory)
    private wasteCategoryRepository: Repository<WasteCategory>,
    private dataSource: DataSource,
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

    const queryBuilder = this.wasteMaterialRepository
      .createQueryBuilder('material')
      .leftJoinAndSelect('material.wasteCategory', 'category')
      .orderBy('material.id', 'ASC')
      .skip(skip)
      .take(limit);

    if (search?.trim()) {
      queryBuilder.where(
        '(material.name LIKE :search OR material.unit LIKE :search OR category.name LIKE :search)',
        { search: `%${search.trim()}%` },
      );
    }

    const [data, total] = await queryBuilder.getManyAndCount();

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

  async createWasteMaterial(
    createDto: CreateWasteMaterialDto,
  ): Promise<WasteMaterial> {
    // Validate category exists
    const category = await this.wasteCategoryRepository.findOne({
      where: { id: createDto.wasteCategoryId },
    });
    if (!category) {
      throw new BadRequestException(
        `Category ID ${createDto.wasteCategoryId} not found`,
      );
    }

    const material = this.wasteMaterialRepository.create({
      ...createDto,
      wasteCategory: category,
    });

    return await this.wasteMaterialRepository.save(material);
  }

  async updateWasteMaterial(
    id: number,
    updateDto: UpdateWasteMaterialDto,
  ): Promise<WasteMaterial> {
    const material = await this.getWasteMaterialById(id);

    // Validate category if provided
    if (updateDto.wasteCategoryId) {
      const category = await this.wasteCategoryRepository.findOne({
        where: { id: updateDto.wasteCategoryId },
      });
      if (!category) {
        throw new BadRequestException(
          `Category ID ${updateDto.wasteCategoryId} not found`,
        );
      }
      material.wasteCategory = category;
    }

    // Handle image removal
    if (updateDto.removeImage || updateDto.materialImage === null) {
      material.materialImage = '';
    } else if (updateDto.materialImage) {
      material.materialImage = updateDto.materialImage;
    }

    // Update other fields
    if (updateDto.name) material.name = updateDto.name;
    if (updateDto.emissionFactor !== undefined)
      material.emissionFactor = updateDto.emissionFactor;
    if (updateDto.unit) material.unit = updateDto.unit;

    return await this.wasteMaterialRepository.save(material);
  }

  async deleteWasteMaterial(id: number): Promise<void> {
    const material = await this.getWasteMaterialById(id);
    await this.wasteMaterialRepository.remove(material);
  }

  // Transaction-based delete with image cleanup
  async deleteWasteMaterialWithImage(
    id: number,
    deleteImageCallback?: (filename: string) => Promise<void>,
  ): Promise<{ message: string }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const material = await queryRunner.manager.findOne(WasteMaterial, {
        where: { id },
      });

      if (!material) {
        throw new NotFoundException(`Waste material with ID ${id} not found`);
      }

      // Check if material is being used in WasteHistory
      const historyCount = await queryRunner.manager.count(WasteHistory, {
        where: { waste_meterialid: id },
      });

      if (historyCount > 0) {
        throw new ConflictException(
          `ไม่สามารถลบได้เนื่องจากมีการใช้งานในประวัติการแยกขยะ (${historyCount} รายการ)`,
        );
      }

      // Check if material is being used in MaterialGuide
      const guideCount = await queryRunner.manager.count(MaterialGuide, {
        where: { waste_meterialid: id },
      });

      if (guideCount > 0) {
        throw new ConflictException(
          `ไม่สามารถลบได้เนื่องจากมีการใช้งานในคู่มือการแยกขยะ (${guideCount} รายการ)`,
        );
      }

      const imageUrl: string | null | undefined = material.materialImage;

      // Delete from DB first (transaction)
      await queryRunner.manager.remove(material);
      await queryRunner.commitTransaction();

      // Then delete file (outside transaction - non-critical)
      if (imageUrl && deleteImageCallback) {
        const filename = String(imageUrl).split('/').pop();
        if (filename) {
          try {
            await deleteImageCallback(filename);
          } catch (error) {
            console.error('Failed to delete image file:', error);
            // Don't throw - DB is already deleted
          }
        }
      }

      return { message: 'ลบข้อมูลสำเร็จ' };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}

