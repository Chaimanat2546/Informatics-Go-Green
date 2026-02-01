import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { WasteHistoryService } from '../services/waste-history.service';

@Controller('waste')
export class WasteHistoryController {
    constructor(private readonly wasteService: WasteHistoryService) { }

    @Get('history/all')
    async getAllHistory(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        return this.wasteService.getAllHistory(Number(page), Number(limit));
    }

    @Get('history/user/:userId')
    async getUserHistory(@Param('userId') userId: string) {
        return this.wasteService.getUserHistory(userId);
    }

    @Get('/history/detail/:id')
    async getWasteById(@Param('id', ParseIntPipe) id: number) {
        return this.wasteService.findHistoryDetailById(id);
    }

}