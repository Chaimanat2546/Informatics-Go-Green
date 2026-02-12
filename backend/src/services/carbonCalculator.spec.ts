import { Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import {
  CarbonFootprintCalculator,
  calculateDailyCarbonFootprint,
  TrashItem,
} from './carbonCalculator';
import { WasteMaterial } from '../waste/entities/waste-material.entity';
import { WasteSorting } from '../waste/entities/waste-sorting.entity';
import { MaterialGuide } from '../waste/entities/material-guide.entity';
import { WasteHistory } from '../waste/entities/waste-history.entity';

// Interface to access private methods for testing
interface CalculatorWithPrivate {
  getEmissionFactor(material: string | number): number;
}

describe('CarbonFootprintCalculator', () => {
  let calculator: CarbonFootprintCalculator;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockLogger: jest.Mocked<Logger>;

  // Mock data for the lookup chain:
  // WasteSorting.name -> MaterialGuide.wastesid -> MaterialGuide.waste_meterialid -> WasteMaterial.emission_factor
  const mockWasteSortings: WasteSorting[] = [
    { id: 1, name: 'พลาสติก' } as WasteSorting, // Plastic
    { id: 2, name: 'กระดาษ' } as WasteSorting, // Paper
    { id: 3, name: 'แก้ว' } as WasteSorting, // Glass
    { id: 4, name: 'โลหะ' } as WasteSorting, // Metal
    { id: 5, name: 'อิเล็กทรอนิกส์' } as WasteSorting, // Electronics
  ];

  const mockMaterialGuides: MaterialGuide[] = [
    { id: 1, wastesid: 1, waste_meterialid: 1 } as MaterialGuide, // พลาสติก -> material 1
    { id: 2, wastesid: 2, waste_meterialid: 2 } as MaterialGuide, // กระดาษ -> material 2
    { id: 3, wastesid: 3, waste_meterialid: 3 } as MaterialGuide, // แก้ว -> material 3
    { id: 4, wastesid: 4, waste_meterialid: 4 } as MaterialGuide, // โลหะ -> material 4
    { id: 5, wastesid: 5, waste_meterialid: 5 } as MaterialGuide, // อิเล็กทรอนิกส์ -> material 5
  ];

  const mockWasteMaterials: WasteMaterial[] = [
    {
      id: 1,
      name: 'พลาสติก', // Plastic in Thai
      emission_factor: 2.5,
      unit: 'kg',
    } as WasteMaterial,
    {
      id: 2,
      name: 'กระดาษ', // Paper in Thai
      emission_factor: 1.2,
      unit: 'kg',
    } as WasteMaterial,
    {
      id: 3,
      name: 'แก้ว', // Glass in Thai
      emission_factor: 0.8,
      unit: 'kg',
    } as WasteMaterial,
    {
      id: 4,
      name: 'โลหะ', // Metal in Thai
      emission_factor: 3.0,
      unit: 'kg',
    } as WasteMaterial,
    {
      id: 5,
      name: 'อิเล็กทรอนิกส์', // Electronics in Thai
      emission_factor: 5.0,
      unit: 'kg',
    } as WasteMaterial,
  ];

  beforeEach(() => {
    mockEntityManager = {
      find: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    // Setup mock for find to return appropriate entities based on the entity class
    mockEntityManager.find.mockImplementation((entityClass: unknown) => {
      if (entityClass === WasteSorting) {
        return Promise.resolve(mockWasteSortings);
      }
      if (entityClass === MaterialGuide) {
        return Promise.resolve(mockMaterialGuides);
      }
      if (entityClass === WasteMaterial) {
        return Promise.resolve(mockWasteMaterials);
      }
      return Promise.resolve([]);
    });

    calculator = new CarbonFootprintCalculator(
      mockEntityManager,
      1000,
      mockLogger,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('loadEmissionFactors', () => {
    it('should load emission factors from database using material_guides lookup', async () => {
      await calculator.loadEmissionFactors();

      // Should call find for all three entities
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEntityManager.find).toHaveBeenCalledWith(WasteSorting);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEntityManager.find).toHaveBeenCalledWith(MaterialGuide);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockEntityManager.find).toHaveBeenCalledWith(WasteMaterial);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining('Loading emission factors'),
      );
    });

    it('should handle database errors', async () => {
      mockEntityManager.find.mockRejectedValue(new Error('DB Error'));

      await expect(calculator.loadEmissionFactors()).rejects.toThrow(
        'DB Error',
      );
    });
  });

  describe('calculate - Single Type', () => {
    beforeEach(async () => {
      await calculator.loadEmissionFactors();
    });

    it('should calculate carbon footprint for single type trash', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10, // 10 kg
        type: 'plastic',
        emission_factor: 2.5,
      };

      const result = calculator.calculate(trash);

      expect(result.carbon_footprint).toBeCloseTo(25, 1); // 10 * 2.5
      expect(result.method).toBe('single_type');
      expect(result.breakdown['plastic']).toBeDefined();
      expect(result.breakdown['plastic'].weightKg).toBe(10);
      expect(result.breakdown['plastic'].weightGrams).toBe(10000);
    });

    it('should accept weight in kg (not grams)', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 0.5, // 0.5 kg = 500g
        type: 'plastic',
        emission_factor: 2.0,
      };

      const result = calculator.calculate(trash);

      // Should calculate as 0.5 kg * 2.0 = 1.0 kg CO2e (not 0.001 kg)
      expect(result.breakdown['plastic'].weightKg).toBe(0.5);
      expect(result.breakdown['plastic'].weightGrams).toBe(500);
    });

    it('should throw error for invalid weight', () => {
      const trash: TrashItem = {
        id: 1,
        weight: -5,
        type: 'plastic',
        emission_factor: 2.5,
      };

      expect(() => calculator.calculate(trash)).toThrow('Invalid weight: -5');
    });

    it('should throw error for NaN weight', () => {
      const trash: TrashItem = {
        id: 1,
        weight: NaN,
        type: 'plastic',
        emission_factor: 2.5,
      };

      expect(() => calculator.calculate(trash)).toThrow('Invalid weight: NaN');
    });

    it('should throw error for Infinity weight', () => {
      const trash: TrashItem = {
        id: 1,
        weight: Infinity,
        type: 'plastic',
        emission_factor: 2.5,
      };

      expect(() => calculator.calculate(trash)).toThrow(
        'Invalid weight: Infinity',
      );
    });

    it('should throw error for invalid emission_factor', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        type: 'plastic',
        emission_factor: NaN,
      };

      expect(() => calculator.calculate(trash)).toThrow(
        'Invalid emission_factor: NaN',
      );
    });
  });

  describe('calculate - Waste Sorting (Object Format)', () => {
    beforeEach(async () => {
      await calculator.loadEmissionFactors();
    });

    it('should calculate carbon footprint from waste_sorting object', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10, // 10 kg total
        waste_sorting: {
          พลาสติก: 0.5, // 5 kg plastic
          กระดาษ: 0.3, // 3 kg paper
          แก้ว: 0.2, // 2 kg glass
        },
      };

      const result = calculator.calculate(trash);

      expect(result.method).toBe('waste_sorting');
      // (5*2.5) + (3*1.2) + (2*0.8) = 12.5 + 3.6 + 1.6 = 17.7
      expect(result.carbon_footprint).toBeCloseTo(17.7, 1);
      expect(Object.keys(result.breakdown)).toHaveLength(3);
    });

    it('should handle mixed-material inputs', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 100, // 100 kg
        waste_sorting: {
          พลาสติก: 0.4, // 40 kg
          โลหะ: 0.3, // 30 kg
          อิเล็กทรอนิกส์: 0.2, // 20 kg
          กระดาษ: 0.1, // 10 kg
        },
      };

      const result = calculator.calculate(trash);

      // (40*2.5) + (30*3.0) + (20*5.0) + (10*1.2) = 100 + 90 + 100 + 12 = 302
      expect(result.carbon_footprint).toBeCloseTo(302, 1);
    });

    it('should throw error for invalid ratio (NaN)', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          พลาสติก: NaN,
        },
      };

      expect(() => calculator.calculate(trash)).toThrow('Invalid ratio: NaN');
    });

    it('should throw error for invalid ratio (Infinity)', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          พลาสติก: Infinity,
        },
      };

      expect(() => calculator.calculate(trash)).toThrow(
        'Invalid ratio: Infinity',
      );
    });

    it('should throw error for negative ratio', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          พลาสติก: -0.5,
        },
      };

      expect(() => calculator.calculate(trash)).toThrow('Invalid ratio: -0.5');
    });

    it('should throw error for unknown material (no waste_sorting found)', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          unknown_material: 1.0,
        },
      };

      // Should throw error for unknown material (no waste_sorting with that name)
      expect(() => calculator.calculate(trash)).toThrow(
        'Unknown material: "unknown_material". No waste_sorting found with name "unknown_material".',
      );
    });

    it('should normalize material names to lowercase', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          พลาสติก: 1.0, // Already lowercase in our mock
        },
      };

      const result = calculator.calculate(trash);
      expect(result.carbon_footprint).toBeCloseTo(25, 1); // 10 * 2.5
    });
  });

  describe('calculate - Waste Sorting (Array Format)', () => {
    beforeEach(async () => {
      await calculator.loadEmissionFactors();
    });

    it('should calculate from waste_sorting array format', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: [
          { name: 'พลาสติก', ratio: 0.5 },
          { name: 'กระดาษ', ratio: 0.5 },
        ],
      };

      const result = calculator.calculate(trash);

      expect(result.method).toBe('waste_sorting');
      // (5*2.5) + (5*1.2) = 12.5 + 6 = 18.5
      expect(result.carbon_footprint).toBeCloseTo(18.5, 1);
    });

    it('should support alternative property names in array items', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: [
          { material: 'พลาสติก', percentage: 0.6 },
          { material: 'กระดาษ', percentage: 0.4 },
        ],
      };

      const result = calculator.calculate(trash);

      expect(result.method).toBe('waste_sorting');
      // (6*2.5) + (4*1.2) = 15 + 4.8 = 19.8
      expect(result.carbon_footprint).toBeCloseTo(19.8, 1);
    });

    it('should throw error for empty array', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: [],
      };

      expect(() => calculator.calculate(trash)).toThrow('Invalid trash data');
    });
  });

  describe('calculate - Edge Cases', () => {
    beforeEach(async () => {
      await calculator.loadEmissionFactors();
    });

    it('should throw error for null trash data', () => {
      expect(() => calculator.calculate(null as unknown as TrashItem)).toThrow(
        'Invalid trash data: must be an object',
      );
    });

    it('should throw error for non-object trash data', () => {
      expect(() =>
        calculator.calculate('invalid' as unknown as TrashItem),
      ).toThrow('Invalid trash data: must be an object');
    });

    it('should throw error when missing required fields', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
      } as TrashItem;

      expect(() => calculator.calculate(trash)).toThrow(
        'Invalid trash data: must have either waste_sorting',
      );
    });

    it('should handle empty waste_sorting object', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {},
      };

      expect(() => calculator.calculate(trash)).toThrow(
        'waste_sorting cannot be empty',
      );
    });

    it('should log warning when ratios do not sum to 1.0', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          พลาสติก: 0.5,
          กระดาษ: 0.3, // Sum is 0.8, not 1.0
        },
      };

      calculator.calculate(trash);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalledWith(
        expect.stringContaining("Ratios don't sum to 1.0"),
      );
    });
  });

  describe('logging', () => {
    it('should use Nest Logger instead of console.log', async () => {
      await calculator.loadEmissionFactors();

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should limit log size to prevent memory leak', () => {
      const maxLogs = 5;
      const limitedCalculator = new CarbonFootprintCalculator(
        mockEntityManager,
        maxLogs,
        mockLogger,
      );

      // Add more logs than max
      for (let i = 0; i < maxLogs + 10; i++) {
        limitedCalculator.log(`Test log ${i}`);
      }

      const logs = limitedCalculator.getLogs();
      expect(logs.length).toBe(maxLogs);
    });
  });

  describe('getEmissionFactor', () => {
    beforeEach(async () => {
      await calculator.loadEmissionFactors();
    });

    it('should throw error for unknown material (no silent fallback)', () => {
      const trash: TrashItem = {
        id: 1,
        weight: 10,
        waste_sorting: {
          nonexistent_material: 1.0,
        },
      };

      // Should throw error instead of returning default EF: 2.0
      expect(() => calculator.calculate(trash)).toThrow(
        'Unknown material: "nonexistent_material". No waste_sorting found with name "nonexistent_material".',
      );
    });

    it('should support lookup by material id', async () => {
      // Create a new calculator to test id-based lookup
      const calc = new CarbonFootprintCalculator(
        mockEntityManager,
        1000,
        mockLogger,
      );
      await calc.loadEmissionFactors();

      // Access private method through type assertion

      const typedCalc = calc as unknown as CalculatorWithPrivate;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const getEF = typedCalc.getEmissionFactor.bind(calc);

      // Should be able to look up by id (1 = พลาสติก with EF 2.5)
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(getEF(1)).toBe(2.5);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      expect(getEF(2)).toBe(1.2);
    });

    it('should throw error for unknown material id', async () => {
      const calc = new CarbonFootprintCalculator(
        mockEntityManager,
        1000,
        mockLogger,
      );
      await calc.loadEmissionFactors();

      const typedCalc = calc as unknown as CalculatorWithPrivate;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const getEF = typedCalc.getEmissionFactor.bind(calc);

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-return
      expect(() => getEF(999)).toThrow('Unknown material id: 999');
    });
  });
});

describe('calculateDailyCarbonFootprint', () => {
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockLogger: jest.Mocked<Logger>;

  const mockWasteSortings: WasteSorting[] = [
    { id: 1, name: 'พลาสติก' } as WasteSorting,
    { id: 2, name: 'กระดาษ' } as WasteSorting,
  ];

  const mockMaterialGuides: MaterialGuide[] = [
    { id: 1, wastesid: 1, waste_meterialid: 1 } as MaterialGuide,
    { id: 2, wastesid: 2, waste_meterialid: 2 } as MaterialGuide,
  ];

  const mockWasteMaterials: WasteMaterial[] = [
    {
      id: 1,
      name: 'พลาสติก',
      emission_factor: 2.5,
      unit: 'kg',
    } as WasteMaterial,
    {
      id: 2,
      name: 'กระดาษ',
      emission_factor: 1.2,
      unit: 'kg',
    } as WasteMaterial,
  ];

  beforeEach(() => {
    mockEntityManager = {
      find: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    mockEntityManager.find.mockImplementation((entityClass: unknown) => {
      if (entityClass === WasteSorting) {
        return Promise.resolve(mockWasteSortings);
      }
      if (entityClass === MaterialGuide) {
        return Promise.resolve(mockMaterialGuides);
      }
      if (entityClass === WasteMaterial) {
        return Promise.resolve(mockWasteMaterials);
      }
      return Promise.resolve([]);
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should process multiple trash items', async () => {
    const trashItems: TrashItem[] = [
      {
        id: 1,
        weight: 10,
        type: 'พลาสติก',
        emission_factor: 2.5,
      },
      {
        id: 2,
        weight: 5,
        waste_sorting: {
          พลาสติก: 0.5,
          กระดาษ: 0.5,
        },
      },
    ];

    const result = await calculateDailyCarbonFootprint(
      trashItems,
      mockEntityManager,
      mockLogger,
    );

    expect(result.summary.total).toBe(2);
    expect(result.summary.success).toBe(2);
    expect(result.summary.failed).toBe(0);
    expect(result.results).toHaveLength(2);
  });

  it('should handle errors for individual items without failing all', async () => {
    const trashItems: TrashItem[] = [
      {
        id: 1,
        weight: 10,
        type: 'พลาสติก',
        emission_factor: 2.5,
      },
      {
        id: 2,
        weight: -5, // Invalid weight
        type: 'plastic',
        emission_factor: 2.0,
      },
      {
        id: 3,
        weight: 5,
        waste_sorting: {
          unknown_material: 1.0, // Unknown material
        },
      },
    ];

    const result = await calculateDailyCarbonFootprint(
      trashItems,
      mockEntityManager,
      mockLogger,
    );

    expect(result.summary.total).toBe(3);
    expect(result.summary.success).toBe(1);
    expect(result.summary.failed).toBe(2);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].error).toContain('Invalid weight');
    expect(result.errors[1].error).toContain('Unknown material');
  });

  it('should not use transactions (only reads)', async () => {
    // Add transaction mock
    mockEntityManager.transaction = jest.fn();

    const trashItems: TrashItem[] = [
      {
        id: 1,
        weight: 10,
        type: 'plastic',
        emission_factor: 2.5,
      },
    ];

    await calculateDailyCarbonFootprint(
      trashItems,
      mockEntityManager,
      mockLogger,
    );

    // Should not call transaction since we're only reading
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockEntityManager.transaction).not.toHaveBeenCalled();
  });

  it('should include logs in result', async () => {
    const trashItems: TrashItem[] = [
      {
        id: 1,
        weight: 10,
        type: 'plastic',
        emission_factor: 2.5,
      },
    ];

    const result = await calculateDailyCarbonFootprint(
      trashItems,
      mockEntityManager,
      mockLogger,
    );

    expect(result.logs.length).toBeGreaterThan(0);
    expect(result.logs.some((log) => log.includes('Starting Daily'))).toBe(
      true,
    );
    expect(result.logs.some((log) => log.includes('CALCULATION SUMMARY'))).toBe(
      true,
    );
  });

  it('should convert kg to grams for storage', async () => {
    const trashItems: TrashItem[] = [
      {
        id: 1,
        weight: 2.5, // 2.5 kg
        type: 'plastic',
        emission_factor: 2.0,
      },
    ];

    const result = await calculateDailyCarbonFootprint(
      trashItems,
      mockEntityManager,
      mockLogger,
    );

    // weight_grams should be 2500 (2.5 kg * 1000)
    expect(result.results[0].weight_grams).toBe(2500);
  });

  it('should handle empty trash items array', async () => {
    const result = await calculateDailyCarbonFootprint(
      [],
      mockEntityManager,
      mockLogger,
    );

    expect(result.summary.total).toBe(0);
    expect(result.summary.success).toBe(0);
    expect(result.summary.failed).toBe(0);
  });
});

describe('calculateByWasteId', () => {
  let calculator: CarbonFootprintCalculator;
  let mockEntityManager: jest.Mocked<EntityManager>;
  let mockLogger: jest.Mocked<Logger>;

  const mockWasteMaterial: WasteMaterial = {
    id: 1,
    name: 'พลาสติก',
    emission_factor: 2.5,
    unit: 'kg',
  } as WasteMaterial;

  const mockMaterialGuides: MaterialGuide[] = [
    {
      id: 1,
      wastesid: 1,
      waste_meterialid: 1,
      weight: 0.5,
      wasteMaterial: mockWasteMaterial,
    } as MaterialGuide,
    {
      id: 2,
      wastesid: 1,
      waste_meterialid: 1,
      weight: 0.3,
      wasteMaterial: mockWasteMaterial,
    } as MaterialGuide,
  ];

  beforeEach(() => {
    mockEntityManager = {
      find: jest.fn(),
    } as unknown as jest.Mocked<EntityManager>;

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    calculator = new CarbonFootprintCalculator(
      mockEntityManager,
      1000,
      mockLogger,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate carbon for scanned waste with MaterialGuide records (Case 1)', async () => {
    // Mock MaterialGuide records found
    mockEntityManager.find.mockImplementation((entityClass: unknown) => {
      if (entityClass === MaterialGuide) {
        return Promise.resolve(mockMaterialGuides);
      }
      return Promise.resolve([]);
    });

    const wasteHistory = {
      id: 1,
      amount: 10,
      wastesid: 1,
      wasteMaterial: mockWasteMaterial,
    } as WasteHistory;

    const result = await calculator.calculateByWasteId(1, wasteHistory);

    // (0.5 * 2.5) + (0.3 * 2.5) = 1.25 + 0.75 = 2.0
    expect(result).toBeCloseTo(2.0, 1);
  });

  it('should fallback to wasteHistory for manual entry without MaterialGuide (Case 2)', async () => {
    // Mock no MaterialGuide records found (empty array)
    mockEntityManager.find.mockImplementation((entityClass: unknown) => {
      if (entityClass === MaterialGuide) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    const wasteHistory = {
      id: 1,
      amount: 10,
      wastesid: 2,
      wasteMaterial: mockWasteMaterial,
    } as WasteHistory;

    const result = await calculator.calculateByWasteId(2, wasteHistory);

    // 10 * 2.5 = 25 (manual fallback calculation)
    expect(result).toBeCloseTo(25, 1);
  });

  it('should throw error when no MaterialGuide and no wasteHistory provided', async () => {
    // Mock no MaterialGuide records found
    mockEntityManager.find.mockImplementation((entityClass: unknown) => {
      if (entityClass === MaterialGuide) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    await expect(calculator.calculateByWasteId(1)).rejects.toThrow(
      'No material guides found for waste_id: 1 and no wasteHistory provided for fallback',
    );
  });

  it('should throw error when no MaterialGuide and no wasteMaterial in wasteHistory', async () => {
    // Mock no MaterialGuide records found
    mockEntityManager.find.mockImplementation((entityClass: unknown) => {
      if (entityClass === MaterialGuide) {
        return Promise.resolve([]);
      }
      return Promise.resolve([]);
    });

    const wasteHistoryWithoutMaterial = {
      id: 1,
      amount: 10,
      wastesid: 1,
      wasteMaterial: undefined,
    } as unknown as WasteHistory;

    await expect(
      calculator.calculateByWasteId(1, wasteHistoryWithoutMaterial),
    ).rejects.toThrow(
      'No wasteMaterial found in wasteHistory for fallback calculation',
    );
  });
});
