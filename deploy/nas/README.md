# 极空间 NAS 完整临时预览部署

这个目录用于把完整项目部署到极空间 Docker，包括前端页面、NestJS API 和 MySQL 数据库。

## NAS 目录结构

建议在极空间项目目录中保持以下结构：

```text
qddflc-web
├─ dist
│  ├─ index.html
│  └─ assets
│  └─ admin
│     ├─ index.html
│     └─ assets
├─ api
│  ├─ package.json
│  ├─ pnpm-lock.yaml
│  ├─ prisma
│  ├─ src
│  ├─ nest-cli.json
│  └─ tsconfig.json
└─ nginx.conf
```

`dist` 来自本地 `apps/client/dist`。

`dist/admin` 来自本地 `apps/admin/dist`，用于通过同一个域名访问后台。

`api` 来自本地 `apps/api`，上传时不要上传 Windows 环境的 `node_modules`。

`nginx.conf` 使用本目录中的配置文件。

## Compose

在极空间 Docker 项目的 YAML 编辑器里粘贴 `docker-compose.full.yml` 的内容。

首次启动会自动：

1. 拉取 `nginx`、`node`、`mysql` 镜像。
2. 安装 API 依赖。
3. 生成 Prisma Client。
4. 同步 MySQL 表结构。
5. 首次写入种子数据。
6. 启动 API 和前端站点。

首次启动可能需要几分钟。完成后继续使用极空间远程访问的 `8088` 地址访问完整项目。

## 访问验证

打开：

```text
https://remote-access-8088.zconnect.cn/
https://remote-access-8088.zconnect.cn/admin/
https://remote-access-8088.zconnect.cn/member
https://remote-access-8088.zconnect.cn/history
```

后台默认账号来自种子数据：

```text
账号：admin
密码：admin123
```

如果会员中心和历史页仍然没有数据，检查 `qddflc-api` 和 `qddflc-db` 容器日志。
