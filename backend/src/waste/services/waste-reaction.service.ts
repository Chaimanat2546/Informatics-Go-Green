import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  WasteReaction,
  WasteReactionType,
} from '../entities/waste-reaction.entity';
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
    const waste = await this.wasteRepository.findOne({
      where: { id: wasteId },
    });
    if (!waste) throw new NotFoundException(`ไม่พบขยะ ID: ${wasteId}`);

    const [likes, dislikes] = await Promise.all([
      this.reactionRepository.count({
        where: { wastesid: wasteId, reaction: WasteReactionType.LIKE },
      }),
      this.reactionRepository.count({
        where: { wastesid: wasteId, reaction: WasteReactionType.DISLIKE },
      }),
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

  async react(wasteId: number, userId: string, reaction: WasteReactionType) {
    const txResult = await this.reactionRepository.manager.transaction(
      async (manager) => {
        const reactionRepo = manager.getRepository(WasteReaction);
        const wasteRepo = manager.getRepository(Waste);
        const wasteSortingRepo = manager.getRepository(WasteSorting);
        const materialGuideRepo = manager.getRepository(MaterialGuide);
        const wasteHistoryRepo = manager.getRepository(WasteHistory);

        const waste = await wasteRepo.findOne({ where: { id: wasteId } });
        if (!waste) {
          throw new NotFoundException(`ไม่พบขยะ ID: ${wasteId}`);
        }

        const existing = await reactionRepo.findOne({
          where: { wastesid: wasteId, userid: userId },
        });

        if (existing) {
          if (existing.reaction === reaction) {
            // กดซ้ำ = ยกเลิก reaction
            await reactionRepo.remove(existing);
            return { deleted: false };
          }
          // เปลี่ยน reaction
          existing.reaction = reaction;
          await reactionRepo.save(existing);
        } else {
          // สร้างใหม่
          const newReaction = reactionRepo.create({
            wastesid: wasteId,
            userid: userId,
            reaction,
          });
          await reactionRepo.save(newReaction);
        }

        // ตรวจสอบ dislike ทุกกรณี (สร้างใหม่ หรือ เปลี่ยน reaction)
        if (reaction === WasteReactionType.DISLIKE) {
          const dislikeCount = await reactionRepo.count({
            where: { wastesid: wasteId, reaction: WasteReactionType.DISLIKE },
          });
          if (dislikeCount >= 50) {
            await reactionRepo.delete({ wastesid: wasteId });
            await wasteSortingRepo.delete({ wastesid: wasteId });
            await materialGuideRepo.delete({ wastesid: wasteId });
            await wasteHistoryRepo.delete({ wastesid: wasteId });
            await wasteRepo.delete(wasteId);
            return { deleted: true };
          }
        }

        return { deleted: false };
      },
    );

    if (txResult.deleted) {
      return { deleted: true };
    }

    return this.getReactions(wasteId, userId);
  }
}
