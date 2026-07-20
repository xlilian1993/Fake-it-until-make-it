# Fake It — 架构设计

> 2026-07-20 · 实际实现版本 · Next.js App Router + TypeScript + LLM

---

## 一、技术栈

| 层次 | 技术 | 用途 |
|------|------|------|
| 框架 | Next.js 14 (App Router) | 全栈框架，SSR + API Routes |
| 语言 | TypeScript | 类型安全 |
| 样式 | Tailwind CSS + 内联 style | 组件样式 |
| 动画 | Framer Motion | 弹层动画、过渡效果 |
| 截图 | html2canvas | 分享长图生成 |
| AI | OpenAI 兼容 API | 角色推荐 / CBT / 圆桌（JSON mode） |
| 状态管理 | React useState（组件本地） | 页面级状态 |
| 持久化 | 无（当前版本） | — |

---

## 二、目录结构

```
fake-it/
├── app/
│   ├── layout.tsx               # 根布局（viewport 设置）
│   ├── page.tsx                  # 主页面（全部 UI 状态逻辑）
│   ├── globals.css               # 全局样式 + CSS 动画 + 字体
│   └── api/
│       ├── recommend/route.ts    # POST — 角色推荐 API
│       ├── cbt/route.ts          # POST — CBT 五幕对话 API
│       └── roundtable/route.ts   # POST — 圆桌讨论 API
├── src/
│   ├── components/
│   │   ├── BottomBar.tsx         # 底部操作栏（当前返回 null，预留）
│   │   ├── Bubble.tsx            # 旧版气泡（未使用）
│   │   ├── BubbleCanvas.tsx      # 旧版气泡画布（未使用）
│   │   ├── CBTDialog.tsx         # CBT 对话容器（全屏弹层）
│   │   ├── CBTModule.tsx         # 单幕 CBT 内容（打字机动画）
│   │   ├── DateDisplay.tsx       # 日期展示（未使用）
│   │   ├── LoadingRoller.tsx     # 旧版加载（未使用）
│   │   ├── MysteryBubble.tsx     # 神秘气泡（翻转揭示）
│   │   ├── RoundTable.tsx        # 旧版圆桌（未使用）
│   │   ├── RoundTableResult.tsx  # 圆桌讨论结果浮窗
│   │   ├── RoundTableShare.tsx   # 旧版圆桌分享（未使用）
│   │   ├── ShareImageModal.tsx   # 分享长图模态框
│   │   └── StoryModal.tsx        # 角色故事浮窗
│   ├── hooks/
│   │   ├── useBubbles.ts         # 气泡管理（未使用，逻辑在 page.tsx）
│   │   ├── useDrag.ts            # 拖拽封装（未使用，逻辑在 page.tsx）
│   │   └── useLocalStorage.ts    # 本地存储（未使用）
│   ├── lib/
│   │   ├── avatars.ts            # 头像映射（AVATAR_MAP + NEW_AVATAR_MAP）
│   │   ├── characters.ts         # 原始角色池（47 人 + 热度分）
│   │   ├── characters_new.ts     # 新角色池（81 人 + 详细数据 + 热度分）
│   │   ├── colors.ts             # 领域颜色 + 气泡大小常量
│   │   ├── downloadImage.ts      # html2canvas 截图 + 下载工具
│   │   ├── llm.ts                # LLM API 调用 + JSON 解析
│   │   ├── mystery.ts            # 每日限定角色（3 人池随机）
│   │   ├── path.ts               # 路径工具
│   │   ├── prompts.ts            # LLM Prompt 模板
│   │   └── shareUtils.tsx        # 分享长图生成（直接 DOM 操作）
│   ├── store/
│   │   └── AppContext.tsx         # 全局状态 Context（定义了但 page.tsx 未使用）
│   └── types/
│       └── index.ts              # 完整 TypeScript 类型定义
├── public/
│   └── avatars/                  # 角色头像 PNG 文件（~120+ 个）
│   └── avatars-bg.png            # 全屏背景图
│   └── mystery-face.png          # 神秘气泡默认面孔
├── .env.local                    # LLM_KEY / LLM_MODEL / LLM_BASE
├── next.config.js
├── tailwind.config.ts
└── tsconfig.json
```

---

## 三、核心架构

### 组件树

```
layout.tsx
  └── page.tsx（主页面，管理所有状态和 UI 分支）
        ├── [空态] 首页文案 + 输入框
        ├── [加载中] 进度条 + 角色卡片
        ├── [气泡态] 全屏背景 + 卡片层
        │     ├── MysteryBubble（神秘气泡，翻转动画）
        │     ├── 普通 Bubble（内联渲染）
        │     ├── 圆桌区（内联渲染，三角布局）
        │     └── 引用文案
        ├── StoryModal（故事浮窗，条件渲染）
        ├── CBTDialog（全屏对话，AnimatePresence）
        │     └── CBTModule（单幕内容，打字机）
        ├── RoundTableResult（讨论结果浮窗）
        └── ShareImageModal（分享长图）
```

### 状态管理

所有状态集中在 `page.tsx` 中，使用 17 个 `useState`：

| 状态 | 类型 | 说明 |
|------|------|------|
| question | string | 用户输入的问题 |
| bubbles | Bubble[] | 当前气泡列表 |
| recommendCache | RecommendItem[] | LLM 返回的推荐结果缓存 |
| selectedCharacterName | string | 选中的 CBT 对话角色 |
| cbtDomain | string | 当前角色领域（用于颜色） |
| storyCharacter | RecommendItem | 故事浮窗展示的角色 |
| isLoading | boolean | 全局加载状态 |
| loadingText | string | 加载文字 |
| loadingProgress | number | 进度条 0-100 |
| loadingDone | boolean | 加载完成（显示"去看看"） |
| spotlightChar | object | 加载页展示的随机角色 |
| error | string | 错误信息 |
| roundTableActivated | boolean | 圆桌是否激活 |
| roundTableMembers | RecommendItem[] | 圆桌成员（最多 3） |
| roundTablePerspectives | object[] | 圆桌讨论结果 |
| roundTableLoading | boolean | 圆桌加载中 |
| roundTableLoadingText | string | 圆桌加载文案 |
| shareTarget | object | 分享目标 |

### 页面临界状态分支

```
isEmpty && !error      → 首页空态
isLoading              → 加载页
bubbles.length > 0     → 气泡页
selectedCharacterName  → CBT 对话框
storyCharacter         → 故事浮窗
perspectives > 0       → 圆桌结果浮窗
shareTarget            → 分享长图
```

---

## 四、数据模型

```typescript
// ============ 角色 ============
type CharacterDomain = 'leader' | 'philosopher' | 'explorer' | 'healer' | 'rebel' | 'creator';
type CharacterSource = 'real' | 'movie' | 'tv' | 'game' | 'book' | 'anime';
type BubbleSize = 'large' | 'medium' | 'small';

interface Character {
  id: string; name: string; avatar: string;
  domain: CharacterDomain; source: CharacterSource; matchScore: number;
}

// ============ 气泡 ============
interface Bubble {
  character: Character;
  size: BubbleSize; color: string;
  position: { x: number; y: number };
  animationDuration: number; animationDelay: number;
  ox: string; oy: string; mx: string; my: string;  // 浮动动画 CSS 变量
  isMystery: boolean; isRevealed: boolean; hasGlow: boolean;
}

// ============ 推荐结果（预生成） ============
interface RecommendItem {
  name: string; matchScore: number;
  domain: CharacterDomain; source: CharacterSource;
  isMystery?: boolean;
  story: { intro: CharacterIntro; facets: LifeFacet[]; };
}

interface RecommendResult { characters: RecommendItem[]; }

// ============ CBT 五幕 ============
interface CBTModule {
  index: 1|2|3|4|5; title: string; content: string;
  action?: { firstStep: string; emergencyScript: string; backupPlan: string; };
}

interface CBTResponse {
  characterName: string; question: string; modules: CBTModule[];
}

// ============ 圆桌讨论 ============
interface RoundTablePerspective {
  characterName: string; viewpoint: string; story: string;
}
```

### 关键常量

```typescript
// colors.ts
DOMAIN_COLORS: Record<CharacterDomain, string> = {
  leader: '#FFD700', philosopher: '#B8A9FF', explorer: '#7FE5FF',
  healer: '#A8FFD7', rebel: '#FF9EC7', creator: '#FFD49E',
};
SIZE_PX: Record<BubbleSize, number> = { large: 80, medium: 60, small: 44 };
matchScoreToSize(score) → score>=80→large, >=60→medium, else→small

// 气泡区域
CARD_W = 300, CARD_H = 210
CORNER_ZONES: 5 个区域坐标（左上/右上/左下/右下/底部中央）
神秘气泡居中（cx:0.50, cy:0.42），jitter: 15px
普通气泡四角分散，jitter: 40px，最小间距 35px
```

---

## 五、API 设计

### POST /api/recommend

```
请求: { question: string }
LLM: buildRecommendPrompt(question, mysteryName)
返回: { characters: RecommendItem[] }  // 6 个：1 神秘 + 5 普通
超时: 30s
温度: 0.8
JSON mode: true
```

调用链：`page.tsx → fetch /api/recommend → callLLM(buildRecommendPrompt) → extractJSON → RecommendResult`

容错：解析失败返回 502 + extracted/raw 片段用于调试

### POST /api/cbt

```
请求: { characterName: string, question: string }
LLM: buildCBTPrompt(characterName, question)
返回: { characterName, question, modules: CBTModule[] }
超时: 30s
```

调用链：`CBTDialog → fetch /api/cbt → callLLM(buildCBTPrompt) → extractJSON → CBTResponse`

### POST /api/roundtable

```
请求: { characterName, question, previous?: { name, viewpoint, story } }
返回: { perspective: { characterName, viewpoint, story } }
超时: 60s
```

调用链：`page.tsx → 3 次串行 fetch /api/roundtable`
- 第一人：无 previous
- 第二人：传入第一人的 viewpoint + story
- 第三人：传入第二人的 viewpoint + story

---

## 六、关键交互实现

### 气泡拖拽

1. `pointerdown` → 记录起始位置，注册全局 `pointermove` + `pointerup`
2. 移动超过 5px 阈值 → 进入拖拽模式
3. 幽灵 DOM 元素跟随手指（绝对定位，圆形渐变背景 + 头像）
4. 进入圆桌区（dropZoneRef.getBoundingClientRect 碰撞检测）→ 边框高亮 + boxShadow 发光
5. `pointerup` → 若在圆桌区内 → 加入 roundTableMembers（最多 3，超出 shift）
6. 幽灵元素通过 useRef 挂载在 body 上（useEffect 创建）

### 打字机动画

- `CBTModule` 组件通过 `setInterval(20ms)` 逐字切分 `module.content`
- `startTyping` prop 触发，`startedRef` 防重复
- 完成时调用 `onTypingDone`，父组件推进到下一幕
- `clickLockRef` 600ms 防连点

### 分享长图

- `html2canvas` 2x scale 渲染 DOM 为 Canvas
- 转 Blob URL（微信兼容）或 Data URL（其他场景）
- PC：`triggerDownload` 创建 `<a download>` 自动下载
- 移动端：浮层展示图片 + "长按保存到相册" 提示
- QR code：`api.qrserver.com` 生成

### 加载进度

- 250ms 间隔 setInterval
- 分段速度：0-20% → 2.5/step，20-50% → 1.8/step，50-85% → 1.0/step
- 85% 停止，API 完成后跳到 100%
- 最低展示 2s（minDisplayTimer Promise）

---

## 七、LLM 层

### 配置

```typescript
// llm.ts
LLM_CONFIG = {
  name: process.env.LLM_NAME || 'default',
  model: process.env.LLM_MODEL || 'gpt-4o-mini',
  apiKey: process.env.LLM_KEY || '',
  baseURL: process.env.LLM_BASE,
};
```

### 调用方式

```typescript
callLLM(prompt) → fetch(baseURL/chat/completions) → response.choices[0].message.content
// 参数: temperature: 0.8, response_format: { type: 'json_object' }
```

### JSON 提取

```typescript
extractJSON(text: string) → 去 markdown 代码块 → 找最外层 {} 或 [] → 去控制字符 → 修复尾逗号
```

---

## 八、角色数据流

```
用户输入问题
    │
    ▼
getDailyMystery() → 从 [泰勒斯威夫特, 哈兰德, 甄嬛] 随机选一个
    │
    ▼
buildRecommendPrompt(question, mysteryName)
    │ 角色列表 = getCharacterNames() + 各自热度分
    │
    ▼
callLLM(prompt) → JSON parse → RecommendResult
    │
    ▼
buildBubbles(items) → Bubble[]
    │ character.avatar = getAvatar(item.name)
    │   → AVATAR_MAP[name] || NEW_AVATAR_MAP[name] || '🫧'
    │ character.domain → DOMAIN_COLORS[domain] → bubble.color
    │ item.matchScore → matchScoreToSize → bubble.size
    │
    ▼
渲染气泡 + 存储 recommendCache
```

---

## 九、当前限制与技术债

| 项目 | 说明 |
|------|------|
| AppContext 未使用 | page.tsx 用本地 state，AppContext 定义但未接入 |
| hooks/ 未使用 | useBubbles/useDrag/useLocalStorage 已定义但逻辑全在 page.tsx 中 |
| 旧组件残留 | Bubble/BubbleCanvas/RoundTable/RoundTableShare/LoadingRoller 保留但未渲染 |
| BottomBar 为空 | 返回 null，底部栏功能未实现 |
| 无持久化 | 收藏/历史功能未实现，刷新即丢失 |
| 前端单页 | ~820 行 page.tsx，状态和 UI 全耦合 |
| 无测试 | 无测试基础设施 |
| 角色池维护成本 | 每次加角色需手动编辑 characters.ts + avatars.ts + 上传 png |
| 圆桌 API 串行 | 3 次串行 fetch 导致总耗时较长（每次等上一次完成） |

---

*架构设计 · 2026-07-20 · 实际实现版本*
