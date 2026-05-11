import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { BadRequestException } from '@nestjs/common';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { ProductTemplateConfig } from '../interfaces/pricing-config.interface';
import { QuoteValidatorService } from './quote-validator.service';

describe('QuoteValidatorService label parameters', () => {
  const service = new QuoteValidatorService();
  const template: ProductTemplateConfig = {
    id: 1,
    productId: 1,
    widthMin: 20,
    widthMax: 500,
    heightMin: 20,
    heightMax: 500,
    quantityMin: 100,
    quantityMax: 100000,
    materialIds: [1, 2],
    processCodes: ['lamination', 'die_cut'],
    printModes: ['four_color'],
    shapeTypes: ['rectangle', 'custom'],
    adhesiveTypes: ['permanent', 'removable'],
    deliveryForms: ['roll', 'sheet'],
    surfaceFinishes: ['matte_lamination', 'white_ink'],
    colorModes: ['four_color', 'four_color_white_ink'],
    labelingMethods: ['manual', 'automatic'],
    allowProofing: true,
  };

  it('requires roll direction, core, and pieces per roll for roll delivery', () => {
    const dto = createDto({
      deliveryForm: 'roll',
      rollDirection: undefined,
      rollCoreMm: undefined,
      piecesPerRoll: undefined,
    });

    assert.throws(() => service.validate(dto, template), BadRequestException);
  });

  it('rejects unsupported adhesive type from template options', () => {
    const dto = createDto({ adhesiveType: 'freezer' });

    assert.throws(() => service.validate(dto, template), /胶型|不支持/);
  });

  it('requires a design file URL when the customer says a file exists', () => {
    const dto = createDto({ hasDesignFile: true, designFileUrl: undefined });

    assert.throws(() => service.validate(dto, template), /文件地址/);
  });

  it('accepts supported label requirement parameters', () => {
    const dto = createDto({
      deliveryForm: 'roll',
      rollDirection: 'top_out',
      rollCoreMm: 76,
      piecesPerRoll: 1000,
      hasDesignFile: true,
      designFileUrl: 'https://example.com/artwork.pdf',
    });

    assert.doesNotThrow(() => service.validate(dto, template));
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
    isProofing: false,
    isUrgent: false,
    customerType: 'company',
    adhesiveType: 'permanent',
    deliveryForm: 'sheet',
    surfaceFinish: 'matte_lamination',
    colorMode: 'four_color',
    labelingMethod: 'manual',
    ...overrides,
  };
}
