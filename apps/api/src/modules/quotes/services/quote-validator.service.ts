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
  }
}
