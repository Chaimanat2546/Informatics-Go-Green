import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { WasteReactionService } from '../services/waste-reaction.service';
import { WasteReactionType } from '../entities/waste-reaction.entity';

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
    @Body('reaction', new ParseEnumPipe(WasteReactionType))
    reaction: WasteReactionType,
  ) {
    return this.wasteReactionService.react(wasteId, userId, reaction);
  }
}
