import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteReaction } from '../entities/waste-reaction.entity';
import { Waste } from '../entities/waste.entity';
import { WasteSorting } from '../entities/waste-sorting.entity';
import { MaterialGuide } from '../entities/material-guide.entity';
import { WasteHistory } from '../entities/waste-history.entity';

@Injectable()
export class WasteReactionService {
  constructor(
    @InjectRepository(WasteReaction)
    private reactionRepository: Repository<WasteReaction>,

    @InjectRepository(Waste)
    private wasteRepository: Repository<Waste>,

    @InjectRepository(WasteSorting)
    private wasteSortingRepository: Repository<WasteSorting>,

    @InjectRepository(MaterialGuide)
    private materialGuideRepository: Repository<MaterialGuide>,

    @InjectRepository(WasteHistory)
    private wasteHistoryRepository: Repository<WasteHistory>,
  ) {}

  async getReactions(wasteId: number, userId?: string) {
    const waste = await this.wasteRepository.findOne({ where: { id: wasteId } });
    if (!waste) throw new NotFoundException(`ไม่พบขยะ ID: ${wasteId}`);

    const [likes, dislikes] = await Promise.all([
      this.reactionRepository.count({ where: { wastesid: wasteId, reaction: 'like' } }),
      this.reactionRepository.count({ where: { wastesid: wasteId, reaction: 'dislike' } }),
    ]);

    let userReaction: string | null = null;
    if (userId) {
      const existing = await this.reactionRepository.findOne({
        where: { wastesid: wasteId, userid: userId },
      });
      userReaction = existing?.reaction ?? null;
    }

    return { likes, dislikes, userReaction };
  }

  async react(wasteId: number, userId: string, reaction: 'like' | 'dislike') {
    const waste = await this.wasteRepository.findOne({ where: { id: wasteId } });
    if (!waste) throw new NotFoundException(`ไม่พบขยะ ID: ${wasteId}`);

    const existing = await this.reactionRepository.findOne({
      where: { wastesid: wasteId, userid: userId },
    });

    if (existing) {
      if (existing.reaction === reaction) {
        // กดซ้ำ = ยกเลิก reaction
        await this.reactionRepository.remove(existing);
        return this.getReactions(wasteId, userId);
      }
      // เปลี่ยน reaction
      existing.reaction = reaction;
      await this.reactionRepository.save(existing);
    } else {
      // สร้างใหม่
      const newReaction = this.reactionRepository.create({
        wastesid: wasteId,
        userid: userId,
        reaction,
      });
      await this.reactionRepository.save(newReaction);
    }

    // ตรวจสอบ dislike ทุกกรณี (สร้างใหม่ หรือ เปลี่ยน reaction)
    if (reaction === 'dislike') {
      const dislikeCount = await this.reactionRepository.count({
        where: { wastesid: wasteId, reaction: 'dislike' },
      });
      if (dislikeCount >= 1 {
        await this.reactionRepository.delete({ wastesid: wasteId });
        await this.wasteSortingRepository.delete({ wastesid: wasteId });
        await this.materialGuideRepository.delete({ wastesid: wasteId });
        await this.wasteHistoryRepository.delete({ wastesid: wasteId });
        await this.wasteRepository.delete(wasteId);
        return { deleted: true };
      }
    }

    return this.getReactions(wasteId, userId);
  }
}
