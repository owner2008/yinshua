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

- 已新增 `ProductCategory` Prisma 模型与迁移 SQL，`Product` 表补充 `sort`、`isHot` 字段。
- 已实现产品分类管理 API（`GET/POST/PUT /admin/product-categories`），含 before/after 审计。
- 已预置不干胶印刷行业常用分类：铜版纸、PET/透明、PVC/合成纸、热敏物流、食品饮料、日化美妆、电子电器、医药保健、防伪易碎、特殊工艺、包装封口、可移除标签。
- 已实现产品管理 API，表单支持选择所属分类、封面图、详情图集、状态、首页热门与排序；新增产品提交的状态字段已纳入后端校验与保存。
- 已实现报价模板管理 API。
- 已为每款示例产品配置独立模板与选项（PET / 铜版纸 / 烫金 / 热敏），并补齐热敏纸材料与 `hot_stamp` 工艺；每个模板对应独立的 retail / enterprise 规则集。
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
- 已实现会员地址列表、新增、更新、设为默认、删除 API，默认地址切换在同用户下互斥。
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

### 后台管理端页面

- 已使用 React + Vite + Ant Design 搭建后台管理端。
- 已实现基础布局与侧边导航。
- 已新增产品分类管理页面，支持新增、编辑、启停与排序，菜单项使用 `admin:product` 权限码控制。
- 已实现产品与报价模板页面。
- 已实现材料与材料价格页面。
- 已实现工艺、工艺价格、印刷价格页面。
- 已实现报价规则集与规则明细页面。
- 已实现报价单列表页面。
- 已实现仓库、库存项、库存流水页面。
- 已实现操作日志页面。
- 已补充产品、报价模板、材料、材料价格的筛选、编辑、停用与当前价格筛选体验。
- 已补充工艺、工艺价格、印刷价格、报价规则集、报价规则明细的筛选、编辑、启停与价格筛选体验。
- 已补充仓库、库存项、库存流水、报价单、操作日志的筛选、详情与关键操作体验。
- 已新增后台开发期登录页、管理员 token 签发、前端会话保存、退出与写接口 Bearer token 守卫。
- 已新增后台管理员、角色、权限 Prisma 模型与 seed，后台登录会优先使用数据库管理员账号，数据库不可用时回退到环境变量开发账号。
- 已实现后台写接口按权限码拦截，并按登录账号权限过滤后台菜单与写操作入口。
- 已将报价单查询与操作日志查询纳入后台权限码保护，报价单使用 `admin:quote`，操作日志使用 `admin:audit-log`。
- 已新增后台权限管理页面与接口，支持管理员创建/编辑、角色创建/编辑、角色权限分配与权限码查看，统一使用 `admin:permission` 权限码。
- 已补充后台权限管理自保护规则，禁止停用或移除最后一个拥有 `admin:permission` 的启用管理员入口。
- 已修正报价模板选项更新时无法清空旧选项的问题。
- 已优化后台前端包体积，页面改为懒加载，React、Ant Design、页面代码分 chunk 输出，并修复后台 build 脚本对系统旧 Node 的依赖。
- 已通过 `pnpm --dir apps/admin build`。
- 已新增 API 自动化测试脚本与基础用例，覆盖报价样例计算、管理员/会员 token、权限 Guard、权限管理自保护规则。
- 已新增 API 集成测试脚本，使用真实 MySQL 验证报价计算、保存、报价快照持久化、会员历史报价与详情查询链路。
- 已扩展 API 集成测试，覆盖后台权限管理角色/管理员写操作、角色权限绑定、管理员角色绑定、审计日志写入与最后权限管理员保护规则。

### P3：用户端核心流程

- 已修复切换产品时报价参数不跟随变动的问题：当前产品没有模板时直接展示空状态，不再静默回退到其他产品的模板；每款示例产品的材料/工艺/印刷/形状选项都来自自身模板。
- 已使用 React + Vite + TypeScript 搭建用户端 H5 第一版。
- 已接入 `react-router-dom` 将 H5 拆分为多页：首页、产品列表、产品详情、在线报价、历史报价、会员中心。
- 首页提供 Banner、分类入口、热门产品与最新上架区块，数据来自 `GET /api/catalog/home`。
- 产品列表页支持按分类筛选，接入 `GET /api/catalog/products`。
- 产品详情页展示封面、说明、应用场景、图集（若配置）与关联报价模板，接入 `GET /api/catalog/products/:id`。
- 在线报价页延续原报价表单，可通过 `?productId=` 自动选中当前产品。
- 会员中心页展示基础资料、收货地址，支持编辑资料与新增地址，接入 `/member/profile` 与 `/member/addresses`。
- 公共目录接口 `/api/catalog/*` 为只读无鉴权；写操作仍走带会员 token 的接口。
- 已接入 `POST /api/quotes/calculate` 生成报价明细。
- 已接入 `POST /api/quotes` 保存报价。
- 已接入 `GET /api/member/quotes` 查询历史报价。
- 已新增用户端会员 token，保存报价、会员报价历史与详情查询改为从 Bearer token 识别当前用户。
- 用户端 H5 已接入开发期自动 mock 微信登录，保存报价与历史报价不再硬编码 `userId=1`。
- 产品与模板配置优先读取后端接口，接口不可用时使用内置样例数据支撑前端开发。
- 已通过 `pnpm --dir apps/client build`。
- 已新增原生微信小程序工程，微信开发者工具通过根 `project.config.json` 指向 `apps/miniprogram/`。
- 小程序已实现报价页，支持产品/模板/材料/印刷/形状/工艺/客户类型选择，接入 `POST /api/quotes/calculate` 与 `POST /api/quotes`。
- 小程序已实现历史报价页，接入 `GET /api/member/quotes`，使用会员 Bearer token 读取当前用户报价历史。
- 小程序已接入 `wx.login` 到 `POST /api/auth/wx-login`，本地 API 地址集中配置在 `apps/miniprogram/config.js`。
- 小程序已新增首页 / 产品列表 / 产品详情 / 会员中心页，tabBar 扩展为 5 个入口（首页 / 产品 / 报价 / 历史 / 我的），与 H5 页面结构一致。
- 小程序首页与产品列表接入 `GET /api/catalog/home` / `GET /api/catalog/categories` / `GET /api/catalog/products`，产品详情接入 `GET /api/catalog/products/:id`。
- 小程序会员中心接入 `GET/PUT /member/profile` 与 `GET/POST /member/addresses`，长按地址可通过 ActionSheet 设默认或删除。
- 前台产品展示已由后台配置驱动：后台可维护产品分类、封面图、详情图集、说明、应用场景、热门与排序；H5 与小程序首页、列表、详情页均优先展示后台配置内容。

## 当前实现说明

当前报价引擎已经支持数据库读取报价配置。如果未配置 `DATABASE_URL`，或数据库不可用，会自动使用内存示例配置，便于开发期继续验证报价流程。

本地最简启动顺序：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-env.ps1
. .\scripts\start-mysql.ps1
pnpm --dir apps/api prisma:push
pnpm --dir apps/api db:seed
pnpm --dir apps/api start:dev
pnpm --dir apps/admin dev
pnpm --dir apps/client dev
```

本地真实 MySQL 已完成验证：

- 已执行 `prisma db push`，MySQL `yinshua` schema 已同步。
- 已执行 seed，报价基础配置、管理员、角色与权限数据已写入数据库。
- 已补充 API 启动时加载 `.env`，避免运行时未读取 `DATABASE_URL` 而回退到内存数据。
- 已验证后台报价单/操作日志未带 token 返回 401，管理员登录后返回 200。
- 已验证后台权限管理接口未带 token 返回 401，超级管理员登录后可查询管理员、角色与权限码。
- 已验证停用最后一个权限管理员、清空最后一个权限角色权限都会返回 400。
- 已验证用户端报价计算、微信占位登录、保存报价、会员历史报价与详情查询链路。
- 已验证用户端保存报价未带会员 token 返回 401，mock 微信登录后带 token 保存与历史查询成功。
- 已通过 `pnpm --dir apps/api test`，当前 10 个 API 自动化测试全部通过。
- 已通过 `pnpm --dir apps/api test:integration`，当前 3 个 MySQL 集成测试通过。

## 下一步优先级

1. 配置正式小程序 `WECHAT_APPID` / `WECHAT_APP_SECRET`，用真实微信 code 校验替换开发期 mock code。
2. 配置小程序 request 合法域名或本地开发"不校验合法域名"，完成微信开发者工具与真机联调。
3. 为 `ProductCategory` 管理、`/api/catalog/*` 与会员地址 PUT/DELETE 路由补充集成测试。
4. 补充 Docker / Nginx / CI 脚本，统一运行 API typecheck/test/test:integration 与前端 build。
5. 为后台管理端补充页面级 smoke 测试。

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
