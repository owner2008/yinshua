import { Body, Controller, HttpCode, HttpStatus, PayloadTooLargeException, Post, UseGuards } from '@nestjs/common';
import { mkdir, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import { UploadContentAssetDto } from '../dto/admin-content.dto';

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const MIME_EXTENSION_MAP: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/svg+xml': '.svg',
};

@Controller('admin')
@UseGuards(AdminAuthGuard)
@RequireAdminPermission('admin:content')
export class AdminContentAssetsController {
  @Post('content-assets')
  @HttpCode(HttpStatus.CREATED)
  async upload(@Body() dto: UploadContentAssetDto) {
    const buffer = decodeBase64(dto.contentBase64);
    if (buffer.byteLength > MAX_UPLOAD_BYTES) {
      throw new PayloadTooLargeException('Image file is too large.');
    }

    const uploadDir = join(process.cwd(), 'uploads', 'content');
    await mkdir(uploadDir, { recursive: true });

    const extension = resolveExtension(dto.fileName, dto.mimeType);
    const fileName = `${Date.now()}-${randomUUID()}${extension}`;
    const absolutePath = join(uploadDir, fileName);

    await writeFile(absolutePath, buffer);

    return {
      url: `/uploads/content/${fileName}`,
      fileName,
      size: buffer.byteLength,
    };
  }
}

function decodeBase64(value: string) {
  const normalized = value.includes(',') ? value.slice(value.indexOf(',') + 1) : value;
  return Buffer.from(normalized, 'base64');
}

function resolveExtension(fileName: string, mimeType: string) {
  const rawExtension = extname(fileName).toLowerCase();
  if (rawExtension) {
    return rawExtension;
  }
  return MIME_EXTENSION_MAP[mimeType] ?? '.bin';
}
