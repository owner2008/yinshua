# 阿里云服务器同步记录（2026-09-23）

## 基准与范围

- 服务器：阿里云轻量应用服务器，公网 IP `39.106.169.147`。
- 服务器部署目录：`/opt/yinshua/current`。运行中的 `qddflc-web` 和 `qddflc-api` 容器挂载了该目录下的 `dist` 和 `api`。
- 本地同步分支：`codex/sync-from-aliyun-20260923`；同步前提交：`1841609`。
- 本次只从服务器读取文件，没有改动云端服务、数据库或文件。

## 已同步

| 服务器目录 | 本地目录 | 文件数 |
| --- | --- | ---: |
| `api/src` | `apps/api/src` | 79 |
| `api/dist` | `apps/api/dist` | 241 |
| `dist` | `apps/client/dist` | 52 |
| `dist/admin` | `apps/admin/dist` | 6 |

同时同步了 `api/package.json`、`api/pnpm-lock.yaml`、`api/tsconfig.json`、`api/nest-cli.json`、`api/prisma/schema.prisma` 和 `api/prisma/seed.ts`。服务器文件先下载至 `E:\Codex\CodexCache\yinshua-weixin\tmp\aliyun-sync-20260923\remote`，与服务器逐文件 SHA-256 校验，372 个文件全部一致；落到项目目录后再次校验，上表各目录均无差异。同步前本地 `apps/api/src`、`apps/api/dist` 和 `apps/admin/dist` 已备份到同一暂存目录的 `local-backup` 下。

## 未同步与限制

- 服务器没有可编辑的前台、后台前端源码，只有发布后的 `dist`。本地 `apps/client/src` 和 `apps/admin/src` 保留原样，**不能据此认定重新构建会生成与服务器相同的前端文件**。
- 服务器没有 `api/uploads` 目录，本地也没有，故无 API 上传文件可同步；服务器 `dist` 内的静态图片已随前端发布文件复制。服务器运行时密钥、专用维护脚本和包含密钥的 Docker 配置未下载。文档、小程序及其他未部署到服务器的本地目录保留原样。
- `dist` 被 `.gitignore` 忽略，当前前后端构建文件只存在于本机，不会随普通 Git 提交同步到 GitHub。服务器也没有可用于标识该部署的 Git 提交号。
- 本次服务器同步没有重建前端或后端构建文件；GitHub 是否已包含源码以仓库提交历史为准。

## 验证

- 从服务器下载的源码与构建文件：372/372 个 SHA-256 一致。
- 同步后的本地 API TypeScript 类型检查通过；Prisma Client 已按本地 schema 重新生成。
- API 单元测试：26/26 通过。

## 数据库同步

- 服务器业务库 `yinshua` 通过 MySQL 8.4 的一致性只读导出保存到本地 `.tools/database/aliyun-yinshua-20260923-110952.sql`，SHA-256：`CD9678703D8D160EE9A32AF69CC981DC0D8163D59F3727EB1D9D1E7D8D3F5DE0`。
- 本地新建 MySQL 8.4.11 实例，程序位于 `.tools/mysql-8.4.11-winx64`，数据位于 `.tools/mysql-data`，仅监听 `127.0.0.1:3306`。此前本机没有运行中的 MySQL 或已有本地业务库。
- SQL 导入成功；本地与服务器均为 30 张表、226 条记录，各表记录数一致。API 使用本地新建账户可通过 Prisma 读取业务库。
- 本地数据库密码保存在 `.tools/database/local-mysql-credentials.json`，API 本地配置在 `apps/api/.env`；两者均被 Git 忽略，并限制为当前 Windows 用户访问。API 签名密钥为本地新生成，未复制服务器密钥。
- 此操作是一次性快照，不会持续跟随服务器后续变化；不要将 SQL、凭据或本地数据库文件加入 Git。
- 本机重新开机后，在项目根目录执行 `. .\scripts\start-mysql.ps1` 启动数据库；在 `apps/api` 目录运行 `..\..\.tools\node\node.exe dist\src\main.js` 启动已发布后端。旧文档中的 `prisma:push` 和 `db:seed` 不应对这份快照执行。
- 已用已发布后端启动本地 API 并访问只读商品接口，返回 HTTP 200；测试进程已停止。

后续若要让可编辑的前端源码也与服务器发布版一致，需要找到当时用于构建 `dist` 的源码或提交；不能仅凭压缩后的构建文件可靠还原。
