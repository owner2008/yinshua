import { Module } from '@nestjs/common';
import { AdminAccessController } from './controllers/admin-access.controller';
import { AdminMaterialsController } from './controllers/admin-materials.controller';
import { AdminMembersController } from './controllers/admin-members.controller';
import { AdminOperationLogsController } from './controllers/admin-operation-logs.controller';
import { AdminProcessesController } from './controllers/admin-processes.controller';
import { AdminProductCategoriesController } from './controllers/admin-product-categories.controller';
import { AdminProductsController } from './controllers/admin-products.controller';
import { AdminQuoteRulesController } from './controllers/admin-quote-rules.controller';
import { AdminAccessService } from './services/admin-access.service';
import { AdminMaterialsService } from './services/admin-materials.service';
import { AdminMembersService } from './services/admin-members.service';
import { AdminProcessesService } from './services/admin-processes.service';
import { AdminProductCategoriesService } from './services/admin-product-categories.service';
import { AdminProductsService } from './services/admin-products.service';
import { AdminQuoteRulesService } from './services/admin-quote-rules.service';
import { AuditLogService } from './services/audit-log.service';

@Module({
  controllers: [
    AdminProductCategoriesController,
    AdminProductsController,
    AdminMaterialsController,
    AdminMembersController,
    AdminProcessesController,
    AdminQuoteRulesController,
    AdminOperationLogsController,
    AdminAccessController,
  ],
  providers: [
    AdminAccessService,
    AdminProductCategoriesService,
    AdminProductsService,
    AdminMaterialsService,
    AdminMembersService,
    AdminProcessesService,
    AdminQuoteRulesService,
    AuditLogService,
  ],
})
export class AdminModule {}
