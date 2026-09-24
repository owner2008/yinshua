# 阿里云 API 安全发布准备

本目录是现行 `/opt/yinshua/current/docker-compose.yml` 的小范围覆盖文件，不包含服务器上的数据库凭据。正式官网 WordPress 不属于这个 Compose 项目。公网 8088 的会员接口仍由代理临时拦截；仅放置候选构建或提交本目录文件不代表已经发布。

## 当前候选

- 候选 API：服务器 `api/dist-auth-20260924`，由本地提交 `cb54efa` 构建；候选包 SHA-256 为 `b3e5c0e70cf2da51c2a2b85f0f7b845c9eef38bb6a573dc4407ebe4c50167256`。
- 旧 API：服务器 `api/dist`，保持原样供回退。
- 候选在容器内 3001 端口已通过产品读取与认证拒绝验收，但临时进程已停止，公网仍走旧 API。验收期间曾发生一次旧 API 到数据库的短时断连，原因尚未定位。详见 `docs/8088-member-auth-safeguard-2026-09-23.md`。
- 2026-09-24 已在服务器构建 `localhost/qddflc-api-runtime:20260924`；在无网络、只读挂载的隔离容器中，OpenSSL 和现有 Prisma Client 可加载。构建镜像不等于已切换运行容器。

## 发布前置条件

1. 确认数据库连接稳定、业务数据库已备份且备份可读取；确认 `qddflc-web`、`qddflc-api`、`qddflc-db` 的当前状态和回退窗口。
2. 将本目录两个覆盖文件和 Dockerfile 放到服务器 `/opt/yinshua/current`，不要覆盖现行 `docker-compose.yml`。确认候选目录与旧 `dist` 均存在，并对候选文件核对校验值。
3. 在服务器构建 `localhost/qddflc-api-runtime:20260924`。该镜像只补充 OpenSSL，API 依赖继续来自现行 `api/node_modules` 挂载；必须在隔离容器中先验证 Prisma Client 可运行。
4. 组合现行 Compose 和 `docker-compose.safe-api.yml` 执行配置校验，确认只改变 API 的镜像及启动命令，且不会重建数据库或 WordPress。`podman-compose config` 会把环境变量写到标准错误输出；检查时必须同时捕获并丢弃标准输出与错误输出，不要复制到聊天或日志。
5. 发布前轮换数据库及 API 签名凭据并准备回退；轮换会使现有登录 token 失效，需协调管理员重新登录。不要把真实凭据写入仓库或诊断输出。

## 切换与回退

在可接受短暂 8088 API 中断的维护窗口，用 `podman-compose` 指定现行文件和安全覆盖文件，仅重建 `qddflc-api` 服务；覆盖后的启动命令只运行 `node dist-auth-20260924/src/main.js`，**不得执行** `prisma:push`、`db:seed` 或依赖安装。上线后先验证产品目录、管理员登录拒绝规则及日志，再考虑后续 H5 认证入口。当前 8088 的三个会员代理拦截不可因此移除。

如候选未通过验收，以 `docker-compose.rollback-api.yml` 覆盖现行 Compose，仅重建 API，启动保留的旧 `dist/src/main.js`。**不要直接使用原 Compose 文件回退**，它的旧启动命令会重跑推表/播种。回退后复核产品接口、代理拦截和 WordPress 官网。
