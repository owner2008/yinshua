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
- 两端首页联系区和页脚在原邮箱 `79927940@qq.com` 之外新增 `qd7931@126.com`，两个地址均可点击发邮件；手机端邮箱纵向排列，窄屏不会挤出页面。
- WordPress 数据库中的中文招聘页（ID 123）增加简历投递邮箱；中文联系页（ID 54）和英文联系页（ID 151）均展示两个邮箱；英文招聘页（ID 153）把未核实的 `sales@dongfanglicai.com` 改为 `qd7931@126.com`。可重复执行且会核对原文的更新脚本位于 `deploy/wordpress/update-contact-email.php`。
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
- 对 `qddflc.com` 和 `www.qddflc.com` 分别检查首页及七个主要内页，共 16 个 HTTPS 请求，直连新服务器均返回 200。手机 320px 视口的整页水平溢出为 0，行业展示区仍可横向滚动。
- 服务器备份：`/root/dongfang-licai-before-20260923.tgz`、`/root/dflc-posts-before-20260923.sql`、`/root/wordpress.conf.before-20260923`、`/root/wordpress.conf.after-certbot-before-ip-fix`。备份不在公开 Web 目录中，也未进入 Git。
- 联系方式排版调整前的主题备份：`/root/dongfang-licai-before-contact-layout-20260923.tgz`。
- 增加邮箱前的服务器备份：`/root/qddflc-before-email-20260923.sql` 和 `/root/dongfang-licai-before-email-20260923.tgz`。邮箱更新脚本已在服务器执行，四个页面均显示为 `updated`；PHP 语法检查及 WordPress 缓存刷新成功。
- 电脑和手机 User-Agent 请求首页、招聘页、联系页及对应英文页，均能看到新邮箱；真实手机主题的首页和页脚截图已核对，320px 宽度下招聘页和联系页没有整页水平溢出。
- 浏览器图标由站点现有的 DF 标识制成：源码 `deploy/wordpress/favicon-source.png`，构建脚本 `scripts/build-favicon.mjs`，发布文件 `deploy/wordpress/favicon.ico`。服务器文件必须放在 `/var/www/html/favicon.ico`；仅复制主题目录不会恢复该图标。
- 手机分享图原先引用不存在的 `h5/og-image.png`。现由已有 SVG 渲染出 1200×630 PNG，放在主题同目录。图标和分享图发布前备份为 `/root/dongfang-licai-before-icons-20260923.tgz`，发布后两个 URL 均返回 HTTP 200，MIME 分别为 `image/x-icon`、`image/png`。
- GitHub `master` 和 `codex/sync-from-aliyun-20260923` 已同步主题源码；数据库快照、凭据及被忽略的发布构建文件不在 Git 中。WordPress 页面正文的变化需随数据库迁移，不能仅靠切换主题获得。

## 公网域名与剩余异常

- 最初 `qddflc.com` 和 `www.qddflc.com` 指向旧 IIS 服务器 `47.104.13.73`，其内页返回截图所示 404。用户确认切换后，通过阿里云官方 CLI 的浏览器 OAuth 临时授权读取 DNS，发现 `@` 和 `www` 两条 A 记录**已是** `39.106.169.147`，因此没有重复提交 DNS 修改。阿里云权威 DNS、阿里云公共 DNS 和 Google 公共 DNS 均返回新地址。
- 已使用 Let's Encrypt 为两个域名签发证书，有效期至 2026-12-22；证书文件位于服务器 `/etc/letsencrypt/live/qddflc.com`，未复制到本地或 Git。正式签发前的演练和签发后的续期演练均成功，`certbot-renew.timer` 已启用且运行中。
- 两次核查使用的本机阿里云 CLI 临时 OAuth 配置 `codex-dns` 和 `codex-dns-audit` 均已删除；项目内仅保留被 Git 忽略的 CLI 程序，不保存云端凭据。
- `.com` 顶级域当前把 `qddflc.com` 委派给 `dns13.hichina.com` / `dns14.hichina.com`，阿里云新权威 DNS 返回 `39.106.169.147`。但旧 DNSPod 的 `f1g1ns1.dnspod.net` / `f1g1ns2.dnspod.net` 仍对根域名和 `www` 返回旧 CNAME `qddflc.ecs.xinshangxin.cn`；用户没有原 DNSPod 账号权限。
- **仍待上游处理**：服务器默认内网递归 DNS `100.100.2.136/138` 仍返回旧 DNSPod 委派及 `47.104.13.73`，与顶级域委派和阿里云新权威记录不一致。当前阿里云账号只读核查 `DescribeDnsCacheDomains`、`DescribeZones`、`DescribeResolverRules` 均无匹配规则，不能据此认定其他账号或解析节点没有覆盖；不要未经确认执行收费缓存清理。需要阿里云核查内网 DNS 的旧委派来源。
- 2026-09-23 再次从服务器查询：阿里云权威 `dns13.hichina.com` 与公网递归 `223.5.5.5`、`8.8.8.8`、`1.1.1.1`、`119.29.29.29` 均把 `@`/`www` 返回为 `39.106.169.147`；但服务器默认内网解析器 `100.100.2.136` 对两者仍返回 TTL 为 10 秒的旧 CNAME `qddflc.ecs.xinshangxin.cn`，再解析为 `47.104.13.73`。因此旧 DNSPod 不修改并不意味着公网故障会永久持续，也不能保证删除其旧记录就能修复阿里云内网解析；若该内网结果持续，应由阿里云排查解析来源。
- 后续再次查询两台内网解析器 `100.100.2.136/138`，其 SOA 和 NS 也仍指向旧 DNSPod，且应答无权威 `aa` 标志；阿里云权威 DNS 同时返回新 SOA/NS。此现象可能与旧委派缓存或内网转发有关，但仅凭结果不能确认具体来源，暂不改服务器的全局 DNS。
- 2026-09-23 再次通过 SSH 在服务器上只读核查：`100.100.2.136` 和 `100.100.2.138` 查询 `qddflc.com` 均仍返回旧 CNAME 及 `47.104.13.73`，同机查询公网 DNS `223.5.5.5` 则返回 `39.106.169.147`。内网异常尚未自行消失，需要继续由阿里云定位；不要把旧 DNSPod 记录直接删除当作修复方案。
- 为保障此服务器的 WordPress 自身调用，`/etc/hosts` 仅把 `qddflc.com` 和 `www.qddflc.com` 映射至 `127.0.0.1`，原文件备份在 `/root/hosts.before-qddflc-loopback-20260923`。普通 `curl` 从服务器访问两个 HTTPS 域名均返回 200；`certbot renew --dry-run --quiet` 成功。该本机映射不会改变公网 DNS 或其他访客的解析结果。
- 本机测试网络使用代理虚拟 DNS，Chrome 视觉验收和外网内页检查通过显式连接 `39.106.169.147` 完成，不代表所有访客的本地 DNS 均已更新。若仍看到旧 IIS 404，先核对访问端解析结果，再排查旧委派或联系阿里云支持。
