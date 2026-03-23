import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WasteReactionService } from '../services/waste-reaction.service';
import { WasteReactionType } from '../entities/waste-reaction.entity';

@Controller('waste')
export class WasteReactionController {
  constructor(private readonly wasteReactionService: WasteReactionService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id/reaction')
  async getReactions(
    @Param('id', ParseIntPipe) wasteId: number,
    @Req() req: any,
  ) {
    const userId: string | undefined = req?.user?.id;
    return this.wasteReactionService.getReactions(wasteId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reaction')
  async react(
    @Param('id', ParseIntPipe) wasteId: number,
    @Req() req: any,
    @Body('reaction', new ParseEnumPipe(WasteReactionType))
    reaction: WasteReactionType,
  ) {
    const userId: string = req.user.id;
    return this.wasteReactionService.react(wasteId, userId, reaction);
  }
}
