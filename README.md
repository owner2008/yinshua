# 不干胶印刷产品展示与报价系统

面向不干胶印刷业务的产品展示、参数化报价、会员、库存与后台配置系统。

本项目不是标准电商商城，而是围绕“印刷参数化报价”设计的业务系统。核心闭环是：

```text
产品展示 -> 输入报价参数 -> 后端按规则计算 -> 返回报价明细 -> 保存报价快照 -> 历史报价可追溯
```

## 项目定位

第一阶段目标：

- 产品展示
- 在线报价
- 报价规则配置
- 材料 / 工艺 / 印刷价格维护
- 报价快照留档
- 会员资料与历史报价
- 基础库存管理
- 后台操作日志与审计

暂不把第一阶段做成完整 ERP、生产系统、财务系统或标准商城。

## 技术栈

### 后端

- NestJS
- TypeScript
- Prisma ORM
- MySQL
- class-validator

### 规划中的前端

- 用户端：Taro + React + TypeScript，支持微信小程序 / H5
- 后台端：React + TypeScript + Ant Design，或 Vue 3 + Element Plus

## 目录结构

```text
apps/
  api/      NestJS 后端
  admin/    后台管理端
  client/   微信小程序 / H5 用户端占位
database/   SQL 草案与种子数据
docs/       API 文档与执行状态
scripts/    本地开发环境脚本
```

## 当前进度

已完成后端第一阶段主干：

- P0 项目启动与基础设计
- P1 后端报价闭环
- P2 后台核心配置 API
- P4 会员与历史报价 API
- P5 基础库存与审计 API

已完成第一版：

- 后台管理端页面

尚未开始：

- 用户端小程序 / H5 页面
- 真实微信登录 code2Session 与 JWT
- 真实 MySQL 环境下的完整联调

详细进度见：

- [执行状态](docs/execution-status.md)
- [开发落地执行文档](开发落地执行文档.md)

## 开发环境

本仓库内置了项目级便携 Node 环境，位于：

```text
.tools/node
```

该目录不会提交到 GitHub。新机器拉取代码后，可以自行安装 Node.js 22 LTS 与 pnpm，或重新准备本地运行时。

当前本地开发版本：

- Node.js 22.22.1
- npm 10.9.4
- pnpm 9.15.9

PowerShell 进入开发环境：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-env.ps1
```

CMD 进入开发环境：

```cmd
scripts\dev-env.cmd
```

如果已经全局安装 Node.js 和 pnpm，可以直接使用系统环境。

## 安装依赖

```powershell
pnpm --dir apps/api install
```

## 启动后端

```powershell
pnpm --dir apps/api start
```

开发模式：

```powershell
pnpm --dir apps/api start:dev
```

默认地址：

```text
http://127.0.0.1:3000/api
```

## 启动后台管理端

先启动后端，再启动管理端：

```powershell
pnpm --dir apps/admin install
pnpm --dir apps/admin dev
```

后台地址：

```text
http://127.0.0.1:5173
```

管理端通过 Vite 代理访问后端 `/api`。

## 数据库配置

复制环境变量文件：

```powershell
copy apps\api\.env.example apps\api\.env
```

修改 `apps/api/.env`：

```env
DATABASE_URL="mysql://root:password@127.0.0.1:3306/yinshua"
```

生成 Prisma Client：

```powershell
pnpm --dir apps/api prisma:generate
```

同步数据库结构：

```powershell
pnpm --dir apps/api prisma:push
```

写入开发种子数据：

```powershell
pnpm --dir apps/api db:seed
```

说明：当前后端支持数据库优先读取报价配置；未配置数据库或数据库不可用时，会回退到内存示例数据，便于开发期验证报价流程。

## 常用命令

```powershell
pnpm --dir apps/api typecheck
pnpm --dir apps/api build
pnpm --dir apps/api lint
pnpm --dir apps/admin build
```

当前已验证：

```text
typecheck 通过
build 通过
```

## 核心 API

### 报价

- `POST /api/quotes/calculate` 实时报价
- `POST /api/quotes` 保存报价
- `GET /api/admin/quotes` 后台报价列表
- `GET /api/admin/quotes/:quoteNo` 后台报价详情
- `GET /api/admin/quote-snapshots/:quoteNo` 报价快照

### 后台配置

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

### 会员

- `POST /api/auth/wx-login`
- `POST /api/auth/bind-mobile`
- `GET /api/member/profile`
- `PUT /api/member/profile`
- `GET /api/member/addresses`
- `POST /api/member/addresses`
- `GET /api/member/quotes`
- `GET /api/member/quotes/:quoteNo`

### 库存

- `GET /api/admin/warehouses`
- `POST /api/admin/warehouses`
- `PUT /api/admin/warehouses/:id`
- `GET /api/admin/stock-items`
- `GET /api/admin/stock-movements`
- `POST /api/admin/stock-movements`

完整 API 说明见：

- [API 文档](docs/api.md)

## 报价计算示例

请求：

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

- 面积：0.008 平方米
- 材料成本：64.80 元
- 印刷成本：200.00 元
- 覆膜成本：8.00 元
- 模切成本：130.00 元
- 包装费：20.00 元
- 基础成本：422.80 元
- 销售价：570.78 元
- 企业会员价：542.24 元
- 单价：0.1084 元/个

## 关键设计原则

1. 报价逻辑不得写在前端。
2. 后台改价只影响新报价。
3. 历史报价必须保存快照。
4. 产品展示与报价模板分离。
5. 报价与库存扣减解耦。
6. 价格、工艺、规则修改必须可审计。

## 下一步计划

1. 配置真实 MySQL 并完成完整联调。
2. 完善后台管理端编辑、删除、筛选和权限。
3. 实现用户端产品展示与在线报价页面。
4. 将微信登录占位逻辑替换为真实微信登录。
5. 增加接口测试与端到端验收用例。
