# Fake It — 技术栈说明

> 2026-07-17 · 配套 PRD v2.0 · 零基础 Demo 适配版

---

## 技术栈总览

| 层级 | 技术 | 用在哪 |
|------|------|--------|
| 前端框架 | **Next.js (React)** | 整体应用 |
| 样式 | **Tailwind CSS** | UI 样式 + 多巴胺渐变 |
| 气泡动画 | **CSS 动画 + 随机轨迹** | 气泡漂浮 |
| 拖拽 | **原生 Pointer Events** | 拖拽气泡到圆桌 |
| 动画 | **Framer Motion**（轻量使用） | 卡牌翻转/浮窗过渡/收藏闪烁 |
| LLM 后端 | **Next.js API Routes** | 调用 LLM、流式输出 |
| 本地存储 | **LocalStorage** | 收藏/历史/神秘卡状态 |
| 部署 | **Vercel** | 一键部署 + 全球 CDN |

---

## 逐项说明

### 1. Next.js (React) — 前端框架

**用在哪：** 整个 Web 应用

**为什么选它：**
- 前后端一体——API Routes 直接写后端接口调 LLM，不用单独搭后端服务
- React 生态成熟，组件化开发适合气泡/浮窗/CBT 模块等独立 UI 单元
- 页面路由、SSR/SSG 能力开箱即用
- Vercel 亲儿子，部署零配置
- 教程资源丰富，零基础友好

### 2. Tailwind CSS — 样式方案

**用在哪：** 全局样式、气泡渐变色、布局

**为什么选它：**
- 多巴胺色系渐变直接用 `bg-gradient-to-*` 写，不用手写 CSS 变量
- 响应式布局（手机长宽比 375×812）用 `max-w-[375px] mx-auto` 一行搞定
- 开发速度快，不用切换 CSS 文件
- 和 Next.js 生态无缝集成
- 写在标签上所见即所得，对零基础最直观

### 3. CSS 动画 + 随机轨迹 — 气泡漂浮（替代 Matter.js）

**用在哪：** 气泡漂浮效果

**为什么用 CSS 而不是 Matter.js：**
- Matter.js 是专业 2D 物理引擎，概念多（刚体、约束、力、碰撞检测），学习曲线陡
- Demo 阶段气泡只有 6 个，不需要真实物理碰撞
- 调试难——物理行为不符合预期时，难定位是引擎配置还是渲染问题
- CSS 动画零基础也能看懂和调整

**实现方式：**

```css
/* 气泡漂浮动画 */
@keyframes float {
  0%   { transform: translate(0px, 0px); }
  25%  { transform: translate(20px, -30px); }
  50%  { transform: translate(-15px, -50px); }
  75%  { transform: translate(10px, -20px); }
  100% { transform: translate(0px, 0px); }
}
```

每个气泡随机分配动画时长（10-20s）和延迟，视觉上就是漂浮效果。

**碰撞处理（可选）：**
- Demo 阶段气泡各飘各的、不碰撞也完全够用
- 如果需要简单碰撞：两个气泡圆心距离小于半径之和时，各自反弹方向即可，不需要物理引擎

### 4. 原生 Pointer Events — 拖拽系统

**用在哪：** 拖拽气泡到圆桌区

**为什么选它：**
- 就是 `onPointerDown / onPointerMove / onPointerUp`，不需要额外库
- Pointer Events 统一了 touch 和 mouse 事件，一套代码兼容移动端和桌面端
- 不需要引入 react-dnd 这种重型拖拽库——场景简单，自己写更可控

### 5. Framer Motion — UI 动画（轻量使用）

**用在哪：** 神秘卡翻开、故事浮窗过渡、收藏闪烁、圆桌满员发光

**使用原则——只用到最简单的功能：**
- ✅ 用：`animate`（入场动画）、`exit`（出场动画）、`whileTap`（点击反馈）
- ✅ 用：`rotateY`（神秘卡 3D 翻转）
- ❌ 不用：variants（状态机式动画，复杂）
- ❌ 不用：gesture 系统（拖拽/手势，用原生 Pointer Events 代替）
- ❌ 不用：AnimatePresence 的复杂用法（只用最基础的进出动画）

**降级方案：** 如果使用中发现学习成本高，全部用 CSS `transition` 替代也能跑通 Demo。

### 6. Next.js API Routes — LLM 后端

**用在哪：** 角色推荐、故事生成（多面人生）、CBT 五模块对话、圆桌讨论

**为什么选它：**
- 前后端同项目，不用单独维护后端服务
- API Route 里直接调用 LLM SDK，流式输出
- 部署到 Vercel Edge Functions，延迟低
- 不用管服务器、不用管 CORS

**多模型切换：**
- 支持 .env.local 配置多个 API Key（OpenAI / Anthropic / DeepSeek 等）
- 统一用 OpenAI 兼容格式调用（大部分服务商都兼容）
- 提供 `/api/model` 接口切换当前使用的模型
- 可随时切换测试不同模型效果

### 7. LocalStorage — 本地存储

**用在哪：** 收藏列表、历史记录、神秘卡翻开状态

**为什么选它：**
- MVP 阶段不需要用户登录系统
- 收藏和历史记录数据量小，LocalStorage 完全够用
- 零配置、零成本
- 几行代码搞定，没有学习成本

### 8. Vercel — 部署

**用在哪：** 上线 + CDN

**为什么选它：**
- Next.js 官方部署平台，`git push` 自动部署
- 全球 CDN，移动端访问速度快
- 免费 Hobby 套餐够 Demo 用
- 环境变量管理方便，LLM API Key 安全存储

---

## 依赖清单

```json
{
  "dependencies": {
    "next": "^14.x",
    "react": "^18.x",
    "react-dom": "^18.x",
    "tailwindcss": "^3.x",
    "framer-motion": "^11.x"
  }
}
```

5 个核心依赖，精简可控。没有状态管理库（React Context 够用）、没有 UI 组件库（自己写更灵活）、没有 HTTP 请求库（fetch 原生够用）、没有物理引擎（CSS 动画替代）。

---

## 技术风险与应对

| 风险 | 影响 | 应对 |
|------|------|------|
| CSS 动画性能 | 气泡多了可能卡顿 | 限制最多 6 个气泡 + 用 `will-change: transform` 优化 |
| LLM 响应慢 | CBT 对话首字 > 2s | 用流式输出，首字到达后逐字渲染 |
| LocalStorage 容量限制 | 历史记录多了可能满 | 单条记录只存摘要，超过 100 条自动清理最早的 |
| 角色匹配度不准 | 气泡大小不反映真实匹配 | Prompt 里要求 LLM 返回匹配度分数（0-100），映射到三档 |
| Framer Motion 学习成本 | 零基础可能不熟悉 | 降级使用，只碰最基础 API；不行就退回 CSS transition |

---

## 零基础 Demo 开发建议

1. **先做静态页面，再加交互** — 先把输入框 + 气泡 + 故事浮窗画出来，再加拖拽和动画
2. **直连 LLM** — 有 API Key，直接接，不用 mock 数据
3. **多模型测试** — .env.local 配多个 key，随时切换对比效果
4. **气泡碰撞可以不做** — Demo 阶段气泡各飘各的、不碰撞也完全够用
5. **Framer Motion 不行就退回 CSS** — 所有动画都能用 CSS `transition` + `@keyframes` 实现
6. **头像先用 emoji** — 后续准备好图片再替换为真实头像

---

*技术栈说明 · 2026-07-17 · 零基础 Demo 适配版*
