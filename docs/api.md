# API 设计说明

当前优先实现报价闭环 API，后续再补齐产品、会员、库存、后台配置的持久化接口。

## 1. 报价计算

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

## 2. 保存报价

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

## 4. 后续待实现 API

## 4. 数据库相关命令

在 `apps/api/.env` 中配置 `DATABASE_URL` 后执行：

```powershell
pnpm --dir apps/api prisma:push
pnpm --dir apps/api db:seed
```

当前后端支持数据库优先读取报价配置；如果数据库不可用，会自动回退到内存示例数据。

## 5. 后续待实现 API

产品：

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
- `GET /api/member/quotes/:id`
- `GET /api/member/addresses`
- `POST /api/member/addresses`

说明：`wx-login` 会返回会员 token。未配置 `WECHAT_APPID` / `WECHAT_APP_SECRET` 或传入 `mock_` 前缀 code 时，会使用开发期 mock openid；配置正式小程序密钥后会调用微信 code2Session。会员资料、地址、历史报价与保存报价接口需要携带 `Authorization: Bearer <member-token>`。

后台配置：

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
