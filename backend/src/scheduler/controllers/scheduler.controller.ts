import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { CarbonFootprintSchedulerService } from '../services/carbon-footprint-scheduler.service';
import { CarbonFootprintCalculatorService } from '../services/carbon-footprint-calculator.service';
import { SchedulerSettingsService } from '../services/scheduler-settings.service';

@Controller('scheduler')
export class SchedulerController {
  constructor(
    private readonly carbonFootprintSchedulerService: CarbonFootprintSchedulerService,
    private readonly carbonFootprintCalculatorService: CarbonFootprintCalculatorService,
    private readonly schedulerSettingsService: SchedulerSettingsService,
  ) {}

  /**
   * Manually trigger carbon footprint calculation
   * POST /api/scheduler/trigger-carbon-footprint
   */
  @Post('trigger-carbon-footprint')
  @HttpCode(HttpStatus.OK)
  async triggerCarbonFootprintCalculation() {
    const result =
      await this.carbonFootprintSchedulerService.triggerManualCalculation();

    return {
      success: true,
      message: 'Carbon footprint calculation completed',
      data: result,
    };
  }

  /**
   * Get calculation statistics
   * GET /api/scheduler/carbon-footprint/stats
   */
  @Get('carbon-footprint/stats')
  async getCarbonFootprintStats() {
    const stats =
      await this.carbonFootprintSchedulerService.getCalculationStats();

    return {
      success: true,
      data: stats,
    };
  }

  /**
   * Get pending waste records (not yet calculated)
   * GET /api/scheduler/carbon-footprint/pending
   */
  @Get('carbon-footprint/pending')
  async getPendingWasteRecords(@Query('limit') limit?: string) {
    const records =
      await this.carbonFootprintSchedulerService.getPendingWasteRecords(
        limit ? parseInt(limit, 10) : 50,
      );

    return {
      success: true,
      data: records,
    };
  }

  // =============================================
  // Settings Endpoints
  // =============================================

  /**
   * Get all settings
   * GET /api/scheduler/settings
   */
  @Get('settings')
  async getAllSettings() {
    const settings = await this.schedulerSettingsService.getAllSettings();

    return {
      success: true,
      data: settings,
    };
  }

  /**
   * Update a single setting
   * PUT /api/scheduler/settings/:key
   * Body: { value: "new_value" }
   */
  @Put('settings/:key')
  async updateSetting(
    @Param('key') key: string,
    @Body() body: { value: string },
  ) {
    const setting = await this.schedulerSettingsService.updateSetting(
      key,
      body.value,
    );

    if (!setting) {
      return {
        success: false,
        error: `Setting '${key}' not found`,
      };
    }

    return {
      success: true,
      data: setting,
    };
  }

  /**
   * Update multiple settings at once
   * PUT /api/scheduler/settings
   * Body: { updates: [{ key: "cron_hour", value: "3" }, ...] }
   */
  @Put('settings')
  async updateSettings(
    @Body() body: { updates: Array<{ key: string; value: string }> },
  ) {
    await this.schedulerSettingsService.updateSettings(body.updates);

    const settings = await this.schedulerSettingsService.getAllSettings();

    return {
      success: true,
      message: 'Settings updated successfully',
      data: settings,
    };
  }

  // =============================================
  // Emission Factor Management
  // =============================================

  /**
   * Update emission factor for a waste material
   * PUT /api/scheduler/materials/:id/emission-factor
   * Body: { emissionFactor: 2.5, unit: "kg CO2e" }
   */
  @Put('materials/:id/emission-factor')
  async updateEmissionFactor(
    @Param('id') id: string,
    @Body() body: { emissionFactor: number; unit?: string },
  ) {
    const materialId = parseInt(id, 10);
    if (isNaN(materialId)) {
      return {
        success: false,
        error: 'Invalid material ID',
      };
    }

    const material = await this.schedulerSettingsService.updateEmissionFactor(
      materialId,
      body.emissionFactor,
      body.unit,
    );

    if (!material) {
      return {
        success: false,
        error: `Material with ID ${id} not found`,
      };
    }

    return {
      success: true,
      message: 'Emission factor updated successfully',
      data: material,
    };
  }

  // =============================================
  // Calculator Endpoints (สำหรับคำนวณเพื่อ display)
  // =============================================

  /**
   * คำนวณ Carbon Footprint แบบ simple (รับ amount และ emissionFactor โดยตรง)
   * GET /api/scheduler/calculate?amount=10&emissionFactor=2.5
   */
  @Get('calculate')
  calculateSimple(
    @Query('amount') amount: string,
    @Query('emissionFactor') emissionFactor: string,
  ) {
    const amountNum = parseFloat(amount);
    const emissionFactorNum = parseFloat(emissionFactor);

    if (isNaN(amountNum) || isNaN(emissionFactorNum)) {
      return {
        success: false,
        error: 'amount and emissionFactor must be valid numbers',
      };
    }

    const carbonFootprint = this.carbonFootprintCalculatorService.calculate(
      amountNum,
      emissionFactorNum,
    );

    return {
      success: true,
      data: {
        carbonFootprint,
        amount: amountNum,
        emissionFactor: emissionFactorNum,
        unit: 'kg CO2e',
      },
    };
  }

  /**
   * คำนวณ Carbon Footprint โดยใช้ waste material ID
   * POST /api/scheduler/calculate-by-material
   * Body: { amount: 10, wasteMaterialId: 1 }
   */
  @Post('calculate-by-material')
  @HttpCode(HttpStatus.OK)
  async calculateByMaterial(
    @Body() body: { amount: number; wasteMaterialId: number },
  ) {
    try {
      const result =
        await this.carbonFootprintCalculatorService.calculateByMaterialId(
          body.amount,
          body.wasteMaterialId,
        );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * คำนวณ Carbon Footprint สำหรับหลาย items
   * POST /api/scheduler/calculate-multiple
   * Body: { items: [{ amount: 10, wasteMaterialId: 1 }, ...] }
   */
  @Post('calculate-multiple')
  @HttpCode(HttpStatus.OK)
  async calculateMultiple(
    @Body() body: { items: Array<{ amount: number; wasteMaterialId: number }> },
  ) {
    try {
      const result =
        await this.carbonFootprintCalculatorService.calculateMultiple(
          body.items,
        );

      return {
        success: true,
        data: result,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * ดึงรายการ Waste Materials ทั้งหมด (สำหรับ dropdown)
   * GET /api/scheduler/materials
   */
  @Get('materials')
  async getAllMaterials() {
    const materials =
      await this.carbonFootprintCalculatorService.getAllMaterialsWithEmissionFactor();

    return {
      success: true,
      data: materials,
    };
  }

  // =============================================
  // Waste Management Methods Endpoints
  // =============================================

  /**
   * Get all waste management methods
   * GET /api/scheduler/management-methods
   */
  @Get('management-methods')
  async getAllManagementMethods() {
    const methods =
      await this.schedulerSettingsService.getAllWasteManagementMethods();
    return {
      success: true,
      data: methods,
    };
  }

  /**
   * Create a new waste management method
   * POST /api/scheduler/management-methods
   */
  @Post('management-methods')
  async createManagementMethod(
    @Body()
    body: {
      name: string;
      process_type?: number;
      transport_km?: number;
      transport_co2e_per_km?: number;
    },
  ) {
    if (!body.name) {
      return {
        success: false,
        error: 'Name is required',
      };
    }

    const method =
      await this.schedulerSettingsService.createWasteManagementMethod(body);
    return {
      success: true,
      message: 'Management method created successfully',
      data: method,
    };
  }

  /**
   * Update a waste management method
   * PUT /api/scheduler/management-methods/:id
   */
  @Put('management-methods/:id')
  async updateManagementMethod(
    @Param('id') id: string,
    @Body()
    body: {
      name?: string;
      process_type?: number;
      transport_km?: number;
      transport_co2e_per_km?: number;
    },
  ) {
    const methodId = parseInt(id, 10);
    if (isNaN(methodId)) {
      return {
        success: false,
        error: 'Invalid method ID',
      };
    }

    const method =
      await this.schedulerSettingsService.updateWasteManagementMethod(
        methodId,
        body,
      );
    if (!method) {
      return {
        success: false,
        error: `Management method with ID ${id} not found`,
      };
    }

    return {
      success: true,
      message: 'Management method updated successfully',
      data: method,
    };
  }

  /**
   * Delete a waste management method
   * DELETE /api/scheduler/management-methods/:id
   */
  @Delete('management-methods/:id')
  async deleteManagementMethod(@Param('id') id: string) {
    const methodId = parseInt(id, 10);
    if (isNaN(methodId)) {
      return {
        success: false,
        error: 'Invalid method ID',
      };
    }

    const deleted =
      await this.schedulerSettingsService.deleteWasteManagementMethod(methodId);
    if (!deleted) {
      return {
        success: false,
        error: `Management method with ID ${id} not found`,
      };
    }

    return {
      success: true,
      message: 'Management method deleted successfully',
    };
  }
}
