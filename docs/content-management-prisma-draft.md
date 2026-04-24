# 内容管理 Prisma 表结构草案

本文档用于补充以下三类内容管理能力的 Prisma 建模草案：

- 企业介绍
- 首页 Banner / logo
- 分类设备展示

适用阶段：需求细化与后端建模准备阶段。

## 1. 设计原则

- 图片文件本体存对象存储，数据库只保存 URL、标题、说明、排序、状态等元数据。
- 富文本正文建议先存 `Text`，由后台统一输出 HTML 或 Markdown。
- 与首页聚合展示相关的数据，建议优先通过 `/api/catalog/home` 统一返回。
- 与产品分类已有关系的内容，直接复用 `ProductCategory` 主键，不重复建分类表。

## 2. Prisma 草案

```prisma
model CompanyProfile {
  id             BigInt    @id @default(autoincrement())
  title          String    @db.VarChar(128)
  subtitle       String?   @db.VarChar(255)
  coverImage     String?   @map("cover_image") @db.VarChar(512)
  galleryJson    Json?     @map("gallery_json")
  content        String?   @db.Text
  contactPhone   String?   @map("contact_phone") @db.VarChar(32)
  contactWechat  String?   @map("contact_wechat") @db.VarChar(64)
  address        String?   @db.VarChar(255)
  sort           Int       @default(0)
  status         String    @default("active") @db.VarChar(32)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@map("company_profiles")
}

model HomepageBranding {
  id             BigInt    @id @default(autoincrement())
  siteName       String    @map("site_name") @db.VarChar(128)
  siteSubtitle   String?   @map("site_subtitle") @db.VarChar(255)
  logoImage      String?   @map("logo_image") @db.VarChar(512)
  headerNotice   String?   @map("header_notice") @db.VarChar(255)
  status         String    @default("active") @db.VarChar(32)
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@map("homepage_branding")
}

model HomepageBanner {
  id             BigInt    @id @default(autoincrement())
  title          String    @db.VarChar(128)
  subtitle       String?   @db.VarChar(255)
  imageUrl       String    @map("image_url") @db.VarChar(512)
  mobileImageUrl String?   @map("mobile_image_url") @db.VarChar(512)
  linkType       String    @default("none") @map("link_type") @db.VarChar(32)
  linkValue      String?   @map("link_value") @db.VarChar(255)
  buttonText     String?   @map("button_text") @db.VarChar(64)
  sort           Int       @default(0)
  status         String    @default("active") @db.VarChar(32)
  startAt        DateTime? @map("start_at")
  endAt          DateTime? @map("end_at")
  createdAt      DateTime  @default(now()) @map("created_at")
  updatedAt      DateTime  @updatedAt @map("updated_at")

  @@index([status, sort])
  @@map("homepage_banners")
}

model CategoryEquipmentShowcase {
  id           BigInt           @id @default(autoincrement())
  categoryId   BigInt           @map("category_id")
  name         String           @db.VarChar(128)
  title        String?          @db.VarChar(128)
  description  String?          @db.Text
  imageUrl     String?          @map("image_url") @db.VarChar(512)
  galleryJson  Json?            @map("gallery_json")
  specsJson    Json?            @map("specs_json")
  sort         Int              @default(0)
  status       String           @default("active") @db.VarChar(32)
  createdAt    DateTime         @default(now()) @map("created_at")
  updatedAt    DateTime         @updatedAt @map("updated_at")
  category     ProductCategory  @relation(fields: [categoryId], references: [id])

  @@index([categoryId, status, sort])
  @@map("category_equipment_showcases")
}
```

## 3. 后台字段映射建议

### 3.1 企业介绍

- `title`：企业介绍标题
- `subtitle`：副标题
- `coverImage`：企业介绍首图
- `galleryJson`：企业介绍多图
- `content`：正文
- `contactPhone`：联系电话
- `contactWechat`：微信号
- `address`：地址

### 3.2 首页 Banner / logo

- `HomepageBranding.siteName`：品牌名称
- `HomepageBranding.siteSubtitle`：品牌副标题
- `HomepageBranding.logoImage`：logo 图片
- `HomepageBranding.headerNotice`：顶部通知
- `HomepageBanner.*`：首页轮播配置

### 3.3 分类设备展示

- `categoryId`：所属分类
- `name`：设备名称
- `title`：展示标题
- `description`：说明文案
- `imageUrl`：主图
- `galleryJson`：详情图
- `specsJson`：规格参数

## 4. API 草案

- `GET /api/admin/company-profile`
- `POST /api/admin/company-profile`
- `PUT /api/admin/company-profile/:id`
- `GET /api/admin/homepage-branding`
- `POST /api/admin/homepage-branding`
- `PUT /api/admin/homepage-branding/:id`
- `GET /api/admin/homepage-banners`
- `POST /api/admin/homepage-banners`
- `PUT /api/admin/homepage-banners/:id`
- `GET /api/admin/category-equipment-showcases`
- `POST /api/admin/category-equipment-showcases`
- `PUT /api/admin/category-equipment-showcases/:id`
- `GET /api/company-profile`
- `GET /api/homepage-branding`
- `GET /api/homepage-banners`
- `GET /api/category-equipment-showcases`

## 5. 前台聚合返回建议

建议将首页展示统一聚合到：

- `GET /api/catalog/home`

建议新增返回字段：

- `branding`
- `banners`
- `companyProfile`
- `categoryEquipmentShowcases`

这样 H5 与小程序首页可以共用同一套接口结构。
