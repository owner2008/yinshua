# 不干胶印刷产品展示与报价系统

面向不干胶印刷业务的产品展示、参数化报价、会员、库存与后台配置系统。

**2026-09-23 当前基准：**正式 `qddflc.com` 官网运行在阿里云 WordPress；本仓库的 `apps/client` 是另一套 React H5，不是官网主题。以服务器为准同步后，当前 H5 和原生小程序均没有在线报价/历史报价页面，后端也没有会员侧的报价创建路由。下文的“第一阶段目标”是产品规划，不表示这些入口已经上线。实际进度见 [当前开发进度](docs/current-development-progress.md)。

公网 8088 的会员登录和会员资料接口目前因旧发布版使用开发模拟身份而**临时关闭**；首页与产品展示仍可用，正式 WordPress 官网不受影响。本地源码已修复，尚待安全发布后再开放会员功能。操作记录见 [8088 会员接口临时保护](docs/8088-member-auth-safeguard-2026-09-23.md)。

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

### 当前前端

- 正式官网：WordPress + PHP 主题
- 独立 H5：React + Vite + TypeScript
- 微信小程序：原生小程序工程
- 后台端：React + Vite + TypeScript + Ant Design

## 目录结构

```text
apps/
  api/      NestJS 后端
  admin/    后台管理端
  client/   独立 React H5 企业展示端
  miniprogram/  原生微信小程序
  wordpress-theme/  当前 WordPress 官网主题源码
database/   SQL 草案与种子数据
deploy/wordpress/  官网 Nginx 配置
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

当前保留的第一版：

- 后台管理端页面
- H5 企业展示、产品与会员页面
- 微信小程序首页、产品与会员页面
- 后端报价服务、后台试算与历史报价读取能力；会员创建报价的 HTTP 入口尚未恢复

当前仍待收口：

- 真实微信登录 code2Session 对接
- 小程序真机联调与合法域名配置
- H5/小程序报价入口及会员报价创建路由是否恢复、恢复到哪套前端
- 后台及 H5 的页面级 smoke 测试（GitHub Actions CI 已通过）

详细进度见：

- [当前开发进度与后续计划](docs/current-development-progress.md)
- [阿里云服务器同步记录（2026-09-23）](docs/aliyun-server-sync-2026-09-23.md)
- [WordPress 官网与域名切换记录（2026-09-23）](docs/wordpress-site-and-domain-2026-09-23.md)
- [执行状态](docs/execution-status.md)
- [H5 与小程序首页及报价体验重设计需求](docs/frontend-home-quote-redesign-requirements.md)
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

PowerShell 在当前终端加载开发环境：

```powershell
. .\scripts\dev-env.ps1
```

CMD 进入开发环境：

```cmd
scripts\dev-env.cmd
```

如果已经全局安装 Node.js 和 pnpm，可以直接使用系统环境。

## 最简启动

当前本机已恢复阿里云数据库快照。不要对这份数据执行 `prisma:push` 或 `db:seed`；它们只适用于新建的空开发库。先在项目根目录启动本地数据库：

```powershell
. .\scripts\dev-env.ps1
. .\scripts\start-mysql.ps1
```

后端、后台、前台分别在独立终端启动。后端以下命令运行与服务器一致的已发布构建，且会自动读取 `apps/api/.env`：

```powershell
cd apps\api
..\..\.tools\node\node.exe dist\src\main.js
```

```powershell
pnpm --dir apps/admin dev
pnpm --dir apps/client dev
```

常用地址：

```text
API:    http://127.0.0.1:3000/api
Admin:  http://127.0.0.1:5173
Client: http://127.0.0.1:5174
```

快速验收命令：

```powershell
pnpm --dir apps/api test
```

集成测试会写入数据库，只能显式指向本机一次性 `yinshua_ci` 或 `yinshua_test_*` 库；脚本会拒绝业务库。重新构建前后端会覆盖本地保存的服务器发布文件；需要保持发布文件逐字节一致时不要运行构建命令或 `scripts/start-all.ps1`。

当前已验证：

```text
本地 MySQL 可启动
apps/api 38 个单元测试通过
apps/api 9 个独立 MySQL 集成测试通过
apps/admin build 通过
apps/client build 通过
GitHub Actions CI 已在 master 首次运行通过（run 35941497214）
```

## 安装依赖

```powershell
pnpm --dir apps/api install
```

## 启动后端

以下 `nest start` 会按当前源码重新编译，可能覆盖本机保留的服务器发布构建。要保持同步文件原样，请使用上方“最简启动”的 `dist` 命令。

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

当前本机已配置并恢复服务器数据库，`apps/api/.env` 已存在。以下复制配置、推送结构和写入种子数据的步骤仅适用于全新的空开发库，不要对这份服务器快照执行。

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

历史开发阶段验证过构建；服务器同步后的本地 API `dist` 保持原样，未在其目录重新构建。当前已重新验证类型检查、单元测试和独立数据库集成测试：

```text
typecheck 通过
test 38/38 通过
test:integration 9/9 通过
```

## 核心 API

### 报价

- `POST /api/admin/quotes/calculate` 后台报价计算，需 `admin:quote`
- `POST /api/admin/quotes/preview` 后台规则试算，需 `admin:quote-rule`
- `GET /api/admin/quotes` 后台报价列表
- `GET /api/admin/quotes/:quoteNo` 后台报价详情
- `GET /api/admin/quote-snapshots/:quoteNo` 报价快照
- `GET /api/member/quotes`、`GET /api/member/quotes/:quoteNo` 登录会员历史报价读取

当前代码**没有** `POST /api/quotes/calculate` 或 `POST /api/quotes` 路由；旧阶段文档中的用户端报价接口不能直接用于现行 H5/小程序。

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
