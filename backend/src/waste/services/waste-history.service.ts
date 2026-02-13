import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { WasteHistory } from '../entities';
import { Repository } from 'typeorm';

@Injectable()
export class WasteHistoryService {
  constructor(
    @InjectRepository(WasteHistory)
    private wasteHistoryRepository: Repository<WasteHistory>,
  ) {}

  async getAllHistory(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const [histories, total] = await this.wasteHistoryRepository.findAndCount({
      relations: ['waste', 'waste.wasteCategory', 'user' ,'wasteMaterial', 'wasteMaterial.wasteCategory'],
      order: { create_at: 'DESC' },
      take: limit,
      skip: skip,
    });

    return {
      data: this.mapHistoryData(histories),
      pagination: {
        totalItems: total,
        itemCount: histories.length,
        itemsPerPage: limit,
        totalPages: Math.ceil(total / limit),
        currentPage: page,
      },
    };
  }

  async getUserHistory(userId: string) {
    const histories = await this.wasteHistoryRepository.find({
      where: {
        user: { id: userId },
      },
      relations: [
        'waste',
        'waste.wasteCategory',
        'wasteMaterial',
        'wasteMaterial.wasteCategory',
        'user',
      ],
      order: { create_at: 'DESC' },
    });

    return this.mapHistoryData(histories);
  }

  private mapHistoryData(histories: WasteHistory[]) {
    return histories.map((history) => {
      const materialName =
        history.wasteMaterial?.name || history.waste?.name || 'Unknown';
      const categoryName =
        history.waste?.wasteCategory?.name ||
        history.wasteMaterial?.wasteCategory?.name ||
        'N/A';
      return {
        id: Number(history.id),
        waste_category: categoryName,
        wastesid: history.wastesid,
        waste_meterialid: history.waste_meterialid,
        meterial_name: materialName,
        name_waste: materialName,
        create_at: history.create_at,
        amount: history.amount,
        record_type: history.record_type,
        user_id: history.userid,
        user_name: history.user.firstName + ' ' + history.user.lastName,
        carbon_footprint : history.carbon_footprint,
      };
    });
  }
  async findHistoryDetailById(historyId: number) {
    const history = await this.wasteHistoryRepository.findOne({
      where: { id: historyId },
      relations: [
        'waste',
        'waste.wasteCategory',
        'waste.wasteSortings',
        'waste.materialGuides',
        'waste.materialGuides.wasteMaterial',
        'user',
      ],
    });

    if (!history) {
      throw new NotFoundException(`ไม่พบประวัติการทิ้งรหัส: ${historyId}`);
    }
    const waste = history.waste;

    if (!waste) {
      throw new NotFoundException(`ไม่พบข้อมูลขยะที่เชื่อมโยงกับประวัตินี้`);
    }

    return {
      id: waste.id,
      name: waste.name,
      waste_image: waste.waste_image,
      amount: history.amount,
      record_type: history.record_type,
      create_at: history.create_at,
      waste_categoriesid: waste.wasteCategory
        ? [
            {
              id: waste.wasteCategory.id,
              name: waste.wasteCategory.name,
            },
          ]
        : [],
      user_id: history.userid,
      waste_sorting:
        waste.wasteSortings?.map((sorting) => ({
          id: sorting.id,
          name: sorting.name,
          description: sorting.description,
        })) || [],
      material_guides:
        waste.materialGuides?.map((guide) => ({
          id: guide.id,
          guide_image: guide.guide_image,
          recommendation: guide.recommendation,
          waste_meterial_name: guide.wasteMaterial?.name || 'ไม่ระบุวัสดุ',
        })) || [],
    };
  }
}
