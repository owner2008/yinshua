import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { matchesQuoteRuleCondition } from './quote-config.repository';

describe('matchesQuoteRuleCondition label parameters', () => {
  it('matches canonical label parameter condition keys', () => {
    const dto = createDto({
      styleCount: 3,
      adhesiveType: 'permanent',
      deliveryForm: 'roll',
      surfaceFinish: 'white_ink',
      colorMode: 'four_color_white_ink',
      labelingMethod: 'automatic',
    });

    assert.equal(
      matchesQuoteRuleCondition(
        {
          quantityRange: [100, 10000],
          widthRange: [20, 500],
          heightRange: [20, 500],
          customerTypes: ['company'],
          styleCountRange: [2, 5],
          adhesiveTypes: ['permanent'],
          deliveryForms: ['roll'],
          surfaceFinishes: ['white_ink'],
          colorModes: ['four_color_white_ink'],
          labelingMethods: ['automatic'],
        },
        dto,
      ),
      true,
    );
  });

  it('rejects a rule when style count or label options are outside the condition', () => {
    const dto = createDto({ styleCount: 6, adhesiveType: 'freezer' });

    assert.equal(
      matchesQuoteRuleCondition(
        {
          quantityRange: [100, 10000],
          styleCountRange: [1, 5],
          adhesiveTypes: ['permanent', 'removable'],
        },
        dto,
      ),
      false,
    );
  });
});

function createDto(overrides: Partial<CreateQuoteDto> = {}): CreateQuoteDto {
  return {
    productId: 1,
    productTemplateId: 1,
    widthMm: 60,
    heightMm: 40,
    quantity: 1000,
    styleCount: 1,
    materialId: 2,
    printMode: 'four_color',
    shapeType: 'rectangle',
    processCodes: ['lamination'],
    customerType: 'company',
    ...overrides,
  };
}
