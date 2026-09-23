# WordPress 官网与域名切换记录（2026-09-23）

## 站点结构

- 阿里云服务器 `39.106.169.147` 的 80/443 端口运行 WordPress 官网，站点目录为 `/var/www/html`，主题为 `wp-content/themes/dongfang-licai`。
- 同一服务器的 8088 端口运行另一套前端（`/opt/yinshua/current/dist`）。两套站点不能混为一谈，修改 `apps/client/src` 不会改变 WordPress 官网。
- WordPress 主题的 43 个文件已从服务器复制到 `apps/wordpress-theme/dongfang-licai`。媒体上传文件、插件和 WordPress 数据库不在此目录内。
- Nginx 的 WordPress 配置已复制到 `deploy/wordpress/wordpress.conf`，服务器对应位置为 `/etc/nginx/conf.d/wordpress.conf`。

## 本次改动

- 电脑端和手机端首页的“规模生产”及“关于我们”面积统一为 `6000㎡`，保留原有其他文案。
- 两端首页联系区均新增“办公室电话 0532-8886 0880”，原手机号 `18705328806` 保留。
- 两端首页联系区把手机和办公室电话收在同一“联系电话”项下，分别标明用途并提供可点击拨号链接。电脑端与手机端页脚均补齐手机、办公室电话、电子邮箱、地址和 QQ，保持两端信息一致。
- 手机端不再加载仅适用于电脑导航的 `assets/js/main.js`，避免滚动时反复报错；手机菜单继续由 H5 页面自己的脚本处理。
- 手机端行业横向滑动区移除多余的负外边距，保留滑动交互并消除 320px 视口下的整页横向溢出。
- 手机首页菜单改为与电脑端同一批内页链接，包括“人才招聘”；手机底部的产品和资讯链接改用相同的多语言链接函数。
- WordPress 数据库中“生产实力”页面（文章 ID 130）正文里唯一的 `1000㎡` 已精确改为 `6000㎡`。该正文存于数据库，不在主题源码中。
- 主题英文映射同步更新，Nginx 已识别 `qddflc.com` 和 `www.qddflc.com`；HTTP 和服务器 IP 入口会跳转到正式 HTTPS 域名。

## 验证与备份

- 修改过的 5 个 PHP 文件均通过 `php -l`；英文 JSON 格式有效；Nginx 配置通过 `nginx -t` 并已平滑重载。
- 从服务器本机以电脑和手机 User-Agent 访问首页及 `/products/`、`/production/`、`/about/`、`/jobs/`、`/industries/`、`/news/`、`/contact/`，均返回 HTTP 200。首页显示新电话和面积，生产内页显示 `6000㎡`。
- 外网强制连接新 IP 时，两个域名的 HTTPS 证书有效，首页和主要内页返回 200；电脑和手机首页均包含 `6000㎡`、办公室电话及相同的内页链接。HTTP 和 IP 入口返回指向正式 HTTPS 域名的 301。
- 使用 Chrome 分别以电脑和手机视口检查了上线后的联系区及页脚截图：号码、邮箱、地址、QQ 均完整显示；在 320px 手机视口下，联系区和页脚均在屏幕范围内，手机菜单可正常展开。手机端重新加载后不再出现电脑导航脚本异常。
- 服务器备份：`/root/dongfang-licai-before-20260923.tgz`、`/root/dflc-posts-before-20260923.sql`、`/root/wordpress.conf.before-20260923`、`/root/wordpress.conf.after-certbot-before-ip-fix`。备份不在公开 Web 目录中，也未进入 Git。
- 联系方式排版调整前的主题备份：`/root/dongfang-licai-before-contact-layout-20260923.tgz`。

## 公网域名与剩余异常

- 最初 `qddflc.com` 和 `www.qddflc.com` 指向旧 IIS 服务器 `47.104.13.73`，其内页返回截图所示 404。用户确认切换后，通过阿里云官方 CLI 的浏览器 OAuth 临时授权读取 DNS，发现 `@` 和 `www` 两条 A 记录**已是** `39.106.169.147`，因此没有重复提交 DNS 修改。阿里云权威 DNS、阿里云公共 DNS 和 Google 公共 DNS 均返回新地址。
- 已使用 Let's Encrypt 为两个域名签发证书，有效期至 2026-12-22；证书文件位于服务器 `/etc/letsencrypt/live/qddflc.com`，未复制到本地或 Git。正式签发前的演练和签发后的续期演练均成功，`certbot-renew.timer` 已启用且运行中。
- 本次核查使用的本机阿里云 CLI 临时 OAuth 配置 `codex-dns` 已删除；项目内仅保留被 Git 忽略的 CLI 程序，不保存云端凭据。
- **剩余异常**：这台服务器自带的递归 DNS `100.100.2.136/138` 曾以 10 秒 TTL 将域名解析为旧 CNAME `qddflc.ecs.xinshangxin.cn` / `47.104.13.73`，与权威和公共 DNS 不一致。账号内未查询到同名 PrivateZone。本次 Chrome 实测通过显式映射新服务器 IP 完成，不代表所有访客的本地 DNS 均已更新；若仍看到旧 IIS 404，优先检查访问端解析器的结果，必要时联系阿里云排查其内部递归解析。
