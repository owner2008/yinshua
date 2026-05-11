# 标签不干胶报价参数重构 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 引入标签/不干胶产品参数体系，保留现有报价公式，让新增参数参与校验、规则匹配、附加费、快照和前后台展示。

**Architecture:** 先建立共享报价参数配置，前台和后台都从配置读取字段、选项和中文标签。后端扩展 DTO、validator、rule matcher 和 calc service，保持现有报价公式不变，只让新增参数进入条件与附加费。前台报价页拆成配置驱动组件，后台规则页和报价详情页补齐新参数展示。

**Tech Stack:** NestJS, class-validator, Prisma JSON snapshots, React 19, Ant Design admin, Vite client, Node test runner via `tsx`.

---

## File Structure

- Create `apps/api/src/modules/quotes/quote-parameter-options.ts`
  Backend-owned canonical option values and labels for label quote parameters.
- Create `apps/client/src/quoteParameterConfig.ts`
  Frontend form sections, field metadata, defaults, labels, and visibility rules.
- Modify `apps/client/src/types.ts`
  Add `styleCount`, parameter field names, and optional `requirementSummary`.
- Modify `apps/api/src/modules/quotes/dto/create-quote.dto.ts`
  Add `styleCount` and tighten validation for existing requirement fields.
- Modify `apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts`
  Add new condition lists to `ProductTemplateConfig` and extend `RuleConfig` if needed.
- Modify `apps/api/src/modules/quotes/services/quote-validator.service.ts`
  Add conditional validation for roll fields, file fields, and template-supported options.
- Modify `apps/api/src/modules/quotes/services/quote-config.repository.ts`
  Support new condition keys in rule matching and fallback configs.
- Modify `apps/api/src/modules/quotes/services/quote-calc.service.ts`
  Add style-count and design-service/sample-approval/package extra fees using current rule config.
- Modify `apps/api/src/modules/quotes/services/quote.service.ts`
  Persist all new requirement fields in `processOptionsJson.requirements` and `snapshot.input`.
- Modify `apps/api/src/modules/quotes/services/quote-calc.service.test.ts`
  Cover new parameter-driven extra fees.
- Modify `apps/api/src/modules/quotes/services/quote-validator.service.test.ts`
  Add focused validator tests.
- Modify `apps/api/src/modules/quotes/services/quote-config.repository.test.ts`
  Add rule-condition matching tests if no existing test covers matcher internals.
- Modify `apps/client/src/pages/Quote.tsx`
  Replace hardcoded, garbled controls with composed configuration-driven sections.
- Create `apps/client/src/components/quote/QuoteProductSelector.tsx`
- Create `apps/client/src/components/quote/QuoteParameterSections.tsx`
- Create `apps/client/src/components/quote/QuoteResultPanel.tsx`
- Modify `apps/client/src/quoteRequirements.ts` and `apps/admin/src/quoteRequirements.ts`
  Use shared readable labels and include `styleCount`.
- Modify `apps/admin/src/pages/QuoteRulesPage.tsx`
  Add new rule condition fields and preview input fields.
- Modify `apps/admin/src/pages/QuotesPage.tsx`
  Display new requirement summary in quote details.
- Modify `apps/client/src/styles.css` and `apps/admin/src/styles.css`
  Support sectioned quote form and readable requirement summary.

---

### Task 1: Shared Parameter Configuration

**Files:**
- Create: `apps/client/src/quoteParameterConfig.ts`
- Modify: `apps/client/src/types.ts`
- Modify: `apps/client/src/quoteRequirements.ts`
- Modify: `apps/admin/src/quoteRequirements.ts`

- [ ] **Step 1: Write a failing type-level/client config test by building the client**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/client build
```

Expected before implementation: FAIL once imports are added in later steps because `quoteParameterConfig.ts` and `styleCount` do not exist.

- [ ] **Step 2: Add `styleCount` to client quote input**

In `apps/client/src/types.ts`, update `QuoteInput`:

```ts
export interface QuoteInput {
  productId: number;
  productTemplateId: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  styleCount: number;
  materialId: number;
  printMode: string;
  shapeType: string;
  processCodes: string[];
  isProofing: boolean;
  isUrgent: boolean;
  customerType: 'personal' | 'company';
  memberId?: number;
  deliveryForm?: string;
  labelingMethod?: string;
  rollDirection?: string;
  rollCoreMm?: number;
  piecesPerRoll?: number;
  adhesiveType?: string;
  usageEnvironment?: string;
  surfaceFinish?: string;
  colorMode?: string;
  hasDesignFile?: boolean;
  designFileUrl?: string;
  needDesignService?: boolean;
  needSampleApproval?: boolean;
  packagingMethod?: string;
  expectedDeliveryDate?: string;
  shippingRegionCode?: string;
  quoteRemark?: string;
}
```

- [ ] **Step 3: Create the quote parameter config**

Create `apps/client/src/quoteParameterConfig.ts`:

```ts
import type { QuoteInput } from './types';

export type QuoteParameterFieldType = 'select' | 'number' | 'text' | 'textarea' | 'checkbox';
export type QuoteParameterFieldName = keyof QuoteInput;

export interface QuoteParameterOption {
  label: string;
  value: string;
}

export interface QuoteParameterField {
  name: QuoteParameterFieldName;
  label: string;
  type: QuoteParameterFieldType;
  placeholder?: string;
  min?: number;
  defaultValue?: string | number | boolean;
  options?: QuoteParameterOption[];
  visibleWhen?: Partial<Record<QuoteParameterFieldName, string | number | boolean>>;
}

export interface QuoteParameterSection {
  key: string;
  title: string;
  description: string;
  fields: QuoteParameterField[];
}

export const deliveryFormOptions = [
  { label: '卷装', value: 'roll' },
  { label: '张装', value: 'sheet' },
  { label: '单张裁切', value: 'sheet_cut' },
  { label: '折页 / 风琴折', value: 'fan_fold' },
];

export const labelingMethodOptions = [
  { label: '手工贴标', value: 'manual' },
  { label: '自动贴标', value: 'automatic' },
  { label: '半自动贴标', value: 'semi_automatic' },
];

export const rollDirectionOptions = [
  { label: '上出', value: 'top_out' },
  { label: '下出', value: 'bottom_out' },
  { label: '左出', value: 'left_out' },
  { label: '右出', value: 'right_out' },
  { label: '内卷', value: 'inside' },
  { label: '外卷', value: 'outside' },
];

export const adhesiveTypeOptions = [
  { label: '永久胶', value: 'permanent' },
  { label: '可移胶', value: 'removable' },
  { label: '强粘胶', value: 'strong' },
  { label: '冷冻胶', value: 'freezer' },
  { label: '耐高温胶', value: 'heat_resistant' },
];

export const surfaceFinishOptions = [
  { label: '哑膜', value: 'matte_lamination' },
  { label: '亮膜', value: 'gloss_lamination' },
  { label: '哑油', value: 'matte_varnish' },
  { label: '光油', value: 'gloss_varnish' },
  { label: '防刮', value: 'scratch_resistant' },
  { label: '防水', value: 'waterproof' },
  { label: '白墨打底', value: 'white_ink' },
];

export const colorModeOptions = [
  { label: '四色印刷', value: 'four_color' },
  { label: '单黑', value: 'black' },
  { label: '专色', value: 'spot_color' },
  { label: '四色 + 白墨', value: 'four_color_white_ink' },
  { label: '可变数据 / 条码', value: 'variable_data' },
];

export const quoteParameterSections: QuoteParameterSection[] = [
  {
    key: 'base',
    title: '基础规格',
    description: '填写标签尺寸、数量和款数。',
    fields: [
      { name: 'widthMm', label: '宽度（mm）', type: 'number', min: 1 },
      { name: 'heightMm', label: '高度（mm）', type: 'number', min: 1 },
      { name: 'quantity', label: '数量', type: 'number', min: 1 },
      { name: 'styleCount', label: '款数', type: 'number', min: 1, defaultValue: 1 },
    ],
  },
  {
    key: 'material',
    title: '材料与工艺',
    description: '选择胶型、印刷颜色和表面处理。',
    fields: [
      { name: 'adhesiveType', label: '胶型', type: 'select', options: adhesiveTypeOptions },
      { name: 'usageEnvironment', label: '使用环境', type: 'text', placeholder: '如冷冻、户外、防水、耐油' },
      { name: 'surfaceFinish', label: '表面处理', type: 'select', options: surfaceFinishOptions },
      { name: 'colorMode', label: '印刷颜色', type: 'select', options: colorModeOptions },
    ],
  },
  {
    key: 'delivery',
    title: '卷装与交付',
    description: '补充贴标、卷芯、包装和交期要求。',
    fields: [
      { name: 'deliveryForm', label: '交付形式', type: 'select', options: deliveryFormOptions },
      { name: 'labelingMethod', label: '贴标方式', type: 'select', options: labelingMethodOptions },
      { name: 'rollDirection', label: '出标 / 卷标方向', type: 'select', options: rollDirectionOptions, visibleWhen: { deliveryForm: 'roll' } },
      { name: 'rollCoreMm', label: '卷芯内径（mm）', type: 'number', min: 0, defaultValue: 76, visibleWhen: { deliveryForm: 'roll' } },
      { name: 'piecesPerRoll', label: '每卷数量', type: 'number', min: 0, defaultValue: 1000, visibleWhen: { deliveryForm: 'roll' } },
      { name: 'packagingMethod', label: '包装与发货要求', type: 'text', placeholder: '如按卷分装、纸箱、发货地区' },
      { name: 'expectedDeliveryDate', label: '期望交期', type: 'text', placeholder: '如 3 天内、下周五前' },
      { name: 'shippingRegionCode', label: '收货区域', type: 'text', placeholder: '省市区或区域编码' },
    ],
  },
  {
    key: 'file',
    title: '文件与复核',
    description: '记录设计文件、样稿确认和补充说明。',
    fields: [
      { name: 'hasDesignFile', label: '已有设计文件', type: 'checkbox', defaultValue: false },
      { name: 'designFileUrl', label: '设计文件地址', type: 'text', placeholder: '网盘、图片或文件链接' },
      { name: 'needDesignService', label: '需要设计协助', type: 'checkbox', defaultValue: false },
      { name: 'needSampleApproval', label: '需要样稿确认', type: 'checkbox', defaultValue: false },
      { name: 'quoteRemark', label: '补充说明', type: 'textarea', placeholder: '可补充贴标设备、卷外径、特殊工艺、文件状态等' },
    ],
  },
];

export const quoteRequirementLabels = Object.fromEntries(
  quoteParameterSections.flatMap((section) => section.fields.map((field) => [field.name, field.label])),
) as Record<string, string>;

export function getDefaultRequirementValues(): Partial<QuoteInput> {
  return Object.fromEntries(
    quoteParameterSections
      .flatMap((section) => section.fields)
      .filter((field) => field.defaultValue !== undefined)
      .map((field) => [field.name, field.defaultValue]),
  ) as Partial<QuoteInput>;
}
```

- [ ] **Step 4: Replace duplicated requirement labels**

In `apps/client/src/quoteRequirements.ts` and `apps/admin/src/quoteRequirements.ts`, replace the local `quoteRequirementLabels` object with:

```ts
import { quoteRequirementLabels } from './quoteParameterConfig';
```

For admin use a local copy or create `apps/admin/src/quoteParameterConfig.ts` with the same exported labels if cross-app imports are not configured. Prefer duplicating the small labels map in admin for this plan to avoid workspace path coupling.

- [ ] **Step 5: Run client build**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/client build
```

Expected: PASS after wiring imports. If admin labels were also changed, run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/admin build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add apps/client/src/types.ts apps/client/src/quoteParameterConfig.ts apps/client/src/quoteRequirements.ts apps/admin/src/quoteRequirements.ts
git commit -m "feat: add label quote parameter config"
```

---

### Task 2: Backend DTO, Validation, Rule Matching, and Snapshot

**Files:**
- Modify: `apps/api/src/modules/quotes/dto/create-quote.dto.ts`
- Modify: `apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts`
- Modify: `apps/api/src/modules/quotes/services/quote-validator.service.ts`
- Modify: `apps/api/src/modules/quotes/services/quote-config.repository.ts`
- Modify: `apps/api/src/modules/quotes/services/quote.service.ts`
- Test: `apps/api/src/modules/quotes/services/quote-validator.service.test.ts`
- Test: `apps/api/src/modules/quotes/services/quote-config.repository.test.ts`

- [ ] **Step 1: Write validator tests first**

Create `apps/api/src/modules/quotes/services/quote-validator.service.test.ts`:

```ts
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
    allowProofing: true,
  };

  it('requires roll direction, core, and pieces per roll for roll delivery', () => {
    const dto = createDto({ deliveryForm: 'roll', rollDirection: undefined, rollCoreMm: undefined, piecesPerRoll: undefined });

    assert.throws(() => service.validate(dto, template), BadRequestException);
  });

  it('rejects unsupported adhesive type from template options', () => {
    const dto = createDto({ adhesiveType: 'freezer' });

    assert.throws(() => service.validate(dto, template), /胶型|不支持/);
  });

  it('accepts supported label requirement parameters', () => {
    const dto = createDto({ deliveryForm: 'roll', rollDirection: 'top_out', rollCoreMm: 76, piecesPerRoll: 1000 });

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
    ...overrides,
  };
}
```

- [ ] **Step 2: Run validator test and verify red**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api test -- src/modules/quotes/services/quote-validator.service.test.ts
```

Expected: FAIL because `styleCount`, `adhesiveTypes`, `deliveryForms`, `surfaceFinishes`, and `colorModes` are not supported yet.

- [ ] **Step 3: Extend DTO**

In `apps/api/src/modules/quotes/dto/create-quote.dto.ts`, add after `quantity`:

```ts
  @IsOptional()
  @IsInt()
  @Min(1)
  styleCount?: number;
```

Keep existing fields optional. Add `shippingRegionCode` if it is not already present:

```ts
  @IsOptional()
  @IsString()
  @MaxLength(64)
  shippingRegionCode?: string;
```

- [ ] **Step 4: Extend pricing interfaces**

In `apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts`, update `ProductTemplateConfig`:

```ts
export interface ProductTemplateConfig {
  id: number;
  productId: number;
  widthMin: number;
  widthMax: number;
  heightMin: number;
  heightMax: number;
  quantityMin: number;
  quantityMax: number;
  materialIds: number[];
  processCodes: string[];
  printModes: string[];
  shapeTypes: string[];
  adhesiveTypes?: string[];
  deliveryForms?: string[];
  surfaceFinishes?: string[];
  colorModes?: string[];
  allowProofing: boolean;
}
```

- [ ] **Step 5: Add validator helpers**

In `apps/api/src/modules/quotes/services/quote-validator.service.ts`, after proofing validation, add:

```ts
    this.validateSupportedOption('胶型', dto.adhesiveType, template.adhesiveTypes);
    this.validateSupportedOption('交付形式', dto.deliveryForm, template.deliveryForms);
    this.validateSupportedOption('表面处理', dto.surfaceFinish, template.surfaceFinishes);
    this.validateSupportedOption('印刷颜色', dto.colorMode, template.colorModes);

    if (dto.deliveryForm === 'roll') {
      if (!dto.rollDirection) {
        throw new BadRequestException('卷装标签必须选择出标方向');
      }
      if (!dto.rollCoreMm || dto.rollCoreMm <= 0) {
        throw new BadRequestException('卷装标签必须填写卷芯内径');
      }
      if (!dto.piecesPerRoll || dto.piecesPerRoll <= 0) {
        throw new BadRequestException('卷装标签必须填写每卷数量');
      }
    }

    if (dto.hasDesignFile && !dto.designFileUrl) {
      throw new BadRequestException('已有设计文件时必须填写文件地址');
    }
```

Add private method in the class:

```ts
  private validateSupportedOption(label: string, value: string | undefined, supported: string[] | undefined): void {
    if (!value || !supported?.length) {
      return;
    }
    if (!supported.includes(value)) {
      throw new BadRequestException(`当前模板不支持所选${label}：${value}`);
    }
  }
```

- [ ] **Step 6: Support new rule conditions**

In `apps/api/src/modules/quotes/services/quote-config.repository.ts`, update fallback templates with:

```ts
    adhesiveTypes: ['permanent', 'removable', 'strong', 'freezer', 'heat_resistant'],
    deliveryForms: ['roll', 'sheet', 'sheet_cut', 'fan_fold'],
    surfaceFinishes: ['matte_lamination', 'gloss_lamination', 'matte_varnish', 'gloss_varnish', 'scratch_resistant', 'waterproof', 'white_ink'],
    colorModes: ['four_color', 'black', 'spot_color', 'four_color_white_ink', 'variable_data'],
```

Apply this to every fallback template that should accept the full label parameter set. Then update `matchCondition` to evaluate string and range conditions:

```ts
  if (Array.isArray(condition.styleCountRange) && dto.styleCount) {
    const [min, max] = condition.styleCountRange.map(Number);
    if (dto.styleCount < min || dto.styleCount > max) {
      return false;
    }
  }

  const optionConditions: Array<[string, unknown]> = [
    ['adhesiveTypes', dto.adhesiveType],
    ['deliveryForms', dto.deliveryForm],
    ['surfaceFinishes', dto.surfaceFinish],
    ['colorModes', dto.colorMode],
    ['labelingMethods', dto.labelingMethod],
  ];

  for (const [key, value] of optionConditions) {
    const allowed = condition[key];
    if (Array.isArray(allowed) && value && !allowed.includes(value)) {
      return false;
    }
  }
```

Place this inside existing `matchCondition` after current width/height/quantity/customer checks.

- [ ] **Step 7: Persist all requirement fields**

In `apps/api/src/modules/quotes/services/quote.service.ts`, update `pickQuoteRequirements`:

```ts
function pickQuoteRequirements(dto: CreateQuoteDto) {
  return {
    styleCount: dto.styleCount ?? 1,
    deliveryForm: dto.deliveryForm,
    labelingMethod: dto.labelingMethod,
    rollDirection: dto.rollDirection,
    rollCoreMm: dto.rollCoreMm,
    piecesPerRoll: dto.piecesPerRoll,
    adhesiveType: dto.adhesiveType,
    usageEnvironment: dto.usageEnvironment,
    surfaceFinish: dto.surfaceFinish,
    colorMode: dto.colorMode,
    hasDesignFile: dto.hasDesignFile,
    designFileUrl: dto.designFileUrl,
    needDesignService: dto.needDesignService,
    needSampleApproval: dto.needSampleApproval,
    packagingMethod: dto.packagingMethod,
    expectedDeliveryDate: dto.expectedDeliveryDate,
    shippingRegionCode: dto.shippingRegionCode,
    quoteRemark: dto.quoteRemark,
  };
}
```

- [ ] **Step 8: Run backend tests**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api test -- src/modules/quotes/services/quote-validator.service.test.ts
.\.tools\node\pnpm.CMD --dir apps/api test
```

Expected: PASS.

- [ ] **Step 9: Commit**

```powershell
git add apps/api/src/modules/quotes/dto/create-quote.dto.ts apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts apps/api/src/modules/quotes/services/quote-validator.service.ts apps/api/src/modules/quotes/services/quote-config.repository.ts apps/api/src/modules/quotes/services/quote.service.ts apps/api/src/modules/quotes/services/quote-validator.service.test.ts
git commit -m "feat: validate label quote parameters"
```

---

### Task 3: Backend Extra Fees for New Parameters

**Files:**
- Modify: `apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts`
- Modify: `apps/api/src/modules/quotes/services/quote-config.repository.ts`
- Modify: `apps/api/src/modules/quotes/services/quote-calc.service.ts`
- Test: `apps/api/src/modules/quotes/services/quote-calc.service.test.ts`

- [ ] **Step 1: Add failing calc tests**

In `apps/api/src/modules/quotes/services/quote-calc.service.test.ts`, add:

```ts
  it('adds style count, design service, and sample approval fees', () => {
    const service = new QuoteCalcService();
    const result = service.calculate(
      {
        ...sampleInput,
        styleCount: 3,
        needDesignService: true,
        needSampleApproval: true,
      },
      sampleConfig,
    );

    assert.deepEqual(
      result.extraFees
        .filter((fee) => ['additional_style', 'design_service', 'sample_approval'].includes(fee.code))
        .map((fee) => [fee.code, fee.amount]),
      [
        ['additional_style', 60],
        ['design_service', 120],
        ['sample_approval', 80],
      ],
    );
  });
```

Update `sampleConfig.rule` in the test fixture with:

```ts
    additionalStyleFee: 30,
    designServiceFee: 120,
    sampleApprovalFee: 80,
```

- [ ] **Step 2: Run calc test and verify red**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api test -- src/modules/quotes/services/quote-calc.service.test.ts
```

Expected: FAIL because new fee config fields and fee codes do not exist.

- [ ] **Step 3: Extend rule config**

In `apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts`, add to `RuleConfig`:

```ts
  additionalStyleFee: number;
  designServiceFee: number;
  sampleApprovalFee: number;
```

- [ ] **Step 4: Add default fee config**

In `apps/api/src/modules/quotes/services/quote-config.repository.ts`, add to `defaultRequirementFeeConfig`:

```ts
  additionalStyleFee: 30,
  designServiceFee: 120,
  sampleApprovalFee: 80,
```

Ensure database rule config normalization also falls back to these defaults when JSON omits them.

- [ ] **Step 5: Add fee calculation**

In `apps/api/src/modules/quotes/services/quote-calc.service.ts`, inside `calculateRequirementFees`, add before `return fees;`:

```ts
  const styleCount = dto.styleCount ?? 1;
  if (styleCount > 1) {
    fees.push({
      code: 'additional_style',
      name: '多款整理费',
      amount: round((styleCount - 1) * rule.additionalStyleFee, 2),
    });
  }

  if (dto.needDesignService) {
    fees.push({ code: 'design_service', name: '设计协助费', amount: rule.designServiceFee });
  }

  if (dto.needSampleApproval) {
    fees.push({ code: 'sample_approval', name: '样稿确认费', amount: rule.sampleApprovalFee });
  }
```

Also change existing garbled string comparisons to canonical values:

```ts
  if (dto.colorMode === 'four_color_white_ink' || dto.surfaceFinish === 'white_ink') {
```

```ts
  if (dto.colorMode === 'variable_data') {
```

```ts
  if (dto.surfaceFinish && ['scratch_resistant', 'waterproof'].includes(dto.surfaceFinish)) {
```

```ts
  const rollCount = dto.deliveryForm === 'roll' && dto.piecesPerRoll ? Math.ceil(dto.quantity / dto.piecesPerRoll) : 0;
```

```ts
  if (dto.deliveryForm === 'sheet_cut') {
    fees.push({ code: 'sheet_cutting', name: '单张裁切整理费', amount: rule.sheetCuttingFee });
  }

  if (dto.deliveryForm === 'fan_fold') {
    fees.push({ code: 'fan_fold', name: '折页整理费', amount: rule.fanFoldFee });
  }
```

- [ ] **Step 6: Run calc and full backend tests**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api test -- src/modules/quotes/services/quote-calc.service.test.ts
.\.tools\node\pnpm.CMD --dir apps/api test
```

Expected: PASS.

- [ ] **Step 7: Commit**

```powershell
git add apps/api/src/modules/quotes/interfaces/pricing-config.interface.ts apps/api/src/modules/quotes/services/quote-config.repository.ts apps/api/src/modules/quotes/services/quote-calc.service.ts apps/api/src/modules/quotes/services/quote-calc.service.test.ts
git commit -m "feat: add label quote requirement fees"
```

---

### Task 4: Client Quote Page Refactor

**Files:**
- Create: `apps/client/src/components/quote/QuoteProductSelector.tsx`
- Create: `apps/client/src/components/quote/QuoteParameterSections.tsx`
- Create: `apps/client/src/components/quote/QuoteResultPanel.tsx`
- Modify: `apps/client/src/pages/Quote.tsx`
- Modify: `apps/client/src/styles.css`
- Modify: `apps/client/src/quoteRequirements.ts`

- [ ] **Step 1: Build first to establish current baseline**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/client build
```

Expected before refactor: PASS. If it fails due to existing syntax/encoding issues, fix only syntax that blocks the build and commit it separately with `fix: restore client build`.

- [ ] **Step 2: Create `QuoteProductSelector`**

Create `apps/client/src/components/quote/QuoteProductSelector.tsx`:

```tsx
import type { RefObject } from 'react';
import type { Product } from '../../types';

interface QuoteProductSelectorProps {
  products: Product[];
  selectedProductId: number;
  listRef: RefObject<HTMLElement | null>;
  onSelect: (product: Product) => void;
}

export function QuoteProductSelector({ products, selectedProductId, listRef, onSelect }: QuoteProductSelectorProps) {
  return (
    <aside className="product-list" ref={listRef}>
      {products.map((product, index) => (
        <button
          key={product.id}
          data-product-id={String(product.id)}
          className={Number(product.id) === selectedProductId ? 'product-card active' : 'product-card'}
          onClick={() => onSelect(product)}
          type="button"
        >
          <span className={`product-image tone-${index % 3}`} />
          <strong>{product.name}</strong>
          <small>{product.applicationScenario ?? '支持按需定制'}</small>
        </button>
      ))}
    </aside>
  );
}
```

- [ ] **Step 3: Create `QuoteParameterSections`**

Create `apps/client/src/components/quote/QuoteParameterSections.tsx`:

```tsx
import { quoteParameterSections, type QuoteParameterField } from '../../quoteParameterConfig';
import type { QuoteInput } from '../../types';

interface QuoteParameterSectionsProps {
  input: QuoteInput;
  onChange: <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => void;
}

export function QuoteParameterSections({ input, onChange }: QuoteParameterSectionsProps) {
  return (
    <>
      {quoteParameterSections.map((section) => (
        <section className="panel form-grid" key={section.key}>
          <div className="section-title form-section-title">
            <h2>{section.title}</h2>
            <span>{section.description}</span>
          </div>
          {section.fields.filter((field) => isVisible(field, input)).map((field) => (
            <QuoteField key={field.name} field={field} input={input} onChange={onChange} />
          ))}
        </section>
      ))}
    </>
  );
}

function QuoteField({
  field,
  input,
  onChange,
}: {
  field: QuoteParameterField;
  input: QuoteInput;
  onChange: <K extends keyof QuoteInput>(key: K, value: QuoteInput[K]) => void;
}) {
  const value = input[field.name];

  if (field.type === 'checkbox') {
    return (
      <label className="field field-checkbox">
        <input
          checked={Boolean(value)}
          onChange={(event) => onChange(field.name, event.target.checked as QuoteInput[keyof QuoteInput])}
          type="checkbox"
        />
        <span>{field.label}</span>
      </label>
    );
  }

  if (field.type === 'textarea') {
    return (
      <label className="field field-wide">
        <span>{field.label}</span>
        <textarea
          value={String(value ?? '')}
          placeholder={field.placeholder}
          onChange={(event) => onChange(field.name, event.target.value as QuoteInput[keyof QuoteInput])}
        />
      </label>
    );
  }

  return (
    <label className="field">
      <span>{field.label}</span>
      {field.type === 'select' ? (
        <select
          value={String(value ?? '')}
          onChange={(event) => onChange(field.name, event.target.value as QuoteInput[keyof QuoteInput])}
        >
          <option value="">请选择</option>
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          min={field.min}
          placeholder={field.placeholder}
          type={field.type === 'number' ? 'number' : 'text'}
          value={String(value ?? '')}
          onChange={(event) => {
            const next = field.type === 'number' ? Number(event.target.value) : event.target.value;
            onChange(field.name, next as QuoteInput[keyof QuoteInput]);
          }}
        />
      )}
    </label>
  );
}

function isVisible(field: QuoteParameterField, input: QuoteInput): boolean {
  if (!field.visibleWhen) {
    return true;
  }
  return Object.entries(field.visibleWhen).every(([key, expected]) => input[key as keyof QuoteInput] === expected);
}
```

- [ ] **Step 4: Create `QuoteResultPanel`**

Move the existing result panel from `Quote.tsx` into `apps/client/src/components/quote/QuoteResultPanel.tsx`, and replace garbled text with readable Chinese:

```tsx
import { getExtraFeeNotes } from '../../quoteFeeNotes';
import { getQuoteRequirementItems } from '../../quoteRequirements';
import type { QuoteResult } from '../../types';

const money = new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' });

export function QuoteResultPanel({ result }: { result: QuoteResult | null }) {
  if (!result) {
    return (
      <aside className="panel result-panel empty">
        <p className="eyebrow">报价结果</p>
        <h2>等待计算</h2>
      </aside>
    );
  }

  const feeNotes = getExtraFeeNotes(result.extraFees);
  const requirementItems = getQuoteRequirementItems(result).slice(0, 10);

  return (
    <aside className="panel result-panel">
      <p className="eyebrow">报价单 {result.quoteNo}</p>
      <h2>{money.format(result.summary.finalPrice)}</h2>
      <div className="unit-price">单价 {money.format(result.summary.unitPrice)} / 件</div>
      <dl>
        <div><dt>基础成本</dt><dd>{money.format(result.summary.baseCost)}</dd></div>
        <div><dt>材料成本</dt><dd>{money.format(result.material.cost)}</dd></div>
        <div><dt>印刷成本</dt><dd>{money.format(result.print.cost)}</dd></div>
        {result.processes.map((process) => (
          <div key={process.code}><dt>{process.name}</dt><dd>{money.format(process.cost)}</dd></div>
        ))}
        {result.extraFees.map((fee) => (
          <div key={fee.code}><dt>{fee.name}</dt><dd>{money.format(fee.amount)}</dd></div>
        ))}
      </dl>
      {requirementItems.length ? (
        <div className="requirement-summary">
          <strong>参数摘要</strong>
          {requirementItems.map((item) => (
            <span key={item.key}>{item.label}：{item.value}</span>
          ))}
        </div>
      ) : null}
      {feeNotes.length ? (
        <div className="quote-fee-note">
          <strong>费用说明</strong>
          <ul>
            {feeNotes.map((note) => <li key={note.code}>{note.name}</li>)}
          </ul>
        </div>
      ) : null}
    </aside>
  );
}
```

- [ ] **Step 5: Refactor `Quote.tsx`**

In `apps/client/src/pages/Quote.tsx`, remove local hardcoded option arrays and import:

```tsx
import { QuoteParameterSections } from '../components/quote/QuoteParameterSections';
import { QuoteProductSelector } from '../components/quote/QuoteProductSelector';
import { QuoteResultPanel } from '../components/quote/QuoteResultPanel';
import { getDefaultRequirementValues } from '../quoteParameterConfig';
```

Update `createDefaultQuote` to include:

```ts
    styleCount: 1,
    ...getDefaultRequirementValues(),
```

Replace inline product list with:

```tsx
      <QuoteProductSelector
        products={products}
        selectedProductId={selectedProductId}
        listRef={productListRef}
        onSelect={selectProduct}
      />
```

Replace the three hardcoded requirement panels with:

```tsx
          <QuoteParameterSections input={quoteInput} onChange={updateInput} />
```

Keep the template/material/print/shape/process controls in the page for now, because they depend on template options.

- [ ] **Step 6: Add styles**

In `apps/client/src/styles.css`, add:

```css
.field-checkbox {
  align-items: center;
  flex-direction: row;
  gap: 8px;
}

.field-checkbox input {
  width: 16px;
  height: 16px;
}

.requirement-summary {
  display: grid;
  gap: 6px;
  margin-top: 16px;
  color: #475569;
  font-size: 13px;
}

.requirement-summary strong {
  color: #111827;
  font-size: 14px;
}
```

- [ ] **Step 7: Run client build**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/client build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add apps/client/src/pages/Quote.tsx apps/client/src/components/quote apps/client/src/styles.css apps/client/src/quoteRequirements.ts
git commit -m "feat: refactor client label quote form"
```

---

### Task 5: Admin Rule and Quote Detail Updates

**Files:**
- Modify: `apps/admin/src/pages/QuoteRulesPage.tsx`
- Modify: `apps/admin/src/pages/QuotesPage.tsx`
- Modify: `apps/admin/src/quoteRequirements.ts`
- Modify: `apps/admin/src/styles.css`

- [ ] **Step 1: Build admin baseline**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/admin build
```

Expected before changes: PASS. If existing syntax/encoding issues fail the build, fix only build blockers and commit separately.

- [ ] **Step 2: Add condition field names**

In `apps/admin/src/pages/QuoteRulesPage.tsx`, extend `quoteConditionFieldNames`:

```ts
const quoteConditionFieldNames = new Set([
  'quantityRange',
  'widthRange',
  'heightRange',
  'styleCountRange',
  'customerTypes',
  'adhesiveTypes',
  'deliveryForms',
  'surfaceFinishes',
  'colorModes',
  'labelingMethods',
]);
```

- [ ] **Step 3: Add option constants**

Near existing `shapeTypeOptions`, add readable Chinese option lists matching frontend canonical values:

```ts
const adhesiveTypeOptions = [
  { label: '永久胶', value: 'permanent' },
  { label: '可移胶', value: 'removable' },
  { label: '强粘胶', value: 'strong' },
  { label: '冷冻胶', value: 'freezer' },
  { label: '耐高温胶', value: 'heat_resistant' },
];

const deliveryFormOptions = [
  { label: '卷装', value: 'roll' },
  { label: '张装', value: 'sheet' },
  { label: '单张裁切', value: 'sheet_cut' },
  { label: '折页 / 风琴折', value: 'fan_fold' },
];

const surfaceFinishOptions = [
  { label: '哑膜', value: 'matte_lamination' },
  { label: '亮膜', value: 'gloss_lamination' },
  { label: '哑油', value: 'matte_varnish' },
  { label: '光油', value: 'gloss_varnish' },
  { label: '防刮', value: 'scratch_resistant' },
  { label: '防水', value: 'waterproof' },
  { label: '白墨打底', value: 'white_ink' },
];

const colorModeOptions = [
  { label: '四色印刷', value: 'four_color' },
  { label: '单黑', value: 'black' },
  { label: '专色', value: 'spot_color' },
  { label: '四色 + 白墨', value: 'four_color_white_ink' },
  { label: '可变数据 / 条码', value: 'variable_data' },
];

const labelingMethodOptions = [
  { label: '手工贴标', value: 'manual' },
  { label: '自动贴标', value: 'automatic' },
  { label: '半自动贴标', value: 'semi_automatic' },
];
```

- [ ] **Step 4: Add form fields for conditions**

In the rule edit modal where condition JSON fields are rendered, add:

```tsx
<Divider orientation="left">标签参数条件</Divider>
<div className="quote-rule-config-grid">
  <Form.Item name={['conditionJson', 'styleCountRange']} label="款数范围">
    <Input placeholder="[1, 5]" />
  </Form.Item>
  <Form.Item name={['conditionJson', 'adhesiveTypes']} label="胶型">
    <Select mode="multiple" allowClear options={adhesiveTypeOptions} />
  </Form.Item>
  <Form.Item name={['conditionJson', 'deliveryForms']} label="交付形式">
    <Select mode="multiple" allowClear options={deliveryFormOptions} />
  </Form.Item>
  <Form.Item name={['conditionJson', 'surfaceFinishes']} label="表面处理">
    <Select mode="multiple" allowClear options={surfaceFinishOptions} />
  </Form.Item>
  <Form.Item name={['conditionJson', 'colorModes']} label="印刷颜色">
    <Select mode="multiple" allowClear options={colorModeOptions} />
  </Form.Item>
  <Form.Item name={['conditionJson', 'labelingMethods']} label="贴标方式">
    <Select mode="multiple" allowClear options={labelingMethodOptions} />
  </Form.Item>
</div>
```

If the existing modal flattens condition fields instead of nesting under `conditionJson`, adapt the field names to the local `toFormValues` and `toPayload` helpers, preserving the exact keys above in payload JSON.

- [ ] **Step 5: Add preview input fields**

In the quote preview modal, add fields for `styleCount`, `adhesiveType`, `deliveryForm`, `surfaceFinish`, `colorMode`, and roll details:

```tsx
<Form.Item name="styleCount" label="款数" initialValue={1}>
  <InputNumber min={1} style={{ width: '100%' }} />
</Form.Item>
<Form.Item name="adhesiveType" label="胶型">
  <Select allowClear options={adhesiveTypeOptions} />
</Form.Item>
<Form.Item name="deliveryForm" label="交付形式">
  <Select allowClear options={deliveryFormOptions} />
</Form.Item>
<Form.Item name="surfaceFinish" label="表面处理">
  <Select allowClear options={surfaceFinishOptions} />
</Form.Item>
<Form.Item name="colorMode" label="印刷颜色">
  <Select allowClear options={colorModeOptions} />
</Form.Item>
<Form.Item name="labelingMethod" label="贴标方式">
  <Select allowClear options={labelingMethodOptions} />
</Form.Item>
<Form.Item name="rollDirection" label="出标方向">
  <Input />
</Form.Item>
<Form.Item name="rollCoreMm" label="卷芯内径">
  <InputNumber min={0} style={{ width: '100%' }} />
</Form.Item>
<Form.Item name="piecesPerRoll" label="每卷数量">
  <InputNumber min={0} style={{ width: '100%' }} />
</Form.Item>
```

- [ ] **Step 6: Update quote detail display**

In `apps/admin/src/pages/QuotesPage.tsx`, where quote requirement items are rendered, ensure it uses `getQuoteRequirementItems(detail ?? snapshot)` and shows at least:

```tsx
<Divider orientation="left">标签参数</Divider>
<Descriptions column={2} size="small">
  {getQuoteRequirementItems(detail ?? snapshot).map((item) => (
    <Descriptions.Item key={item.key} label={item.label}>
      {item.value}
    </Descriptions.Item>
  ))}
</Descriptions>
```

- [ ] **Step 7: Run admin build**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/admin build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```powershell
git add apps/admin/src/pages/QuoteRulesPage.tsx apps/admin/src/pages/QuotesPage.tsx apps/admin/src/quoteRequirements.ts apps/admin/src/styles.css
git commit -m "feat: expose label parameters in admin quotes"
```

---

### Task 6: End-to-End Verification

**Files:**
- No planned source edits unless verification reveals a defect.

- [ ] **Step 1: Run backend unit tests**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api test
```

Expected: PASS.

- [ ] **Step 2: Run backend typecheck**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api typecheck
```

Expected: PASS.

- [ ] **Step 3: Build client**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/client build
```

Expected: PASS.

- [ ] **Step 4: Build admin**

Run:

```powershell
.\.tools\node\pnpm.CMD --dir apps/admin build
```

Expected: PASS.

- [ ] **Step 5: Manual smoke test in browser**

Start API and client in separate terminals:

```powershell
.\.tools\node\pnpm.CMD --dir apps/api start:dev
.\.tools\node\pnpm.CMD --dir apps/client dev
```

Open `http://127.0.0.1:5174/quote`.

Verify:

- Select a label product and template.
- Enter width, height, quantity, and `styleCount`.
- Select `卷装`, set roll direction, roll core, and pieces per roll.
- Select `四色 + 白墨` or `可变数据 / 条码`.
- Calculate quote.
- Result shows final price, unit price, extra fees, and parameter summary.
- Save quote after member session setup still succeeds or shows the existing login/session prompt.

- [ ] **Step 6: Manual admin smoke test**

Start admin:

```powershell
.\.tools\node\pnpm.CMD --dir apps/admin dev
```

Open `http://127.0.0.1:5173`.

Verify:

- Quote rule preview accepts label parameters.
- New condition keys appear in submitted rule JSON.
- Saved quote detail shows label parameters from snapshot.

- [ ] **Step 7: Final status**

Run:

```powershell
git status --short
git log --oneline -5
```

Expected: clean working tree except intentional uncommitted verification notes if any; recent commits correspond to tasks above.

