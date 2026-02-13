import { WasteMaterial } from './../entities/waste-material.entity';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, FindOptionsWhere } from 'typeorm';
import { WasteCategory, WasteHistory } from '../entities';

@Injectable()
export class WasteSortingService {
  constructor(
    @InjectRepository(WasteCategory)
    private wasteCategoryRepository: Repository<WasteCategory>,

    @InjectRepository(WasteHistory)
    private wasteHistoryRepo: Repository<WasteHistory>,

    @InjectRepository(WasteMaterial)
    private wasteMaterialRepo: Repository<WasteMaterial>,
  ) {}

  async findByMaterialId(materialId: number) {
    const material = await this.wasteMaterialRepo.findOne({
      where: { id: materialId },
      relations: ['wasteCategory', 'materialGuides'],
    });

    if (!material) {
      throw new NotFoundException(`ไม่พบข้อมูลขยะ: ${materialId}`);
    }
    return {
      material_id: material.id,
      material_name: material.name,
      material_image: material.meterial_image,
      waste_category: material.wasteCategory
        ? [
            {
              id: material.wasteCategory.id,
              name: material.wasteCategory.name,
            },
          ]
        : [],
      create_at: material.created_at,
    };
  }

  async recordWasteWeight(materialId: number, weight: number, userId: number) {
    const material = await this.wasteMaterialRepo.findOne({
      where: { id: materialId },
      relations: ['wasteCategory'],
    });

    if (!material) {
      throw new NotFoundException('ไม่พบข้อมูลวัสดุที่ระบุ');
    }

    const newHistory = this.wasteHistoryRepo.create({
      amount: weight,
      record_type: 'manual',
      waste_meterialid: materialId,
      userid: userId,
      wastesid: null,
      create_at: new Date(),
    });

    const savedHistory = await this.wasteHistoryRepo.save(newHistory);

    return {
      meterial_image: material.meterial_image,
      meterial_name: material.name,
      category: material.wasteCategory
        ? [
            {
              id: material.wasteCategory.id,
              name: material.wasteCategory.name,
            },
          ]
        : [],
      weight: savedHistory.amount,
      create_at: savedHistory.create_at,
    };
  }

  async findAllCategories() {
    const categories = await this.wasteCategoryRepository.find({
      order: {
        id: 'ASC',
      },
    });

    return {
      data: categories,
    };
  }

  async findMeterialsAll(
    page: number = 1,
    categoryName?: string,
    materialName?: string,
  ) {
    const limit = 6;
    const skip = (page - 1) * limit;
    const whereCondition: FindOptionsWhere<WasteMaterial> = {};

    if (categoryName) {
      whereCondition.wasteCategory = { name: ILike(`%${categoryName}%`) };
    }
    if (materialName) {
      whereCondition.name = ILike(`%${materialName}%`);
    }

    const [results, total] = await this.wasteMaterialRepo.findAndCount({
      where: whereCondition,
      relations: ['wasteCategory'],
      take: limit,
      skip: skip,
      order: { id: 'ASC' },
    });

    const formattedData = results.map((item) => ({
      id: Number(item.id),
      name: item.name,
      meterial_image: item.meterial_image || '',
      waste_categoriesid: item.wasteCategory
        ? {
            id: item.wasteCategory.id,
            name: item.wasteCategory.name,
          }
        : null,
    }));

    const totalPages = total > 0 ? Math.ceil(total / limit) : 0;

    return {
      data: formattedData,
      pagination: {
        total_items: total,
        per_page: limit,
        current_page: Number(page),
        total_pages: totalPages,
        page_info: total === 0 ? '0 / 0' : `${page} / ${totalPages}`,
      },
    };
  }
}
