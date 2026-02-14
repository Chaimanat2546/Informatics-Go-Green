import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { WasteHistory } from '../../waste/entities/waste-history.entity';
import { SchedulerLock } from '../entities/scheduler-lock.entity';
import { SchedulerSettingsService } from './scheduler-settings.service';
import { CarbonFootprintCalculator } from '../../services/carbonCalculator';

export enum CalculationStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  CALCULATED = 'calculated',
  FAILED = 'failed',
  ERROR = 'error',
}

const LOCK_NAME = 'carbon_footprint_calculation';
const BATCH_SIZE = 100;
const MAX_RETRY_COUNT = 3;
const LOCK_TIMEOUT_MINUTES = 30;

@Injectable()
export class CarbonFootprintSchedulerService {
  private readonly logger = new Logger(CarbonFootprintSchedulerService.name);
  private readonly instanceId: string;

  constructor(
    @InjectRepository(WasteHistory)
    private readonly wasteHistoryRepository: Repository<WasteHistory>,
    @InjectRepository(SchedulerLock)
    private readonly schedulerLockRepository: Repository<SchedulerLock>,
    private readonly schedulerSettingsService: SchedulerSettingsService,
    private readonly entityManager: EntityManager,
  ) {
    this.instanceId = `instance_${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }

  /**
   * Main Cron Job - Runs daily at 02:00 AM
   */
  @Cron('0 2 * * *')
  async handleDailyCarbonFootprintCalculation(): Promise<void> {
    this.logger.log('Starting daily carbon footprint calculation...');

    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      this.logger.warn(
        'Could not acquire lock. Another instance might be processing.',
      );
      return;
    }

    try {
      await this.processAllPendingRecords();
      this.logger.log(
        'Daily carbon footprint calculation completed successfully.',
      );
    } catch (error) {
      this.logger.error('Error during carbon footprint calculation:', error);
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Manual trigger endpoint for testing
   */
  async triggerManualCalculation(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    this.logger.log('Manual carbon footprint calculation triggered...');

    const lockAcquired = await this.acquireLock();
    if (!lockAcquired) {
      throw new Error('Could not acquire lock. Another process is running.');
    }

    try {
      const result = await this.processAllPendingRecords();
      return result;
    } finally {
      await this.releaseLock();
    }
  }

  /**
   * Process all pending records in batches
   */
  private async processAllPendingRecords(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    let totalProcessed = 0;
    let totalSuccess = 0;
    let totalFailed = 0;
    let hasMore = true;

    while (hasMore) {
      const result = await this.processBatch();
      totalProcessed += result.processed;
      totalSuccess += result.success;
      totalFailed += result.failed;
      hasMore = result.processed === BATCH_SIZE;
    }

    this.logger.log(
      `Calculation complete. Processed: ${totalProcessed}, Success: ${totalSuccess}, Failed: ${totalFailed}`,
    );

    return {
      processed: totalProcessed,
      success: totalSuccess,
      failed: totalFailed,
    };
  }

  /**
   * Process a single batch of records
   */
  private async processBatch(): Promise<{
    processed: number;
    success: number;
    failed: number;
  }> {
    // Find pending records that haven't exceeded retry limit
    const pendingRecords = await this.wasteHistoryRepository.find({
      where: [
        { calculation_status: CalculationStatus.PENDING },
        { calculation_status: CalculationStatus.FAILED },
      ],
      relations: ['wasteMaterial'],
      take: BATCH_SIZE,
    });

    // Filter out records that have exceeded retry limit
    const recordsToProcess = pendingRecords.filter(
      (record) =>
        (record.calculation_status as CalculationStatus) ===
          CalculationStatus.PENDING ||
        ((record.calculation_status as CalculationStatus) ===
          CalculationStatus.FAILED &&
          (record.retry_count || 0) < MAX_RETRY_COUNT),
    );

    let success = 0;
    let failed = 0;

    for (const record of recordsToProcess) {
      // Mark as processing
      record.calculation_status = CalculationStatus.PROCESSING;
      record.last_calculation_attempt = new Date();
      await this.wasteHistoryRepository.save(record);

      try {
        const carbonFootprint = await this.calculateCarbonFootprint(record);

        // Update record with calculated value
        record.carbon_footprint = carbonFootprint;
        record.calculation_status = CalculationStatus.CALCULATED;
        record.error_message = undefined as unknown as string;
        await this.wasteHistoryRepository.save(record);

        success++;
        this.logger.debug(
          `Calculated carbon footprint for record ${record.id}: ${carbonFootprint}`,
        );
      } catch (error) {
        const retryCount = (record.retry_count || 0) + 1;
        record.retry_count = retryCount;
        record.error_message =
          error instanceof Error ? error.message : 'Unknown error';

        if (retryCount >= MAX_RETRY_COUNT) {
          record.calculation_status = CalculationStatus.ERROR;
          this.logger.error(
            `Record ${record.id} exceeded max retry count. Marking as error.`,
          );
          // TODO: Send alert to admin here
        } else {
          record.calculation_status = CalculationStatus.FAILED;
          this.logger.warn(
            `Record ${record.id} failed. Retry count: ${retryCount}/${MAX_RETRY_COUNT}`,
          );
        }

        await this.wasteHistoryRepository.save(record);
        failed++;
      }
    }

    return {
      processed: recordsToProcess.length,
      success,
      failed,
    };
  }

  /**
   * Calculate carbon footprint using the new CarbonFootprintCalculator
   * Uses waste_id (wastesid) to find MaterialGuide records and calculate total carbon
   * Falls back to wasteHistory.amount × wasteMaterial.emission_factor if no MaterialGuide found
   * Formula: totalCarbon = Σ (materialWeight × materialEmissionFactor) OR amount × emission_factor
   */
  private async calculateCarbonFootprint(
    wasteHistory: WasteHistory,
  ): Promise<number> {
    const calculator = new CarbonFootprintCalculator(
      this.entityManager,
      1000,
      this.logger,
    );

    // Use waste_id (wastesid) to calculate through material_guides
    // Pass wasteHistory for fallback if no MaterialGuide exists (manual entry)
    const totalCarbon = await calculator.calculateByWasteId(
      wasteHistory.wastesid ?? 0,
      wasteHistory,
    );

    return totalCarbon;
  }

  /**
   * Acquire a lock to prevent concurrent processing
   */
  private async acquireLock(): Promise<boolean> {
    try {
      let lock = await this.schedulerLockRepository.findOne({
        where: { name: LOCK_NAME },
      });

      // Create lock record if it doesn't exist
      if (!lock) {
        lock = this.schedulerLockRepository.create({
          name: LOCK_NAME,
          is_locked: false,
        });
        await this.schedulerLockRepository.save(lock);
      }

      // Check if lock is stale (locked for too long)
      if (lock.is_locked && lock.locked_at) {
        const lockAge = Date.now() - lock.locked_at.getTime();
        const maxLockAge = LOCK_TIMEOUT_MINUTES * 60 * 1000;

        if (lockAge > maxLockAge) {
          this.logger.warn('Lock is stale. Releasing and reacquiring...');
        } else {
          return false;
        }
      }

      // Try to acquire lock
      lock.is_locked = true;
      lock.locked_at = new Date();
      lock.locked_by = this.instanceId;
      await this.schedulerLockRepository.save(lock);

      // Double-check that we got the lock
      const updatedLock = await this.schedulerLockRepository.findOne({
        where: { name: LOCK_NAME },
      });

      return updatedLock?.locked_by === this.instanceId;
    } catch (error) {
      this.logger.error('Error acquiring lock:', error);
      return false;
    }
  }

  /**
   * Release the lock
   */
  private async releaseLock(): Promise<void> {
    try {
      const lock = await this.schedulerLockRepository.findOne({
        where: { name: LOCK_NAME },
      });

      if (lock && lock.locked_by === this.instanceId) {
        lock.is_locked = false;
        lock.locked_at = undefined as unknown as Date;
        lock.locked_by = undefined as unknown as string;
        await this.schedulerLockRepository.save(lock);
        this.logger.debug('Lock released successfully.');
      }
    } catch (error) {
      this.logger.error('Error releasing lock:', error);
    }
  }

  /**
   * Get calculation statistics
   */
  async getCalculationStats(): Promise<{
    pending: number;
    calculated: number;
    failed: number;
    error: number;
  }> {
    const [pending, calculated, failed, error] = await Promise.all([
      this.wasteHistoryRepository.count({
        where: { calculation_status: CalculationStatus.PENDING },
      }),
      this.wasteHistoryRepository.count({
        where: { calculation_status: CalculationStatus.CALCULATED },
      }),
      this.wasteHistoryRepository.count({
        where: { calculation_status: CalculationStatus.FAILED },
      }),
      this.wasteHistoryRepository.count({
        where: { calculation_status: CalculationStatus.ERROR },
      }),
    ]);

    return { pending, calculated, failed, error };
  }

  /**
   * Get pending waste records for display in admin panel
   */
  async getPendingWasteRecords(limit: number = 50): Promise<
    Array<{
      id: number;
      amount: number;
      materialName: string;
      status: string;
      created_at: string;
      retryCount: number;
    }>
  > {
    const records = await this.wasteHistoryRepository.find({
      where: [
        { calculation_status: CalculationStatus.PENDING },
        { calculation_status: CalculationStatus.FAILED },
      ],
      relations: ['wasteMaterial', 'waste'],
      order: { create_at: 'DESC' },
      take: limit,
    });

    return records.map((record) => ({
      id: record.id,
      amount: record.amount || 0,
      materialName:
        record.wasteMaterial?.name || record.waste?.name || 'Unknown',
      status: record.calculation_status || 'pending',
      created_at: record.create_at?.toISOString() || '',
      retryCount: record.retry_count || 0,
    }));
  }
}
