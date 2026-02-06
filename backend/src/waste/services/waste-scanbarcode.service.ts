import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/users/user.entity';
import { Waste, WasteCategory, WasteHistory } from '../entities';
import { CreateWasteRecordDto } from '../dto/create-waste-record.dto';

@Injectable()
export class WasteScannerService {
  constructor(
    @InjectRepository(Waste)
    private wasteRepository: Repository<Waste>,

    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(WasteCategory)
    private wasteCategoryRepository: Repository<WasteCategory>,

    @InjectRepository(WasteHistory)
    private wasteHistoryRepository: Repository<WasteHistory>,
  ) {}

  async findByBarcode(barcode: number) {
    const waste = await this.wasteRepository.findOne({
      where: { barcode: barcode },
      relations: [
        'wasteCategory',
        'wasteSortings',
        'materialGuides',
        'materialGuides.wasteMaterial',
        'user',
      ],
    });

    if (!waste) {
      throw new NotFoundException(`ไม่พบสินค้าที่มีบาร์โค้ด: ${barcode}`);
    }

    return {
      id: waste.id,
      barcode: waste.barcode,
      name: waste.name,
      waste_image: waste.waste_image,
      amount: 1,
      create_at: waste.create_at,

      waste_categoriesid: waste.wasteCategory
        ? [
            {
              id: waste.wasteCategory.id,
              name: waste.wasteCategory.name,
            },
          ]
        : [],

      user_id: waste.userid,

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
          waste_meterial_name: guide.wasteMaterial.name,
        })) || [],
    };
  }

  async recordWaste(dto: CreateWasteRecordDto) {
    const user = await this.userRepository.findOne({
      where: { id: dto.userId },
    });
    if (!user) throw new NotFoundException('ไม่พบผู้ใช้งาน');

    const waste = await this.wasteRepository.findOne({
      where: { id: Number(dto.wasteId) },
      relations: ['materialGuides'],
    });
    if (!waste) throw new NotFoundException('ไม่พบข้อมูลขยะ');

    let finalAmount = 0;
    // let points = 0;

    if (dto.source === 'scan') {
      if (waste.materialGuides && waste.materialGuides.length > 0) {
        finalAmount = waste.materialGuides.reduce(
          (sum, guide) => sum + Number(guide.weight),
          0,
        );
      } else {
        finalAmount = 0.0; // ค่า Default หากไม่พบข้อมูลน้ำหนักใน Guide
      }
      // คำนวณแต้มสำหรับการสแกน
      // points = 5;
    } else {
      if (!dto.amount) throw new Error('กรุณาระบุน้ำหนัก (kg)');
      finalAmount = dto.amount;
    }
    const newHistory = this.wasteHistoryRepository.create({
      user: user,
      waste: waste,
      amount: finalAmount,
      record_type: dto.source,
      create_at: new Date(),
    });

    await this.wasteHistoryRepository.save(newHistory);
    return {
      message: 'บันทึกสำเร็จ',
      data: {
        type: dto.source,
        amount: finalAmount,
        // pointsEarned: points
      },
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
}
