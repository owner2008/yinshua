import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateQuoteDto } from '../dto/create-quote.dto';
import { ProductTemplateConfig } from '../interfaces/pricing-config.interface';

@Injectable()
export class QuoteValidatorService {
  validate(dto: CreateQuoteDto, template: ProductTemplateConfig): void {
    if (dto.productId !== template.productId) {
      throw new BadRequestException('产品与报价模板不匹配');
    }

    if (dto.widthMm < template.widthMin || dto.widthMm > template.widthMax) {
      throw new BadRequestException('宽度不在模板允许范围内');
    }

    if (dto.heightMm < template.heightMin || dto.heightMm > template.heightMax) {
      throw new BadRequestException('高度不在模板允许范围内');
    }

    if (dto.quantity < template.quantityMin || dto.quantity > template.quantityMax) {
      throw new BadRequestException('数量不在模板允许范围内');
    }

    if (!template.materialIds.includes(dto.materialId)) {
      throw new BadRequestException('当前模板不支持所选材料');
    }

    if (!template.printModes.includes(dto.printMode)) {
      throw new BadRequestException('当前模板不支持所选印刷方式');
    }

    if (!template.shapeTypes.includes(dto.shapeType)) {
      throw new BadRequestException('当前模板不支持所选形状');
    }

    const unsupportedProcess = dto.processCodes.find(
      (code) => !template.processCodes.includes(code),
    );
    if (unsupportedProcess) {
      throw new BadRequestException(`当前模板不支持工艺：${unsupportedProcess}`);
    }

    if (dto.isProofing && !template.allowProofing) {
      throw new BadRequestException('当前模板不支持打样');
    }

    this.validateSupportedOption('胶型', dto.adhesiveType, template.adhesiveTypes);
    this.validateSupportedOption('交付形式', dto.deliveryForm, template.deliveryForms);
    this.validateSupportedOption('表面处理', dto.surfaceFinish, template.surfaceFinishes);
    this.validateSupportedOption('印刷颜色', dto.colorMode, template.colorModes);
    this.validateSupportedOption('贴标方式', dto.labelingMethod, template.labelingMethods);

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
  }

  private validateSupportedOption(label: string, value: string | undefined, supported: string[] | undefined): void {
    if (!value || !supported?.length) {
      return;
    }
    if (!supported.includes(value)) {
      throw new BadRequestException(`当前模板不支持所选${label}：${value}`);
    }
  }
}
