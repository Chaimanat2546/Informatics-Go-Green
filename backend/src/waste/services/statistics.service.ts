import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WasteCalculateLog, WasteHistory } from '../entities';
import { getDateRange } from 'src/utils/date-helper';
import dayjs from 'dayjs';

interface WasteSixMonthRaw {
  year: string;
  month: string;
  categoryName: string;
  totalWeight: string | null;
}

interface MonthlyCarbonRaw {
  month: string;
  total_co2: string | null;
}
interface CarbonSummaryRaw {
  totalCarbon: string | null;
}
interface GraphItem {
  time_label: string;
  carbon_value?: string | number;
}

export interface WasteCategoryDistributionRaw {
  categoryName: string;
  totalWeight: string | null;
}
interface OverallSummaryRaw {
  totalWeight: string | null;
  totalCarbon: string | null;
}
@Injectable()
export class StatisticsService {
  constructor(
    @InjectRepository(WasteCalculateLog)
    private logRepository: Repository<WasteCalculateLog>,
    @InjectRepository(WasteHistory)
    private historyRepository: Repository<WasteHistory>,
  ) {}

  private generateEmptyGraph(
    type: 'daily' | 'monthly' | 'yearly',
    dateStr: string,
  ) {
    const date = dayjs(dateStr);
    const result: { time_label: string; carbon_value: number }[] = [];

    if (type === 'daily') {
      for (let i = 0; i <= 23; i++) {
        const hour = i.toString().padStart(2, '0');
        result.push({ time_label: `${hour}:00`, carbon_value: 0 });
      }
    } else if (type === 'monthly') {
      const daysInMonth = date.daysInMonth();
      for (let i = 1; i <= daysInMonth; i++) {
        const day = i.toString().padStart(2, '0');
        result.push({ time_label: day, carbon_value: 0 });
      }
    } else if (type === 'yearly') {
      const months = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];
      for (const month of months) {
        result.push({ time_label: month, carbon_value: 0 });
      }
    }

    return result;
  }

  private fillMissingData(emptyGraph: GraphItem[], rawDbData: GraphItem[]) {
    return emptyGraph.map((emptyItem) => {
      const foundDbItem = rawDbData.find((dbItem) => {
        const dbLabel = dbItem.time_label
          ? String(dbItem.time_label).trim()
          : '';
        return dbLabel === emptyItem.time_label;
      });

      return {
        time_label: emptyItem.time_label,
        carbon_value:
          foundDbItem && foundDbItem.carbon_value
            ? parseFloat(String(foundDbItem.carbon_value)) || 0
            : 0,
      };
    });
  }

  async getCarbonStats(type: 'daily' | 'monthly' | 'yearly', dateStr: string) {
    const { start, end, groupBy } = getDateRange(type, dateStr);

    // ✅ Casting ตรงนี้ให้ชัดเจน
    const summary = await this.logRepository
      .createQueryBuilder('log')
      .select('SUM(log.total_carbon_footprint)', 'totalCarbon')
      .where('log.create_at BETWEEN :start AND :end', { start, end })
      .getRawOne<CarbonSummaryRaw>();

    const totalCarbon = parseFloat(summary?.totalCarbon || '0') || 0;
    const treeEquivalent = totalCarbon / 9;

    // ✅ Casting Array ตรงนี้ให้ชัดเจน
    const rawGraphData = await this.logRepository
      .createQueryBuilder('log')
      .select(groupBy, 'time_label')
      .addSelect('SUM(log.total_carbon_footprint)', 'carbon_value')
      .where('log.create_at BETWEEN :start AND :end', { start, end })
      .groupBy('time_label')
      .orderBy('time_label', 'ASC')
      .getRawMany<GraphItem>();

    const emptyGraph = this.generateEmptyGraph(type, dateStr);
    const fullGraphData = this.fillMissingData(emptyGraph, rawGraphData);

    return {
      summary: {
        totalCarbon: totalCarbon.toFixed(2),
        treesSaved: Math.ceil(treeEquivalent),
      },
      graph: fullGraphData,
    };
  }

  async getWasteCategoryDistribution(
    type: 'daily' | 'monthly' | 'yearly',
    dateStr: string,
  ) {
    const { start, end } = getDateRange(type, dateStr);

    // ✅ Casting Array ตรงนี้ให้ชัดเจน เพื่อไม่ให้ return เป็น any[]
    const result = await this.historyRepository
      .createQueryBuilder('history')
      .leftJoin('history.waste', 'waste')
      .leftJoin('waste.wasteCategory', 'categoryFromWaste')
      .leftJoin('history.wasteMaterial', 'material')
      .leftJoin('material.wasteCategory', 'categoryFromMaterial')
      .select(
        "COALESCE(categoryFromWaste.name, categoryFromMaterial.name, 'อื่นๆ')",
        'categoryName',
      )
      .addSelect('SUM(history.amount)', 'totalWeight')
      .where('history.create_at BETWEEN :start AND :end', { start, end })
      .groupBy(
        "COALESCE(categoryFromWaste.name, categoryFromMaterial.name, 'อื่นๆ')",
      )
      .getRawMany<WasteCategoryDistributionRaw>();

    return result;
  }

  async getOverallSummary(
    type: 'daily' | 'monthly' | 'yearly',
    dateStr: string,
    userId?: string,
  ) {
    const { start, end } = getDateRange(type, dateStr);
    let query = this.historyRepository
      .createQueryBuilder('history')
      .select('SUM(history.amount)', 'totalWeight')
      .addSelect('SUM(history.carbon_footprint)', 'totalCarbon')
      .where('history.create_at BETWEEN :start AND :end', { start, end });

    if (userId) {
      query = query.andWhere('history.userid = :userId', { userId });
    }

    // ✅ Casting ตรงนี้ให้ชัดเจน
    const result = await query.getRawOne<OverallSummaryRaw>();

    return {
      totalWeight: parseFloat(
        parseFloat(result?.totalWeight || '0').toFixed(0),
      ),
      totalCarbon: parseFloat(
        parseFloat(result?.totalCarbon || '0').toFixed(0),
      ),
    };
  }

  async getCardsSummary(
    type: 'daily' | 'monthly' | 'yearly',
    dateStr: string,
    userId?: string,
  ) {
    const currentRange = getDateRange(type, dateStr);
    const previousRange = this.getPreviousDateRange(
      type,
      currentRange.start,
      currentRange.end,
    );
    const currentData = await this.fetchSummaryData(
      currentRange.start,
      currentRange.end,
      userId,
    );
    const previousData = await this.fetchSummaryData(
      previousRange.start,
      previousRange.end,
      userId,
    );
    const COST_PER_KG = 8;
    const KG_CO2_PER_TREE = 9;
    const currentCost = currentData.totalWeight * COST_PER_KG;
    const currentTrees = currentData.totalCarbon / KG_CO2_PER_TREE;
    const prevCost = previousData.totalWeight * COST_PER_KG;
    const prevTrees = previousData.totalCarbon / KG_CO2_PER_TREE;

    return [
      {
        id: 'weight',
        title: 'จำนวนขยะทั้งหมดที่คัดแยก',
        value: currentData.totalWeight.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        unit: 'กิโลกรัม',
        desc: this.calculatePercentageText(
          currentData.totalWeight,
          previousData.totalWeight,
          type,
        ),
      },
      {
        id: 'carbon',
        title: 'ลดการปล่อยก๊าซ CO2 ได้',
        value: currentData.totalCarbon.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }),
        unit: 'kgCO2e',
        desc: this.calculatePercentageText(
          currentData.totalCarbon,
          previousData.totalCarbon,
          type,
        ),
      },
      {
        id: 'cost',
        title: 'ประหยัดค่าใช้จ่ายไปได้',
        value: currentCost.toLocaleString('en-US', {
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }),
        unit: 'บาท',
        desc: this.calculatePercentageText(currentCost, prevCost, type),
      },
      {
        id: 'trees',
        title: 'เทียบเท่าการปลูกต้นไม้',
        value: Math.floor(currentTrees).toLocaleString('en-US'),
        unit: 'ต้น',
        desc: this.calculatePercentageText(currentTrees, prevTrees, type),
      },
    ];
  }

  private async fetchSummaryData(start: Date, end: Date, userId?: string) {
    let query = this.historyRepository
      .createQueryBuilder('history')
      .select('SUM(history.amount)', 'totalWeight')
      .addSelect('SUM(history.carbon_footprint)', 'totalCarbon')
      .where('history.create_at BETWEEN :start AND :end', { start, end });

    if (userId) {
      query = query.andWhere('history.userid = :userId', { userId });
    }

    // ✅ Casting ตรงนี้ให้ชัดเจน
    const result = await query.getRawOne<OverallSummaryRaw>();

    return {
      totalWeight: parseFloat(result?.totalWeight || '0'),
      totalCarbon: parseFloat(result?.totalCarbon || '0'),
    };
  }

  private calculatePercentageText(
    current: number,
    previous: number,
    type: string,
  ): string {
    const timeText =
      type === 'daily'
        ? 'เมื่อวาน'
        : type === 'monthly'
          ? 'เดือนที่ผ่านมา'
          : 'ปีที่ผ่านมา';

    if (previous === 0) {
      return current > 0
        ? `เพิ่มขึ้น 100% จาก${timeText}`
        : `ไม่มีการเปลี่ยนแปลงจาก${timeText}`;
    }

    const diff = ((current - previous) / previous) * 100;
    const isIncrease = diff >= 0;
    const absDiff = Math.abs(diff).toFixed(1);

    return `${isIncrease ? 'เพิ่มขึ้น' : 'ลดลง'} ${absDiff}% จาก${timeText}`;
  }

  private getPreviousDateRange(
    type: string,
    currentStart: Date,
    currentEnd: Date,
  ) {
    const start = new Date(currentStart);
    const end = new Date(currentEnd);

    if (type === 'daily') {
      start.setDate(start.getDate() - 1);
      end.setDate(end.getDate() - 1);
    } else if (type === 'monthly') {
      start.setMonth(start.getMonth() - 1);
      end.setMonth(end.getMonth() - 1);
    } else if (type === 'yearly') {
      start.setFullYear(start.getFullYear() - 1);
      end.setFullYear(end.getFullYear() - 1);
    }

    return { start, end };
  }

  async getMonthlyCarbonFootprint(year: number, userId?: string) {
    let query = this.historyRepository.createQueryBuilder('history');
    query = query
      .select('EXTRACT(MONTH FROM history.create_at)', 'month')
      .addSelect('SUM(history.carbon_footprint)', 'total_co2')
      .where('EXTRACT(YEAR FROM history.create_at) = :year', { year })
      .groupBy('EXTRACT(MONTH FROM history.create_at)');

    if (userId) {
      query = query.andWhere('history.userid = :userId', { userId });
    }

    // ✅ Casting Array ตรงนี้ให้ชัดเจน
    const result = await query.getRawMany<MonthlyCarbonRaw>();

    const monthsTemplate = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];
    const monthlyData = monthsTemplate.map((month) => ({
      month: month,
      co2: 0,
    }));

    result.forEach((row) => {
      const monthIndex = parseInt(row.month, 10) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        monthlyData[monthIndex].co2 = parseFloat(
          parseFloat(row.total_co2 || '0').toFixed(2),
        );
      }
    });

    return monthlyData;
  }

  async getWasteWeightByCategorySixMonths(userId?: string) {
    const currentDate = new Date();
    const sixMonthsAgo = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 5,
      1,
    );

    let query = this.historyRepository
      .createQueryBuilder('history')
      .leftJoin('history.wasteMaterial', 'material')
      .leftJoin('material.wasteCategory', 'matCategory')
      .leftJoin('history.waste', 'waste')
      .leftJoin('waste.wasteCategory', 'wasteCategory')
      .select('EXTRACT(MONTH FROM history.create_at)', 'month')
      .addSelect('EXTRACT(YEAR FROM history.create_at)', 'year')
      .addSelect(
        "COALESCE(matCategory.name, wasteCategory.name, 'อื่นๆ')",
        'categoryName',
      )
      .addSelect('SUM(history.amount)', 'totalWeight')
      .where('history.create_at >= :sixMonthsAgo', { sixMonthsAgo })
      .groupBy('"year"')
      .addGroupBy('"month"')
      .addGroupBy('"categoryName"')
      .orderBy('"year"', 'ASC')
      .addOrderBy('"month"', 'ASC');

    if (userId) {
      query = query.andWhere('history.userid = :userId', { userId });
    }

    // ✅ Casting Array ตรงนี้ให้ชัดเจน
    const rawData = await query.getRawMany<WasteSixMonthRaw>();

    const monthNames = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ];

    const result: Array<{
      year: number;
      monthIndex: number;
      month: string;
      plastic: number;
      paper: number;
      glass: number;
      metal: number;
      steel: number;
      other: number;
    }> = [];

    for (let i = 5; i >= 0; i--) {
      const d = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - i,
        1,
      );
      result.push({
        year: d.getFullYear(),
        monthIndex: d.getMonth() + 1,
        month: monthNames[d.getMonth()],
        plastic: 0,
        paper: 0,
        glass: 0,
        metal: 0,
        steel: 0,
        other: 0,
      });
    }

    rawData.forEach((row) => {
      const dataRow = result.find(
        (r) =>
          r.year === Number(row.year) && r.monthIndex === Number(row.month),
      );

      if (dataRow) {
        const weight = parseFloat(row.totalWeight || '0');
        const category = String(row.categoryName);

        if (category.includes('พลาสติก')) dataRow.plastic += weight;
        else if (category.includes('กระดาษ')) dataRow.paper += weight;
        else if (category.includes('แก้ว')) dataRow.glass += weight;
        else if (category.includes('โลหะ')) dataRow.metal += weight;
        else if (category.includes('เหล็ก')) dataRow.steel += weight;
        else dataRow.other += weight;
      }
    });

    return result.map((item) => ({
      month: item.month,
      plastic: item.plastic,
      paper: item.paper,
      glass: item.glass,
      metal: item.metal,
      steel: item.steel,
      other: item.other,
    }));
  }
}
