# 小程序真机联调清单

更新时间：2026-04-29

**2026-09-23 状态：**本清单是旧阶段的联调设计；当前小程序没有报价/历史页面，公网 8088 的会员接口也因安全保护暂时关闭，不能按下面步骤完成真机验收。须先恢复所需功能并完成安全发布，详见 `docs/current-development-progress.md`。

## 需要准备

- 微信公众平台小程序账号，并拿到真实 `AppID` 和 `AppSecret`。
- 一个可公网访问的 HTTPS API 域名，例如 `https://api.example.com`。
- API 服务已连接经过验证的数据库；现有服务器业务库和本机恢复的快照不得再次执行 `prisma:push` 或 `db:seed`。
- 微信开发者工具可打开 `apps/miniprogram/`。

## 后端配置

在 `apps/api/.env` 中配置：

```env
DATABASE_URL="mysql://user:password@host:3306/yinshua"
WECHAT_APPID="真实小程序 AppID"
WECHAT_APP_SECRET="真实小程序 AppSecret"
MEMBER_AUTH_SECRET="一段足够长的随机字符串"
ADMIN_AUTH_SECRET="一段足够长的随机字符串"
```

在全新空开发库中可按开发流程初始化；对于现有服务器或恢复的业务快照，**不要**执行以下旧命令。服务器 API 容器重启还会自动触发安装、建表和种子步骤，必须先调整部署流程：

```powershell
pnpm --dir apps/api prisma:push
pnpm --dir apps/api db:seed
pnpm --dir apps/api start:dev
```

本地新源码默认禁用 `mock_` code；仅非生产环境显式设置 `ALLOW_MOCK_WECHAT_LOGIN=true` 才可用于开发。真实 `wx.login` code 在未配置 `WECHAT_APPID` 或 `WECHAT_APP_SECRET` 时会直接登录失败，避免真机联调被假登录掩盖。

## 小程序配置

1. 将 `apps/miniprogram/project.config.json` 里的 `appid` 替换为真实 `WECHAT_APPID`。
2. 将 `apps/miniprogram/config.real-device.example.js` 复制为 `apps/miniprogram/config.js`。
3. 把 `config.js` 中的 `apiBase` 改成真实 HTTPS API 地址，例如：

```js
module.exports = {
  apiBase: 'https://api.example.com/api',
};
```

## 微信公众平台配置

进入 微信公众平台 -> 开发管理 -> 开发设置 -> 服务器域名：

- `request 合法域名` 增加 API 域名，例如 `https://api.example.com`。
- 域名必须是 HTTPS，证书有效，且域名不要带 `/api` 路径。
- 真机、体验版、正式版不要依赖“开发环境不校验合法域名”。

参考微信官方文档：
- [wx.login](https://developers.weixin.qq.com/miniprogram/dev/api/open-api/login/wx.login.html)
- [code2Session](https://developers.weixin.qq.com/miniprogram/dev/OpenApiDoc/user-login/code2Session.html)
- [网络能力说明](https://developers.weixin.qq.com/miniprogram/dev/framework/ability/network.html)

## 真机验证步骤（待功能与会员入口恢复后执行）

1. 在微信开发者工具打开 `apps/miniprogram/`。
2. 确认右上角项目 AppID 是真实小程序 AppID。
3. 开发者工具内先关闭“不校验合法域名”进行预检。
4. 点击“预览”，用真实微信扫码打开。
5. 进入“报价”页，确认产品、模板、材料、印刷方式能正常加载。
6. 点击“计算报价”，确认显示最终报价。
7. 点击“保存报价”，确认提示保存成功，并显示报价单号。
8. 切到“历史”页，确认刚保存的报价出现在列表。
9. 展开历史报价，确认询价需求和费用说明能显示。
10. 后台“报价单”页刷新，确认同一张报价单已入库。

## 常见失败判断

- 报“合法域名”或 `url not in domain list`：微信公众平台没有配置 request 合法域名，或 `config.js` 仍是本地 HTTP 地址。
- 报“未配置微信小程序 AppID 或 AppSecret”：后端 `.env` 缺少 `WECHAT_APPID` 或 `WECHAT_APP_SECRET`，重启 API 后再试。
- 报微信登录失败且包含 `invalid code`：小程序 AppID 和后端 `WECHAT_APPID` 不一致，或 code 被重复使用。
- 保存报价返回 401：小程序登录未成功，先检查 `/api/auth/wx-login` 是否返回 token。
- 历史报价为空：确认保存报价时使用的是同一个微信用户，并检查 API 数据库中的 `Quote.userId`。
