# 用户端

React + Vite + TypeScript H5 第一版。

## 启动

```powershell
pnpm --dir apps/client install
pnpm --dir apps/client dev
```

访问：

```text
http://127.0.0.1:5174
```

## 已实现页面

- 产品选择。
- 报价模板选择。
- 在线报价参数填写。
- 报价结果明细展示。
- 报价保存。
- 历史报价列表。

## 约束

- 用户端只收集报价参数。
- 报价计算、最低收费、会员系数和工艺价格全部来自后端 API。
- 产品/模板配置优先读取后端接口；接口不可用时使用内置样例配置支撑前端流程开发。
