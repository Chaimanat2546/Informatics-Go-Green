import { Body, Controller, Get, Param, ParseIntPipe, Post, Query } from '@nestjs/common';
import { WasteReactionService } from '../services/waste-reaction.service';

@Controller('waste')
export class WasteReactionController {
  constructor(private readonly wasteReactionService: WasteReactionService) {}

  @Get(':id/reaction')
  async getReactions(
    @Param('id', ParseIntPipe) wasteId: number,
    @Query('userId') userId?: string,
  ) {
    return this.wasteReactionService.getReactions(wasteId, userId);
  }

  @Post(':id/reaction')
  async react(
    @Param('id', ParseIntPipe) wasteId: number,
    @Body('userId') userId: string,
    @Body('reaction') reaction: 'like' | 'dislike',
  ) {
    return this.wasteReactionService.react(wasteId, userId, reaction);
  }
}
