# API 设计说明

本文档包含早期报价 API 设计，**不是全部路由的现行清单**。2026-09-23 服务器同步后的源码没有 `POST /api/quotes/calculate`、`POST /api/quotes`；目前只有需管理员权限的 `POST /api/admin/quotes/calculate`、`POST /api/admin/quotes/preview`，以及会员历史报价读取。下面第 1、2 节的用户端写接口仍属待恢复设计，不能直接调用。当前状态见 `docs/current-development-progress.md`。

## 1. 报价计算（用户端接口待恢复）

### `POST /api/quotes/calculate`

只计算报价，不保存。

请求示例：

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

响应重点字段：

```json
{
  "quoteNo": "Q20260421213000001",
  "dimensions": {
    "widthMm": 100,
    "heightMm": 80,
    "areaM2": 0.008
  },
  "material": {
    "materialName": "透明 PET",
    "unitPrice": 1.5,
    "lossRate": 1.08,
    "cost": 64.8
  },
  "print": {
    "printMode": "four_color",
    "unitPrice": 0.03,
    "setupFee": 50,
    "cost": 200
  },
  "summary": {
    "baseCost": 422.8,
    "profitRate": 1.35,
    "salePrice": 570.78,
    "memberRate": 0.95,
    "finalPrice": 542.24,
    "unitPrice": 0.1084,
    "minPriceApplied": false
  }
}
```

## 2. 保存报价（用户端接口待恢复）

### `POST /api/quotes`

计算并保存报价，同时保存快照。

请求体同 `POST /api/quotes/calculate`。

需要在请求头携带用户端登录后获得的会员 token：

```http
Authorization: Bearer <member-token>
```

## 3. 后台报价查询

### `GET /api/admin/quotes`

查询当前已保存报价列表。

### `GET /api/admin/quotes/:quoteNo`

查询某个报价详情。

### `GET /api/admin/quote-snapshots/:quoteNo`

查询报价快照。快照必须包含：

- 输入参数。
- 规则集 ID。
- 规则版本。
- 材料价格。
- 印刷价格。
- 工艺价格。
- 利润系数。
- 会员系数。
- 最低收费。
- 最终计算结果。

## 4. 产品展示（用户端公开只读）

### `GET /api/catalog/home`

首页聚合数据：返回分类、热门产品（`isHot=true`，不足时用最新产品填充）、最新产品。

### `GET /api/catalog/categories`

启用状态的产品分类列表，按 `sort` 升序。

### `GET /api/catalog/products?categoryId=1`

按分类查询启用状态的产品；不带 `categoryId` 返回全部启用产品。

### `GET /api/catalog/products/:id`

返回产品详情，包含启用的报价模板及模板选项。停用或不存在的产品返回 404。

## 4.1 数据库相关命令

以下命令**只适用于新建的空开发/测试数据库**。本机已恢复服务器业务快照，不得对其执行：

```powershell
pnpm --dir apps/api prisma:push
pnpm --dir apps/api db:seed
```

当前后端支持数据库优先读取报价配置；如果数据库不可用，会自动回退到内存示例数据。

## 5. 其他 API 与规划

以下产品短路径为早期规划，当前公开产品读取走上面的 `/api/catalog/*`：

- `GET /api/products`
- `GET /api/products/:id`
- `GET /api/products/:id/templates`
- `GET /api/product-templates/:id/options`

会员：

- `POST /api/auth/wx-login`
- `POST /api/auth/bind-mobile`
- `GET /api/member/profile`
- `PUT /api/member/profile`
- `GET /api/member/quotes`
- `GET /api/member/quotes/:quoteNo`
- `GET /api/member/addresses`
- `POST /api/member/addresses`
- `PUT /api/member/addresses/:id`
- `PUT /api/member/addresses/:id/default`
- `DELETE /api/member/addresses/:id`

说明：`wx-login` 会返回会员 token。只有显式 `mock_` 前缀的 code 可走开发期 mock；真实微信 code 缺少 `WECHAT_APPID` / `WECHAT_APP_SECRET` 时会被拒绝，配置密钥后才调用微信 code2Session。会员资料、地址及历史报价读取需要携带 `Authorization: Bearer <member-token>`；会员保存报价的 HTTP 路由当前尚未恢复。

后台配置：

- `GET /api/admin/product-categories`
- `POST /api/admin/product-categories`
- `PUT /api/admin/product-categories/:id`
- `GET /api/admin/products`
- `POST /api/admin/products`
- `PUT /api/admin/products/:id`
- `GET /api/admin/product-templates`
- `POST /api/admin/product-templates`
- `PUT /api/admin/product-templates/:id`
- `GET /api/admin/materials`
- `POST /api/admin/materials`
- `PUT /api/admin/materials/:id`
- `GET /api/admin/material-prices`
- `POST /api/admin/material-prices`
- `GET /api/admin/processes`
- `POST /api/admin/processes`
- `PUT /api/admin/processes/:id`
- `GET /api/admin/process-prices`
- `POST /api/admin/process-prices`
- `GET /api/admin/print-prices`
- `POST /api/admin/print-prices`
- `GET /api/admin/quote-rule-sets`
- `POST /api/admin/quote-rule-sets`
- `PUT /api/admin/quote-rule-sets/:id`
- `GET /api/admin/quote-rules`
- `POST /api/admin/quote-rules`
- `PUT /api/admin/quote-rules/:id`
- `GET /api/admin/operation-logs`
- `GET /api/admin/warehouses`
- `POST /api/admin/warehouses`
- `PUT /api/admin/warehouses/:id`
- `GET /api/admin/stock-items`
- `GET /api/admin/stock-movements`
- `POST /api/admin/stock-movements`
- `GET /api/admin/admin-users`
- `POST /api/admin/admin-users`
- `PUT /api/admin/admin-users/:id`
- `GET /api/admin/admin-roles`
- `POST /api/admin/admin-roles`
- `PUT /api/admin/admin-roles/:id`
- `GET /api/admin/admin-permissions`

后台配置类写操作会记录操作日志，包含模块、动作、目标对象、before_json、after_json 和创建时间。

后台权限管理接口需要 `admin:permission` 权限码。

库存流水 `movementType` 支持：

- `in`：入库，增加库存。
- `out`：出库，减少库存，库存不足会拒绝。
- `adjust`：调整，将库存设置为提交数量。
