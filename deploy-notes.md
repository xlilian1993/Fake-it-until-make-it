# Fake It — VPS 部署笔记

> 2026-07-18 · 部署到 xlilian.cn/fake-it/

## 部署架构

```
用户 → https://xlilian.cn/fake-it/* → Nginx → localhost:3002 (Next.js)
```

- **服务器**: root@101.132.32.3 (CentOS)
- **Node.js**: v20.20.0
- **进程管理**: PM2
- **Web 服务器**: Nginx (已配置 SSL / Let's Encrypt)

## 部署步骤

### 1. 配置 basePath

`next.config.mjs`:
```js
const nextConfig = {
  basePath: '/fake-it',
};
```

`.env.local`:
```
NEXT_PUBLIC_BASE_PATH=/fake-it
```

### 2. 修复客户端 fetch 路径

所有 `fetch('/api/xxx')` 需要加上 basePath 前缀，否则浏览器会请求到 `xlilian.cn/api/xxx`（404）：

```ts
// ❌ 错误
fetch('/api/recommend', { ... })

// ✅ 正确
fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/recommend`, { ... })
```

涉及文件：`app/page.tsx`、`src/components/CBTDialog.tsx`

### 3. 静态资源路径

头像路径通过 `getAvatar()` 返回，需要加上 basePath 前缀：

```ts
const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export function getAvatar(name: string): string {
  const path = AVATAR_MAP[name];
  return path ? `${BASE}${path}` : '🫧';
}
export function isImageAvatar(avatar: string): boolean {
  return avatar.includes('/avatars/');  // 不能用 startsWith('/')
}
```

### 4. Nginx 配置

在 `/etc/nginx/sites-enabled/painting-dairy` 中新增：

```nginx
location ^~ /fake-it {
    proxy_pass http://localhost:3002;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

`^~` 前缀匹配优先级高于普通 `/` location。reload: `nginx -t && nginx -s reload`

### 5. PM2 启动

```bash
cd /var/www/fake-it
pm2 start 'node node_modules/.bin/next start --port 3002' --name fake-it
pm2 save
```

注意：不能用 `pm2 start npm --name fake-it -- run start`，因为 PM2 的 npm 模式不传递 `.env.local` 中的 PORT 变量。

### 6. 同步命令

```bash
# 排除 node_modules 和 .next（首次部署先在本地 build 再同步 .next）
rsync -az --exclude 'node_modules' --exclude '.git' \
  -e ssh ./ root@101.132.32.3:/var/www/fake-it/
```

## 踩过的坑

| 问题 | 原因 | 解决 |
|------|------|------|
| API 返回 HTML 而非 JSON | fetch 路径没加 `/fake-it` 前缀，请求到了 nginx default location | 所有 fetch 使用 `` `${BASE}/api/xxx` `` |
| 头像不显示 | `isImageAvatar` 用 `startsWith('/')` 判断，加了 basePath 后不再以 `/` 开头 | 改为 `includes('/avatars/')` |
| PM2 循环重启 | PM2 的 `npm run start` 模式不传递 `.env.local` 的 PORT，导致端口冲突（默认 3000） | 用 `pm2 start 'node ... --port 3002'` 直接指定端口 |
| VPS build 失败 | VPS 有旧版 `useBubbles.ts`，类型不兼容新的 `Bubble` 接口（多了 ox/oy/mx/my） | 删除 VPS 上的旧文件，本地 build 后同步 `.next` |
| `extractJSON` 破坏 JSON | 弯引号 `""` 替换为 ASCII `""` 后，JSON 字符串内部的引号破坏结构 | 移除弯引号替换逻辑 |
| 本地 `.next` 不能直接在 VPS 用 | M1 Mac 和 Linux x86_64 架构不同，部分 native 模块不兼容 | 最后改为 VPS 本地 build（用 rsync 同步源码，在 VPS 上 `npm run build`） |

## 日常更新流程

```bash
# 1. 本地提交代码
git add -A && git commit -m "..." && git push

# 2. 同步源码到 VPS
rsync -az --exclude 'node_modules' --exclude '.git' \
  -e ssh ./ root@101.132.32.3:/var/www/fake-it/

# 3. VPS 上构建 + 重启
ssh root@101.132.32.3 \
  "cd /var/www/fake-it && npm run build && pm2 restart fake-it"

# 4. 验证
curl -sL -o /dev/null -w "%{http_code}" https://xlilian.cn/fake-it/
```

## 参考

- Next.js basePath 文档: https://nextjs.org/docs/app/api-reference/next-config-js/basePath
- PM2 进程管理: https://pm2.keymetrics.io/
