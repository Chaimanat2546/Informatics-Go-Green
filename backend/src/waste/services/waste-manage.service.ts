import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import {
  Waste,
  MaterialGuide,
  WasteCategory,
  WasteMaterial,
} from '../entities';
import { CreateWasteWithGuidesDto } from '../dto/create-waste-with-guides.dto';

@Injectable()
export class WasteManageService {
  constructor(
    @InjectRepository(Waste)
    private wasteRepository: Repository<Waste>,

    @InjectRepository(MaterialGuide)
    private materialGuideRepository: Repository<MaterialGuide>,

    @InjectRepository(WasteCategory)
    private wasteCategoryRepository: Repository<WasteCategory>,

    @InjectRepository(WasteMaterial)
    private wasteMaterialRepository: Repository<WasteMaterial>,

    private dataSource: DataSource,
  ) {}

  async createWasteWithGuides(dto: CreateWasteWithGuidesDto) {
    // Validate category exists
    const category = await this.wasteCategoryRepository.findOne({
      where: { id: dto.wasteCategoryId },
    });
    if (!category) {
      throw new NotFoundException(
        `ไม่พบหมวดหมู่ขยะ ID: ${dto.wasteCategoryId}`,
      );
    }

    // Validate all material IDs exist
    for (const guide of dto.materialGuides) {
      const material = await this.wasteMaterialRepository.findOne({
        where: { id: guide.waste_meterialid },
      });
      if (!material) {
        throw new NotFoundException(
          `ไม่พบประเภทวัสดุ ID: ${guide.waste_meterialid}`,
        );
      }
    }

    // Check duplicate barcode
    if (dto.barcode) {
      const existing = await this.wasteRepository.findOne({
        where: { barcode: dto.barcode },
      });
      if (existing) {
        throw new BadRequestException(
          `บาร์โค้ด ${dto.barcode} มีอยู่ในระบบแล้ว`,
        );
      }
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create the waste record
      const waste = Object.assign(new Waste(), {
        name: dto.name,
        wasteCategoryId: dto.wasteCategoryId,
        barcode: dto.barcode,
        waste_image: dto.waste_image,
        userid: dto.userid,
      });
      const savedWaste = await queryRunner.manager.save(Waste, waste);

      // 2. Create material guides linked to the new waste
      const guides = dto.materialGuides.map((g) =>
        Object.assign(new MaterialGuide(), {
          wastesid: Number(savedWaste.id),
          waste_meterialid: g.waste_meterialid,
          recommendation: g.recommendation,
          weight: g.weight,
          guide_image: g.guide_image,
        }),
      );
      await queryRunner.manager.save(MaterialGuide, guides);

      await queryRunner.commitTransaction();

      // Return full waste with guides
      return this.findWasteById(Number(savedWaste.id));
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async findWasteById(wasteId: number) {
    const waste = await this.wasteRepository.findOne({
      where: { id: wasteId },
      relations: [
        'wasteCategory',
        'materialGuides',
        'materialGuides.wasteMaterial',
      ],
    });

    if (!waste) {
      throw new NotFoundException(`ไม่พบขยะ ID: ${wasteId}`);
    }

    return {
      id: waste.id,
      name: waste.name,
      barcode: waste.barcode,
      waste_image: waste.waste_image,
      create_at: waste.create_at,
      category: waste.wasteCategory
        ? { id: waste.wasteCategory.id, name: waste.wasteCategory.name }
        : null,
      materialGuides:
        waste.materialGuides?.map((guide) => ({
          id: guide.id,
          guide_image: guide.guide_image,
          recommendation: guide.recommendation,
          weight: guide.weight,
          waste_meterial_name: guide.wasteMaterial?.name || null,
          waste_meterialid: guide.waste_meterialid,
        })) || [],
    };
  }
}
