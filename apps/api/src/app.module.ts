import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { AdminModule } from './modules/admin/admin.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { InventoryModule } from './modules/inventory/inventory.module';
import { MembersModule } from './modules/members/members.module';
import { QuotesModule } from './modules/quotes/quotes.module';

@Module({
  imports: [
    DatabaseModule,
    QuotesModule,
    AdminModule,
    MembersModule,
    AuthModule,
    InventoryModule,
    CatalogModule,
  ],
})
export class AppModule {}
