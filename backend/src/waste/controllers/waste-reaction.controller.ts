import {
  Body,
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { WasteReactionService } from '../services/waste-reaction.service';
import { WasteReactionType } from '../entities/waste-reaction.entity';

interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
}

@Controller('waste')
export class WasteReactionController {
  constructor(private readonly wasteReactionService: WasteReactionService) {}

  @UseGuards(JwtAuthGuard)
  @Get(':id/reaction')
  async getReactions(
    @Param('id', ParseIntPipe) wasteId: number,
    @Query('userId') queryUserId?: string,
    @Req() req: AuthenticatedRequest,
  ) {
    // Use userId from JWT token if available, otherwise from query
    const userId = req.user?.id || queryUserId;
    return this.wasteReactionService.getReactions(wasteId, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/reaction')
  async react(
    @Param('id', ParseIntPipe) wasteId: number,
    @Body('userId') bodyUserId: string,
    @Body('reaction', new ParseEnumPipe(WasteReactionType))
    reaction: WasteReactionType,
    @Req() req: AuthenticatedRequest,
  ) {
    // Use userId from JWT token if available, otherwise from body
    const userId = req.user?.id || bodyUserId;
    return this.wasteReactionService.react(wasteId, userId, reaction);
  }
}
