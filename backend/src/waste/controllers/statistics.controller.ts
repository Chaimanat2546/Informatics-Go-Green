import { Controller, Get, Query } from '@nestjs/common';
import { StatisticsService } from '../services/statistics.service';

@Controller('waste')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('dashboard-stats')
  async getStats(
    @Query('type') type: 'daily' | 'monthly' | 'yearly',
    @Query('date') date: string,
  ) {
    const carbonStats = await this.statisticsService.getCarbonStats(type, date);
    const wasteStats =
      await this.statisticsService.getWasteCategoryDistribution(type, date);

    return {
      carbonCredit: carbonStats.summary.totalCarbon,
      treesSaved: carbonStats.summary.treesSaved,
      carbonGraph: carbonStats.graph,
      wastePieChart: wasteStats,
    };
  }
  @Get('overall-summary')
  async getOverallSummary(
    @Query('type') type: 'daily' | 'monthly' | 'yearly',
    @Query('date') date: string,
    @Query('userId') userid?: string,
  ) {
    return await this.statisticsService.getOverallSummary(type, date, userid);
  }

  @Get('cards-summary')
  async getCardsSummary(
    @Query('type') type: 'daily' | 'monthly' | 'yearly',
    @Query('date') date: string,
    @Query('userId') userid?: string,
  ) {
    return await this.statisticsService.getCardsSummary(type, date, userid);
  }

  @Get('monthly-co2')
  async getMonthlyCarbonFootprint(
    @Query('year') yearStr?: string,
    @Query('userId') userId?: string,
  ) {
    const year = yearStr ? parseInt(yearStr, 10) : new Date().getFullYear();
    return await this.statisticsService.getMonthlyCarbonFootprint(year, userId);
  }

  @Get('waste-weight-categories')
  async getSixMonthsCategories(@Query('userId') userId?: string) {
    return await this.statisticsService.getWasteWeightByCategorySixMonths(
      userId,
    );
  }
}
