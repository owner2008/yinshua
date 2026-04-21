# 执行状态

本文档记录按 `开发落地执行文档.md` 的当前执行进度。

## 已完成

### P0：项目启动与基础设计

- 已建立仓库级目录结构。
- 已新增根 `package.json`。
- 已新增第一阶段执行说明。
- 已新增数据库草案 `database/schema.sql`。
- 已新增开发种子数据 `database/seeds/dev.sql`。
- 已新增 API 说明 `docs/api.md`。

### P1：后端核心报价闭环

- 已建立 NestJS 后端骨架。
- 已实现 `CreateQuoteDto`。
- 已实现报价参数校验服务。
- 已实现报价规则匹配服务。
- 已实现报价计算服务。
- 已实现报价快照服务。
- 已实现报价聚合服务。
- 已实现报价计算、保存、后台查询、快照查询接口。
- 已接入 Prisma ORM。
- 已建立 Prisma 数据模型。
- 已实现报价配置数据库读取，数据库不可用时回退到内存示例数据。
- 已实现报价单与报价快照数据库持久化骨架。
- 已新增 Prisma seed 脚本。
- 已通过 `typecheck` 和 `build`。

### P2：后台核心配置

- 已实现产品管理 API。
- 已实现报价模板管理 API。
- 已实现模板可选材料、工艺、印刷方式、形状配置。
- 已实现材料管理 API。
- 已实现材料价格管理 API，新价格会使旧 current 价格失效。
- 已实现工艺管理 API。
- 已实现工艺价格管理 API，新价格会使旧 current 价格失效。
- 已实现印刷价格管理 API，新价格会使旧 current 价格失效。
- 已实现报价规则集管理 API。
- 已实现报价规则明细管理 API。
- 已实现操作日志模型与查询 API。
- 已为产品、报价模板、材料、材料价格、工艺、工艺价格、印刷价格、报价规则集、报价规则明细接入 before / after 审计日志。
- 已通过 `typecheck` 和 `build`。

### P4：会员与历史报价

- 已新增用户、会员等级、会员档案、会员地址 Prisma 模型。
- 已实现微信登录占位 API，便于开发期创建用户。
- 已实现手机号绑定 API。
- 已实现会员资料查询与维护 API。
- 已实现会员地址列表与新增 API。
- 已实现用户侧历史报价列表与详情 API。
- 已支持保存报价时关联用户 ID，便于历史报价查询。
- 已通过 `typecheck` 和 `build`。

### P5：库存、日志与审计

- 已实现操作日志与后台配置审计。
- 已新增仓库、库存项、库存流水 Prisma 模型。
- 已实现仓库列表、新增、更新 API。
- 已实现库存项列表 API。
- 已实现库存流水列表 API。
- 已实现库存流水新增 API，支持入库、出库、调整。
- 出库时会校验库存不足。
- 报价流程仍不扣库存，符合“报价与库存解耦”的约束。
- 已通过 `typecheck` 和 `build`。

## 当前实现说明

当前报价引擎已经支持数据库读取报价配置。如果未配置 `DATABASE_URL`，或数据库不可用，会自动使用内存示例配置，便于开发期继续验证报价流程。

待连接真实 MySQL 后验证：

- `pnpm --dir apps/api prisma:push`
- `pnpm --dir apps/api db:seed`
- `pnpm --dir apps/api start`

## 下一步优先级

1. 配置真实 MySQL `DATABASE_URL` 并执行 `prisma db push`。
2. 执行 seed，验证报价数据从数据库读取。
3. 实现后台管理端页面。
4. 实现用户端产品和报价页面。
5. 将微信登录占位逻辑替换为真实微信 code 校验与 JWT。
6. 连接真实 MySQL 后执行完整接口联调。

## 验收用报价样例

输入：

```json
{
  "productId": 1,
  "productTemplateId": 1,
  "widthMm": 100,
  "heightMm": 80,
  "quantity": 5000,
  "materialId": 2,
  "printMode": "four_color",
  "shapeType": "rectangle",
  "processCodes": ["lamination", "die_cut"],
  "isProofing": false,
  "isUrgent": false,
  "customerType": "company"
}
```

期望核心结果：

- 面积：0.008 平方米。
- 材料成本：64.80 元。
- 印刷成本：200.00 元。
- 覆膜成本：8.00 元。
- 模切成本：130.00 元。
- 包装费：20.00 元。
- 基础成本：422.80 元。
- 销售价：570.78 元。
- 企业会员价：542.24 元。
- 单价：0.1084 元/个。
