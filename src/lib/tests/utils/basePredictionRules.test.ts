import { describe, it, expect } from 'vitest';
import { basePredictionRulesSchemaToObject, basePredictionRulesObjectToSchema } from '~/lib/utils';
import { defaultBasePredictionRules } from '~/lib/leagues';
import type { BaseEventPredictionRulesSchema } from '~/types/leagues';
import { type PredictionTiming } from '~/types/events';

describe('basePredictionRulesSchemaToObject', () => {
  it('should return default rules when schema is null', () => {
    const result = basePredictionRulesSchemaToObject(null);
    expect(result).toEqual(defaultBasePredictionRules);
  });

  it('should convert schema to object format', () => {
    const schema: Partial<BaseEventPredictionRulesSchema> = {
      advFoundPrediction: true,
      advFoundPredictionPoints: 10,
      advFoundPredictionTiming: ['Draft', 'Weekly'],
    };

    const result = basePredictionRulesSchemaToObject(schema as BaseEventPredictionRulesSchema);

    expect(result.advFound).toEqual({
      enabled: true,
      points: 10,
      timing: ['Draft', 'Weekly'],
    });
  });

  it('should handle disabled rules', () => {
    const schema: Partial<BaseEventPredictionRulesSchema> = {
      advFoundPrediction: false,
      advFoundPredictionPoints: 10,
      advFoundPredictionTiming: ['Draft'],
    };

    const result = basePredictionRulesSchemaToObject(schema as BaseEventPredictionRulesSchema);

    expect(result.advFound?.enabled).toBe(false);
  });

  it('should use default values for missing fields', () => {
    const schema: Partial<BaseEventPredictionRulesSchema> = {
      advFoundPrediction: true,
      // Missing points and timing
    };

    const result = basePredictionRulesSchemaToObject(schema as BaseEventPredictionRulesSchema);

    expect(result.advFound?.enabled).toBe(true);
    expect(result.advFound?.points).toBe(0);
    expect(result.advFound?.timing).toEqual([]);
  });

  it('should process all scoring base event names', () => {
    const schema: Partial<BaseEventPredictionRulesSchema> = {
      indivWinPrediction: true,
      indivWinPredictionPoints: 15,
      indivWinPredictionTiming: ['Weekly (Postmerge only)'],
    };

    const result = basePredictionRulesSchemaToObject(schema as BaseEventPredictionRulesSchema);

    expect(result.indivWin).toEqual({
      enabled: true,
      points: 15,
      timing: ['Weekly (Postmerge only)'],
    });
  });
});

describe('basePredictionRulesObjectToSchema', () => {
  it('should convert object to schema format', () => {
    const rules = {
      ...defaultBasePredictionRules,
      advFound: {
        enabled: true,
        points: 10,
        timing: ['Weekly'] as PredictionTiming[]
      },
    };

    const result = basePredictionRulesObjectToSchema(rules);

    expect(result.advFoundPrediction).toBe(true);
    expect(result.advFoundPredictionPoints).toBe(10);
    expect(result.advFoundPredictionTiming).toEqual(['Weekly']);
  });

  it('should handle disabled rules', () => {
    const rules = {
      ...defaultBasePredictionRules,
      advFound: {
        enabled: false,
        points: 5,
        timing: [] as PredictionTiming[]
      },
    };

    const result = basePredictionRulesObjectToSchema(rules);

    expect(result.advFoundPrediction).toBe(false);
  });

  it('should convert all event rules', () => {
    const result = basePredictionRulesObjectToSchema(defaultBasePredictionRules);

    // Check that all keys are present
    expect(result.advFoundPrediction).toBeDefined();
    expect(result.advPlayPrediction).toBeDefined();
    expect(result.indivWinPrediction).toBeDefined();
    expect(result.soleSurvivorPrediction).toBeDefined();
  });

  it('should be inverse of schemaToObject for default rules', () => {
    const schema = basePredictionRulesObjectToSchema(defaultBasePredictionRules);
    const backToObject = basePredictionRulesSchemaToObject(schema);

    expect(backToObject).toEqual(defaultBasePredictionRules);
  });
});
