# 当前开发进度与后续计划

本文档用于快速恢复项目上下文。重新打开项目时，优先阅读本文，再按需查看 `docs/execution-status.md` 和 `docs/content-management-qa-checklist.md`。

更新时间：2026-09-24

## 当前基准：服务器同步后的实际工程

- 正式官网由阿里云服务器上的 WordPress 提供；仓库里的 `apps/client` 是另一套企业展示 H5，不能把它的构建结果当成 WordPress 官网发布文件。见 `docs/wordpress-site-and-domain-2026-09-23.md`。
- 当前 H5 路由只有首页、企业/产品等展示页和会员中心，**没有**在线报价或历史报价页面；当前小程序只有首页、产品列表、产品详情和“我的”，**没有**报价或历史页面。下文 2026-04 的前端报价完成记录是当时阶段的历史记录，不代表服务器同步后的当前源码仍包含这些页面。
- 当前 API 保留报价计算、持久化服务以及后台试算/查询接口，但没有公开或会员侧的 `POST /api/quotes/calculate`、`POST /api/quotes` 路由；会员侧仅有历史报价读取接口。因此不能把旧文档中的“用户端报价闭环”视为已验收。恢复此功能前需确定它应进入现有官网、独立 H5，还是小程序。
- 服务器同步后的本地 `yinshua` 数据库是业务快照，禁止在其上执行 `prisma:push`、`db:seed` 或集成测试；测试只使用独立的一次性库。
- 独立 H5 已移除首页加载时对后台私有 `/admin/product-templates` 的无效请求，并把旧的“不干胶报价”浏览器标题改为公司名称；本机 5174 预览返回 200，类型检查与构建通过。此改动仍在本地源码，尚未发布到服务器。
- 安全收口：API 已于 2026-09-24 发布修复版，模拟微信登录默认关闭，旧模拟会员 token 默认被拒绝，手机号绑定必须携带会员 token 且只更新当前用户。独立 H5 本地源码已取消自动模拟登录和未登录资料表单，但**服务器 H5 仍是旧包**；代理拦截不得提前移除。
- 安全收口（线上临时保护）：公网 8088 的代理已暂时拒绝 `/api/auth/wx-login`、`/api/auth/bind-mobile` 和 `/api/member/`；8088 首页/产品接口及正式 WordPress 官网仍返回 200，受保护接口返回 403。此时 8088 会员功能不可用，不能作为真机联调入口。现行配置见 `deploy/nas/nginx-live-20260923.conf`，恢复条件和备份见 `docs/8088-member-auth-safeguard-2026-09-23.md`。
- 后台默认账号：线上遗留的默认管理员已停用，另一名具有权限管理权限的管理员仍启用。API 已发布无默认密码/环境变量回退、无角色不自动授予全权限的版本；新启动命令不执行 seed。管理员/会员签名密钥已轮换，现有管理员须重新登录。见 `docs/admin-account-security-2026-09-23.md`。
- 2026-09-24 阿里云 8088 已运行安全版 API：镜像 `localhost/qddflc-api-runtime:20260924`，命令 `node dist-auth-20260924/src/main.js`；模拟身份及无 token 会员操作直接访问 API 返回 401，公开目录和首页返回 200，代理仍对三个会员入口返回 403。WordPress 官网独立运行并返回 200。旧 H5 未发布修复，真实微信登录未端到端验收。
- 8088 偶发产品 500 的主要原因是容器混用 Podman 与阿里云 DNS，内部数据库名间歇性解析失败。API 和代理现已仅使用 Podman DNS `10.89.0.1`；轮换凭据后连续 70 次目录请求均为 200。发布时数据库跟随短暂重启，API 出现一次启动期 `P1001`，随后复查无持续错误。MySQL 应用/root 密码及 API 签名密钥已轮换，运行容器与正式配置核对一致；root 专用数据库快照与新凭据回退文件在服务器，细节见 `deploy/aliyun/README.md`。
- 服务器 `podman-compose` 1.0.6 的 `--force-recreate` 不会可靠应用新镜像/命令；后续发布须先备份，再按依赖顺序移除 8088 代理和 API，使用校验过的单份 Compose 创建。不可把旧 Compose 备份直接恢复到生产，也不可移除会员代理拦截。

## 2026-09-23：P6 自动检查准备

- API 单元/集成测试和后台、H5 构建脚本已改为跨系统调用 `node`，不再写死本机的 `.tools/node/node.exe`。
- 新增 `.github/workflows/ci.yml`，计划在 GitHub 的临时 MySQL 8.4 服务中建空库、导入种子并执行 API 类型检查、38 个单元测试、9 个集成测试，以及 API、后台和 H5 构建。工作流已通过 `actionlint`，但 GitHub 首次运行尚未验证。
- 本机 API 类型检查及 38 个单元测试通过，其中新补了报价边界、模拟身份及后台默认账号安全验收；后台与 H5 的类型检查、Vite 构建通过，构建结果写入 E 盘临时目录，未覆盖服务器同步的 `dist`。
- 集成测试使用 E 盘独立 MySQL 数据目录和 `127.0.0.1:3307/yinshua_ci`，建表、种子及 9 个测试均通过；覆盖目录/会员地址 HTTP 接口、手机号绑定权限及旧模拟会话拒绝。测试命令现在先检查 `DATABASE_URL` 必须指向本机 `yinshua_ci` 或 `yinshua_test_*`，再用 TypeScript 编译保留 Nest 装饰器元数据；误指向恢复的业务库时已验证会拒绝运行。临时编译结果只写入系统临时目录并在测试结束后清理，未覆盖服务器同步的 `dist`，也未向业务库写入测试数据。
- **未发布到 GitHub**：当前 OAuth 授权没有 `workflow` scope，GitHub 拒绝包含 `.github/workflows/ci.yml` 的推送。远程分支仍停留在先前的线上站点修复提交；获得用户授权并完成推送后，必须检查 GitHub Actions 的实际结果，才能把 CI 标记为已完成。

## 最新进展

### 2026-04-27：新增首页与报价体验重设计需求

已新增需求文档：`docs/frontend-home-quote-redesign-requirements.md`。

需求要点：

- H5 与小程序首页需要参考主流不干胶 / 标签印刷网站重新设计布局和排版。
- 允许对当前前台显示设计进行较大修改。
- 原则是布局合理、使用方便、不过分堆砌内容、美观舒适、操作方便。
- 首页建议重构为：首屏 Hero、快速产品入口、热门产品 / 典型应用、快速报价引导、材料与工艺能力、企业与设备能力、服务流程、联系转化。
- 报价系统建议评估补充：交付形式、贴标方式、出标方向、卷芯与分卷、文件与样稿、材料胶性 / 使用环境、表面处理、印刷颜色与特殊印刷、包装与发货。
- 第一阶段可以先做信息架构与视觉重排，报价字段扩展可分批纳入。

### 2026-04-27：推进首页信息架构与视觉重排第一版

已完成：

- H5 首页重构为更接近印刷行业网站的转化路径：
  - 首屏 Hero：品牌价值、主图、立即报价、查看产品。
  - 快速产品入口：前置高频分类。
  - 常用产品与应用：产品卡片增加“看详情”和“按此报价”。
  - 快速报价引导：提示尺寸、数量、材料、工艺等报价参数。
  - 材料与工艺能力：集中展示常用材料和常用工艺。
  - 服务流程：选择产品、填写参数、确认样稿、生产交付。
  - 企业与设备能力：下移展示，作为信任增强内容。
- 小程序首页同步调整信息架构：
  - 首屏优先展示立即报价。
  - 分类和推荐产品前置。
  - 材料工艺和服务流程中段展示。
  - 企业介绍、设备能力、更多 Banner 下移。
  - 推荐产品支持“按此报价”，会写入 `yinshua_quote_product` 并跳转报价页。
- H5 自定义 Banner 链接和推荐 Banner 链接均兼容外部链接。

本轮已通过验证：

```powershell
pnpm --dir apps/client build
```

待继续：

- 使用浏览器和微信开发者工具做视觉验收。
- 根据真机截图继续调整间距、字号、图片比例和首屏信息密度。
- 下一步再启动报价字段扩展，优先补充交付形式、贴标方式、出标方向、卷芯与分卷、文件与样稿等字段。

### 2026-04-27：扩展行业询价字段第一版

已完成：

- 后端 `CreateQuoteDto` 增加行业常用询价项：
  - 交付形式。
  - 贴标方式。
  - 出标 / 卷标方向。
  - 卷芯内径。
  - 每卷数量。
  - 胶性。
  - 使用环境。
  - 表面处理。
  - 印刷颜色。
  - 是否已有设计文件。
  - 设计文件地址。
  - 是否需要设计协助。
  - 是否需要样稿确认。
  - 包装与发货要求。
  - 期望交期。
  - 补充说明。
- 报价保存时将新增字段写入 `processOptionsJson.requirements`，同时完整进入报价快照 `snapshot.input`。
- H5 在线报价页新增两组表单：
  - 交付与贴标。
  - 材料环境与文件。
- 小程序在线报价页同步新增基础询价项。
- 这些字段当前暂作为询价需求保存，不参与精确报价公式，避免影响既有报价结果。

本轮已通过验证：

```powershell
pnpm --dir apps/api typecheck
pnpm --dir apps/api test
pnpm --dir apps/api test:integration
pnpm --dir apps/client build
```

待继续：

- 在历史报价详情和后台报价详情中展示新增询价项。
- 后续按业务规则逐步把部分字段纳入计价，例如卷装分卷、白墨、可变数据、特殊胶性、包装和加急交期。

### 2026-04-27：新增询价项展示收口

已完成：

- H5 报价历史列表中展示已保存的询价需求摘要。
- 后台报价详情弹窗中新增“询价需求”中文字段展示，保留原 JSON 快照用于排查。
- 小程序报价历史支持点击报价卡片展开询价需求。
- 新增 H5 与后台各自的询价字段中文映射工具，便于后续复用到报价详情页或导出。

本轮已通过验证：

```powershell
pnpm --dir apps/admin build
pnpm --dir apps/client build
```

待继续：

- 将部分询价项纳入计价规则，例如：
  - 交付形式影响分卷 / 裁切 / 包装费用。
  - 白墨、可变数据、特殊表面处理进入工艺价格。
  - 特殊胶性 / 使用环境影响材料可选项和材料价格。
  - 期望交期与加急规则联动。

### 2026-04-27：询价项参与计价第一版

已完成：

- 后端报价引擎将部分行业询价项计入 `extraFees`：
  - `colorMode` 包含白墨时，增加白墨打底费。
  - `colorMode` 包含可变数据时，增加可变数据费。
  - `surfaceFinish` 为防刮 / 防水时，增加表面保护处理费。
  - `deliveryForm=卷装` 且填写每卷数量时，按卷数增加分卷包装费。
  - `deliveryForm=单张裁切` 时，增加单张裁切整理费。
  - `deliveryForm=折叠 / 风琴折` 时，增加折叠整理费。
- 上述费用作为附加费用返回，不强行写入模板工艺列表，避免与现有模板可选工艺冲突。
- 报价快照 `pricing.requirementFees` 会记录这些由询价项产生的费用。
- H5 报价结果增加提示：已根据白墨、可变数据、表面处理、分卷或裁切等询价项计入附加费用。
- 小程序报价结果展示完整 `extraFees` 列表。
- 新增报价计算单元测试，覆盖新增询价项附加费。

本轮已通过验证：

```powershell
pnpm --dir apps/api typecheck
pnpm --dir apps/api test
pnpm --dir apps/api test:integration
pnpm --dir apps/client build
```

待继续：

- 后台将这些附加费规则配置化，而不是写在代码常量里。
- 在后台报价规则或系统参数中维护白墨、可变数据、防护处理、分卷、裁切整理等费用。
- 前端根据模板和材料动态显示可用的特殊计价项。

### 2026-04-27：第一阶段内容管理收口推进

已完成：

- 后端补充 Banner 业务校验：
  - 当跳转类型不是 `none` 时，必须填写跳转值。
  - 结束时间不能早于开始时间。
  - 时间格式不正确时返回业务错误。
- 后端补充内容图片上传 MIME 校验：
  - 仅允许 `image/jpeg`、`image/png`、`image/webp`、`image/gif`、`image/svg+xml`。
  - 不支持的 MIME 类型返回 `UnsupportedMediaTypeException`。
- 新增内容管理集成测试：
  - 企业介绍保存与前台目录读取。
  - 首页头部保存与前台目录读取。
  - Banner 保存、过期过滤、审计日志。
  - 分类设备展示保存与前台目录读取。
  - Banner 非法跳转值与非法时间范围。
  - 内容图片上传成功与非法 MIME 拒绝。

本轮已通过验证：

```powershell
pnpm --dir apps/api typecheck
pnpm --dir apps/api test
pnpm --dir apps/api test:integration
pnpm --dir apps/api build
pnpm --dir apps/admin build
pnpm --dir apps/client build
```

说明：

- 后台构建通过，但仍有 Ant Design vendor chunk 体积提示；这是构建警告，不影响当前第一阶段功能验收。
- 第一阶段还剩人工验收：按 `docs/content-management-qa-checklist.md` 在后台、H5、小程序端逐项检查展示与跳转。

## 项目定位

本项目是面向不干胶印刷业务的产品展示与参数化报价系统，不是标准电商商城。

核心闭环：

```text
产品展示 -> 输入报价参数 -> 后端按规则计算 -> 返回报价明细 -> 保存报价快照 -> 历史报价追踪
```

第一阶段重点：

- 产品展示
- 在线报价
- 报价规则配置
- 材料 / 工艺 / 印刷价格维护
- 报价快照留档
- 会员资料与历史报价
- 基础库存管理
- 后台权限、操作日志与审计
- 内容管理与首页展示配置

## 当前完成情况

### 后端 API

已完成主干能力：

- NestJS 后端骨架
- Prisma + MySQL 接入
- 报价计算、保存、快照、后台报价查询
- 产品分类、产品、报价模板管理
- 材料、材料价格、工艺、工艺价格、印刷价格管理
- 报价规则集与规则明细管理
- 会员登录占位、会员资料、会员地址、历史报价
- 仓库、库存项、库存流水
- 后台管理员、角色、权限码与权限守卫
- 操作日志与配置审计
- 公开目录接口 `/api/catalog/*`
- 内容管理接口：企业介绍、首页头部、Banner、分类设备展示、内容图片上传

已验证过：

- `pnpm --dir apps/api test`
- `pnpm --dir apps/api test:integration`
- API 可使用真实 MySQL 完成报价计算、保存、快照、会员历史查询链路

### 后台管理端

技术栈：React + Vite + TypeScript + Ant Design。

已完成页面：

- 登录与会话
- 产品分类管理
- 产品与报价模板管理
- 材料与材料价格管理
- 工艺、工艺价格、印刷价格管理
- 报价规则集与规则明细管理
- 报价单列表与详情
- 仓库、库存项、库存流水
- 操作日志
- 后台权限管理
- 内容管理：企业介绍、首页头部、Banner、分类设备展示、图片上传

已验证过：

- `pnpm --dir apps/admin build`

### H5 用户端

技术栈：React + Vite + TypeScript。

已完成页面：

- 首页
- 产品列表
- 产品详情
- 在线报价
- 历史报价
- 会员中心

当前 H5 已接入：

- 首页 Banner、品牌头部、企业介绍、设备展示
- 产品分类、热门产品、最新上架
- 产品详情与模板配置
- 报价计算与保存
- 会员 mock 登录 token
- 历史报价查询
- 会员资料与地址
- 多主题视觉样式基础

已验证过：

- `pnpm --dir apps/client build`

### 微信小程序

已完成原生小程序工程，微信开发者工具通过根目录 `project.config.json` 指向 `apps/miniprogram/`。

已完成页面：

- 首页
- 产品列表
- 产品详情
- 在线报价
- 历史报价
- 我的

当前小程序已接入：

- `wx.login` 到 `/api/auth/wx-login`
- 本地 API 配置在 `apps/miniprogram/config.js`
- 首页内容、产品目录、产品详情
- 在线报价、保存报价、历史报价
- 会员资料与地址
- 首页视觉与 H5 保持同一业务结构

## 当前未收口事项

优先级从高到低：

1. 内容管理功能完整验收
   - 按 `docs/content-management-qa-checklist.md` 检查企业介绍、首页头部、Banner、设备展示、图片上传。
   - 确认后台保存后，H5 与小程序首页都能正确展示。
   - 确认上传图片 URL 可直接访问。
   - 自动化接口层已补充，剩余重点是浏览器和微信开发者工具中的人工验收。

2. 真实微信登录
   - 配置正式 `WECHAT_APPID` / `WECHAT_APP_SECRET`。
   - 用真实微信 `code2Session` 替换开发期 mock code。
   - 确认会员 token 与用户身份绑定正确。

3. 小程序真机联调
   - 配置 request 合法域名，或本地开发关闭合法域名校验。
   - 用微信开发者工具和真机验证首页、产品、报价、历史、会员中心。

4. 自动化测试补齐
   - 补 `ProductCategory`、`/api/catalog/*`、会员地址 PUT/DELETE、内容管理接口、上传接口的集成测试。
   - 增加后台和 H5 页面级 smoke 测试。

5. 部署工程化
   - 补 Docker / Nginx / CI。
   - 统一跑 API typecheck/test/integration 与前端 build。
   - 明确生产环境变量、上传目录、静态资源访问路径。

6. H5 / 小程序首页与报价体验重设计
   - 需求文档见 `docs/frontend-home-quote-redesign-requirements.md`。
   - 优先做首页信息架构和视觉排版重构。
   - 报价字段扩展分批做，先保证快照可保存完整输入。

## 后续开发计划

### 阶段一：当前内容管理收口

目标：把最近一轮内容管理和首页改版稳定成可验收版本。

任务：

- 按 `docs/content-management-qa-checklist.md` 完成手工验收。
- 验证后台配置在 H5 与小程序同步展示。
- 验证图片上传和静态访问。
- 补内容管理相关接口测试。
- 跑通 API、后台、H5 构建与测试命令。

完成标准：

- 后台可配置
- 图片可上传
- H5 可展示
- 小程序可展示
- 跳转行为正确
- 构建通过

### 阶段二：微信登录与小程序真机

目标：从开发期 mock 登录切换到真实微信身份链路。

任务：

- 配置 `WECHAT_APPID` / `WECHAT_APP_SECRET`。
- 验证真实 `wx.login` code 到后端 `wx-login`。
- 验证保存报价、历史报价、会员中心都使用真实会员身份。
- 配置小程序 request 合法域名。
- 完成微信开发者工具和真机联调。

完成标准：

- 真机可以浏览首页、产品、产品详情。
- 真机可以计算并保存报价。
- 真机可以查看当前微信用户自己的历史报价。
- 图片资源加载正常。

### 阶段三：后台运营能力补强

目标：让后台更接近日常运营可用状态。

任务：

- 内容管理增加更清晰的启停、排序、预览状态。
- Banner 跳转目标改为选择器，减少手填错误。
- 产品、分类、设备展示之间优化关联编辑体验。
- 会员管理增加会员详情、报价记录、地址记录。
- 报价单增加状态流转：待跟进、已联系、已成交、已作废。
- 操作日志增加按操作人、模块、时间范围筛选。

### 阶段四：前台转化体验优化

目标：让用户从看产品到完成报价更顺畅。

任务：

- 按 `docs/frontend-home-quote-redesign-requirements.md` 重构 H5 与小程序首页布局。
- 首页避免内容堆砌，形成“品牌首屏 -> 分类入口 -> 热门产品 -> 快速报价 -> 材料工艺 -> 企业能力 -> 转化入口”的清晰路径。
- 产品详情页强化“按此产品报价”入口。
- 报价页根据模板动态限制材料、工艺、印刷方式，避免无效组合。
- 报价页补充行业常用项：交付形式、贴标方式、出标方向、卷芯与分卷、文件与样稿、材料胶性 / 使用环境、表面处理、特殊印刷、包装与发货。
- 报价结果增加保存、联系客服、修改参数、再次报价。
- 历史报价支持再次报价。
- 统一 H5 与小程序关键文案、状态提示和错误处理。

### 阶段五：部署与工程化

目标：支持测试环境或生产环境部署。

任务：

- 增加 Docker Compose。
- 增加 Nginx 配置。
- 增加 CI 流程。
- 增加页面级 smoke 测试。
- 整理生产环境变量模板。
- 明确上传目录持久化方案。

## 本次新增进展：询价项附加费规则配置化

完成时间：2026-04-27

已完成：
- 报价规则 `configJson` 支持配置行业询价项附加费：白墨、可变数据、防刮/防水表面处理、分卷、单张裁切、折叠整理。
- `QuoteCalcService` 不再硬编码这些附加费金额，统一读取当前命中的报价规则配置。
- `seed.ts` 默认规则已写入对应配置项，现有报价结果保持兼容。
- 单元测试新增“规则覆盖附加费”用例，验证后台规则调整会反映到报价结果。

验证命令：
- `corepack pnpm --dir apps/api typecheck`
- `corepack pnpm --dir apps/api test`
- `corepack pnpm --dir apps/api test:integration`
- `corepack pnpm --dir apps/client build`

下一步建议：
- 在后台价格/规则管理页暴露这些附加费参数，支持运营人员可视化调整。
- 报价结果页继续补强费用说明，让客户能理解白墨、分卷、表面处理等费用来源。

## 本次新增进展：后台报价规则附加费可视化编辑

完成时间：2026-04-27

已完成：
- 后台“报价规则”编辑弹窗将报价配置从单一 JSON 文本框拆成结构化数字字段。
- 基础报价配置可直接编辑：损耗系数、利润系数、会员系数、最低报价、包装费、加急费率。
- 行业询价附加费可直接编辑：白墨、可变数据、防护处理、分卷、单张裁切、折叠整理。
- 保留“其他配置 JSON”，用于保存暂未结构化展示的扩展字段，保存时会与结构化字段合并。
- 新增后台样式 `.quote-rule-config-grid`，让配置项在弹窗内保持清晰的多列布局。

验证命令：
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 在报价结果页补充更清楚的费用说明，帮助客户理解白墨、分卷、表面处理等附加费用来源。
- 后续可继续给报价规则增加更友好的规则集选择器，减少手填规则集编号。

## 本次新增进展：报价结果费用说明

完成时间：2026-04-27

已完成：
- H5 报价结果页新增“费用说明”，对白墨、可变数据、防水/防刮处理、分卷、单张裁切、折叠整理等附加费逐项解释。
- 小程序报价结果同步新增费用说明列表，接口返回的 `extraFees` 会在前端补充可读说明。
- 保留原有费用明细展示，费用说明只在存在行业附加费时出现。

验证命令：
- `corepack pnpm --dir apps/client build`
- `node --check apps/miniprogram/pages/quote/index.js`

下一步建议：
- 优化报价规则编辑里的“规则集编号”为下拉选择，减少后台运营手填错误。
- 或继续补历史报价详情页的费用说明，让客户回看报价时也能看懂费用来源。

## 本次新增进展：报价规则集下拉选择

完成时间：2026-04-27

已完成：
- 后台“报价规则”页新增规则集列表读取，筛选栏不再只从已有规则反推编号。
- 新增报价规则时，规则集编号改为可搜索下拉选择，显示规则集编号、名称、场景和模板编号。
- 规则表格的规则集列改为可读标签，减少只看数字编号带来的识别成本。
- 刷新报价规则页时会同步刷新规则明细与规则集数据。

验证命令：
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 继续补历史报价详情页的费用说明，让客户和后台人员回看报价时也能看懂费用来源。
- 或进入小程序真机联调阶段，验证报价、保存、历史查看在真实微信环境下的链路。

## 本次新增进展：历史报价费用说明

完成时间：2026-04-27

已完成：
- H5 抽出 `quoteFeeNotes.ts`，当前报价结果与历史报价共用同一套附加费说明文案。
- H5 历史报价从保存快照读取 `extraFees`，在有行业附加费时展示费用说明。
- 小程序历史报价展开详情时同步展示费用说明，覆盖白墨、可变数据、防护处理、分卷、单张裁切、折叠整理。

验证命令：
- `corepack pnpm --dir apps/client build`
- `node --check apps/miniprogram/pages/history/index.js`

下一步建议：
- 进入小程序真机联调阶段，验证报价、保存、历史查看在真实微信环境下的链路。
- 或继续补后台报价详情里的费用说明，让运营查看客户报价时也能快速理解费用来源。

## 本次新增进展：后台报价详情费用说明

完成时间：2026-04-29

已完成：
- 后台报价单详情弹窗新增“费用说明”区块。
- 后台报价详情可展示白墨、可变数据、防护处理、分卷、单张裁切、折叠整理等行业附加费的金额与解释。
- 新增后台 `quoteFeeNotes.ts`，将费用说明文案从页面中抽离，便于后续复用到导出或打印报价单。
- 后台 `Quote` 类型补充 `extraFees` 字段，和后端报价结果保持一致。

验证命令：
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 进入小程序真机联调阶段，验证报价、保存、历史查看在真实微信环境下的链路。
- 或为后台报价单增加状态流转、跟进备注和筛选，增强运营处理报价的能力。

## 本次新增进展：后台列表软删除入口

完成时间：2026-04-29

已完成：
- 后台主要运营列表新增“删除 / 恢复”操作，删除采用软删除方式，不破坏历史报价、库存流水和审计数据。
- 产品分类、产品、报价模板、材料、工艺、报价规则集、报价规则、Banner、分类设备展示、仓库、会员、管理员、角色列表默认只展示启用数据。
- 被删除的数据会切换为停用 / 禁用状态，可通过状态筛选找回并恢复。
- 报价模板补充 `status` 编辑与更新能力，便于在后台隐藏不再使用的模板。
- 价格历史、库存流水、报价单和操作日志仍保持不可删除，保证业务追溯链路完整。

验证命令：
- `corepack pnpm --dir apps/api typecheck`
- `corepack pnpm --dir apps/api test`
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 在页面级 smoke 测试中覆盖删除、筛选停用、恢复三段流程。
- 后续如确实需要物理删除，可按单个模块增加“仅允许未被引用数据删除”的后端校验。

## 本次新增进展：后台报价单运营跟进

完成时间：2026-04-29

已完成：
- 后台报价单列表新增跟进状态筛选、状态列和最新跟进备注列。
- 报价单支持在列表中点击“跟进”，维护状态：草稿、待跟进、已联系、已成交、已作废。
- 跟进备注保存到报价单 `processOptionsJson.followRemark`，不改变原报价快照。
- 后端新增 `PUT /api/admin/quotes/:quoteNo/status`，用于更新报价单状态和最新跟进备注。
- 报价单详情同步展示跟进状态和跟进备注。
- 每次后台跟进会写入操作日志，便于后续追溯运营处理动作。
- 新增 `QuoteService` 单元测试，覆盖状态更新、备注保留和快照不变。

验证命令：
- `corepack pnpm --dir apps/api test -- src/modules/quotes/services/quote.service.test.ts`
- `corepack pnpm --dir apps/api typecheck`
- `corepack pnpm --dir apps/api test`
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 在操作日志页增加“报价跟进”快捷筛选，方便查看某张报价单的全部跟进记录。
- 后续可增加报价单详情里的跟进记录时间线，而不只是展示最新备注。

## 本次新增进展：报价规则编辑公式说明

完成时间：2026-04-29

已完成：
- 后台“报价规则”编辑弹窗新增只读的“报价计算公式”说明。
- 公式说明按计算顺序展示：面积、材料费、印刷费、工艺费、附加费、基础成本、销售价、最终报价、单价。
- 补充说明这些配置只影响新报价，历史报价仍以快照为准。
- 该改动只增强运营理解，不改变后端实际报价计算逻辑。

验证命令：
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 后续可在报价结果或规则编辑中增加试算入口，用一组参数即时预览当前规则会算出什么价格。

## 本次新增进展：报价规则 JSON 配置表单化

完成时间：2026-04-29

已完成：
- 后台“报价规则”编辑弹窗将原“条件配置 JSON”改为通俗表单：最小/最大数量、最小/最大宽度、最小/最大高度、适用客户类型。
- 规则列表的“条件”和“配置”列改为中文摘要，不再直接展示整段 JSON。
- 保留“高级匹配条件 JSON”，用于后续扩展暂未表单化的匹配条件。
- 原“其他配置 JSON”改名为“高级扩展配置 JSON”，并补充说明：上方结构化字段会覆盖同名配置。
- 后端实际识别逻辑不变，保存时仍会组装成原有 `conditionJson` / `configJson` 数据结构。

验证命令：
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 后续可把规则命中预览做成“试算”功能，输入尺寸、数量和客户类型后提示会命中哪条规则。

## 本次新增进展：报价规则试算 / 命中预览

完成时间：2026-04-29

已完成：
- 后端新增后台试算接口 `POST /api/admin/quotes/preview`，复用真实报价匹配、校验和计算链路，但不创建报价单、不保存快照。
- 试算结果返回 `matchedRule`，包含命中的规则集编号、规则编号、版本号和完整规则配置，方便运营判断规则是否命中正确。
- 数据库规则匹配结果补充 `ruleId`，内存兜底规则也会返回基础规则编号。
- 后台“报价规则”页新增“规则试算”按钮，可输入产品、模板、尺寸、数量、材料、印刷方式、工艺、客户类型、打样和加急参数。
- 试算输入已从手填编号/编码升级为产品、报价模板、材料、工艺下拉选择，模板会随产品联动筛选。
- 工艺计费方式从 `feeMode` 枚举改为运营可读文案，例如固定费用、按面积计费、开机费 + 按数量计费。
- 试算弹窗展示命中规则、关键系数、基础成本、销售价、最终报价、单价、工艺费和附加费拆分。
- 新增 `QuoteService.preview` 单元测试，覆盖预览不持久化、返回命中规则元信息和报价结果。

验证命令：
- `corepack pnpm --dir apps/api test -- src/modules/quotes/services/quote.service.test.ts`
- `corepack pnpm --dir apps/api typecheck`
- `corepack pnpm --dir apps/api test`
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 继续把报价单详情里的产品、模板、材料也转换为名称展示，减少后台列表里的编号阅读成本。

## 本次新增进展：后台报价单名称化展示

完成时间：2026-04-29

已完成：
- 后台“报价单”列表将产品编号、模板编号改为产品名称/编码和报价模板名称展示。
- 报价单搜索支持按产品名称、产品编码和模板名称匹配，减少运营查单时记编号的成本。
- 报价单详情新增材料、印刷方式、形状、工艺的中文展示。
- 报价金额统一格式化为人民币金额，跟进、询价需求和费用说明功能保持不变。

验证命令：
- `corepack pnpm --dir apps/admin build`

下一步建议：
- 进入小程序真机联调阶段，验证真实微信登录、报价保存、历史报价查看链路。

## 本次新增进展：小程序真机联调准备

完成时间：2026-04-29

已完成：
- 后端微信登录收紧真实 code 校验：只有显式 `mock_` code 允许走开发 mock；真实 `wx.login` code 在缺少 `WECHAT_APPID` / `WECHAT_APP_SECRET` 时会直接失败。
- `apps/api/.env.example` 补充 `WECHAT_APPID`、`WECHAT_APP_SECRET`、`MEMBER_AUTH_SECRET`、`ADMIN_AUTH_SECRET` 示例项。
- 新增后端单元测试，覆盖真实微信 code 缺少密钥必须拒绝，以及本地 `mock_` code 仍可用于开发。
- 新增小程序 `project.config.json`，用于微信开发者工具导入项目并替换真实 AppID。
- 新增 `apps/miniprogram/config.real-device.example.js`，用于真机联调时切换到 HTTPS API 域名。
- 新增 `docs/miniprogram-real-device-checklist.md`，整理真实 AppID/AppSecret、request 合法域名、微信登录、报价保存、历史报价查看的联调步骤和常见错误。

验证命令：
- `corepack pnpm --dir apps/api typecheck`
- `corepack pnpm --dir apps/api test`
- `node --check apps/miniprogram/utils/api.js`
- `node --check apps/miniprogram/pages/quote/index.js`
- `node --check apps/miniprogram/pages/history/index.js`
- `node --check apps/miniprogram/config.real-device.example.js`

下一步建议：
- 等拿到真实 `WECHAT_APPID`、`WECHAT_APP_SECRET` 和 HTTPS API 域名后，按 `docs/miniprogram-real-device-checklist.md` 在微信开发者工具和真机上逐项验收。

## 常用启动命令

本机已按服务器版本恢复数据库；不要在这份快照上运行 `prisma:push` 或 `db:seed`。详情见 `docs/aliyun-server-sync-2026-09-23.md`。

```powershell
powershell -ExecutionPolicy Bypass -File scripts\dev-env.ps1
. .\scripts\start-mysql.ps1
cd apps\api
..\..\.tools\node\node.exe dist\src\main.js
```

后台和前台请另开终端：

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

## 常用验证命令

集成测试会修改数据库，运行前必须显式设置 `DATABASE_URL` 指向本机一次性 `yinshua_ci` 或 `yinshua_test_*`；脚本会拒绝恢复的业务库。API 构建会覆盖本地保存的服务器发布文件；在这份快照上直接运行的仅应是不写库的单元测试和类型检查。

```powershell
pnpm --dir apps/api typecheck
pnpm --dir apps/api build
pnpm --dir apps/api test
pnpm --dir apps/api test:integration
pnpm --dir apps/admin build
pnpm --dir apps/client build
```

## 重点文档索引

- `docs/aliyun-server-sync-2026-09-23.md`：服务器基准同步范围、数据快照、校验和限制。
- `docs/execution-status.md`：详细执行状态。
- `docs/api.md`：API 说明。
- `docs/content-management-qa-checklist.md`：内容管理验收清单。
- `docs/frontend-theme-system.md`：前台主题系统说明。
- `docs/frontend-home-quote-redesign-requirements.md`：H5 / 小程序首页与报价体验重设计需求。
- `开发落地执行文档.md`：阶段性落地执行计划。

## 下一次打开项目建议顺序

1. 先读本文档和 `docs/aliyun-server-sync-2026-09-23.md`。
2. 看 `git status --short`，确认当前未提交改动范围。
3. 如继续内容管理，直接按 `docs/content-management-qa-checklist.md` 验收。
4. 如继续小程序，先配置真实微信参数与合法域名。
5. 开发前先跑构建或测试，确认当前基线。
