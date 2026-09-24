# 阿里云 8088 API 发布与回退（2026-09-24）

本目录的覆盖文件和脚本不含生产凭据。服务器 `/opt/yinshua/current/docker-compose.yml` 已更新为安全版 API 的正式配置，仅 root 可读；正式 WordPress 官网不属于此 Compose 项目。公网 8088 的会员接口仍由代理临时拦截。

## 已发布状态

- `qddflc-api` 正在运行 `localhost/qddflc-api-runtime:20260924` 与 `node dist-auth-20260924/src/main.js`。候选包来自提交 `cb54efa`，SHA-256 为 `b3e5c0e70cf2da51c2a2b85f0f7b845c9eef38bb6a573dc4407ebe4c50167256`；旧 `api/dist` 保留供紧急回退。
- `qddflc-api` 与 `qddflc-web` 均仅使用 Podman DNS `10.89.0.1`。此前混用阿里云 DNS 会间歇性解析不到内部数据库名，造成目录接口偶发 500；发布后经多轮连续请求验证均为 200。容器重建时数据库曾跟随短暂重启，API 日志出现一次启动期 `P1001`，随后 30 次复查均为 200，未发现持续错误。
- MySQL 应用账号、MySQL root 账号、管理员/会员签名密钥已轮换；运行中容器与正式 Compose 配置逐项核对一致。旧管理员 token 需重新登录。不要将服务器配置或任何凭据复制入仓库。
- 服务器 root 专用数据库备份：`/root/yinshua-before-credential-rotation-20260924.sql`（81,956 字节，SHA-256 `27811dd8c5d1dfffa72dcb1cf2fac10e7d0bc97eb738e472d2fedc033a0569c1`）；原 Compose 备份：`/root/yinshua-before-safe-api-20260924T002355Z.compose.yml`。这些备份含旧凭据/业务数据，禁止公开。
- 直接访问 API 时，模拟微信登录、无 token 手机绑定及会员地址接口均返回 401；8088 代理的三个临时会员拦截继续返回 403，公开首页/目录与 WordPress 官网返回 200。2026-09-24 已发布不再自动使用模拟身份的 H5，但真实微信登录入口尚未实现/验收，不能开放会员接口。
- H5 发布包 SHA-256 为 `2424e842f379877999b4c078b39e3daeb959a6d977f0ff03a2529adb9dec36c8`。发布前已备份完整 `dist` 到 `/root/yinshua-h5-before-20260924.tar.gz`（0600，SHA-256 `c1cc94785ec05596840edf00b574a02044c7967bcffc4cd548ddae4f803910ac`）。新旧构建除首页入口和一份 JS 外完全一致；仅增加带哈希的新 JS、原子替换首页入口，旧 JS 和 `dist/admin` 均保留，未重启容器。静态入口、新 JS、后台、产品接口及 WordPress 已通过 HTTP 验收；浏览器视觉验收仍待补。

## 运行与回退

1. 当前正式 Compose 的 API 命令只启动编译后的服务，不再自动安装依赖、推表、播种或构建。不要把 root 备份中的旧 Compose 直接恢复到生产：它含已失效的旧凭据和不安全的旧启动链。
2. 服务器 `podman-compose` 为 1.0.6。实测 `up --force-recreate` 只是停启原有容器，**不会可靠应用新镜像/命令/DNS**；而 `qddflc-web` 依赖 `qddflc-api`，不能先删除 API。后续变更必须先备份、校验，按顺序停/删 `qddflc-web`、停/删 `qddflc-api`，再用经过校验的单份 Compose 文件先创建 API、后创建 web；预留 8088 中断，并复查数据库是否被工具一同重启。WordPress 独立运行。
3. `render-compose.py` 只允许安全版/回退覆盖文件里的预期键，输出必须在正式 Compose 同目录、权限 0600。`podman-compose config` 可能打印所有环境变量，务必同时丢弃 stdout/stderr，不要保存输出。网络重建后先重新确认 `10.89.0.1` 是否仍为网关。
4. 当前新凭据的回退文件为服务器 `.rollback-after-rotation-20260924.merged.yml`（0600），会运行旧 `api/dist`，但保留新凭据与单一 Podman DNS。仅紧急使用，仍须按上述依赖顺序重建，并维持三个会员代理拦截；不可回退到旧凭据或开放旧会员认证。
5. `rotate-credentials.py` 仅用于服务器端分阶段轮换与验证，不输出密码。再次轮换须先生成新备份和新的候选文件，不得复用本次备份/临时文件。上线后检查公开目录、模拟登录拒绝、会员拦截、管理员重新登录和官网。
