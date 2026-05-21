import { Controller, Post, UseGuards } from '@nestjs/common';
import { AdminAuthGuard } from '../../auth/admin-auth.guard';
import { RequireAdminPermission } from '../../auth/admin-permission.decorator';
import { StaticSitePublisherService } from '../services/static-site-publisher.service';

@Controller('admin/static-site')
@UseGuards(AdminAuthGuard)
@RequireAdminPermission('admin:content')
export class AdminStaticSiteController {
  constructor(private readonly publisher: StaticSitePublisherService) {}

  @Post('publish')
  publish() {
    return this.publisher.publish();
  }
}
