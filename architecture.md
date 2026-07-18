# Fake It — 架构设计

> 2026-07-17 · 配套 PRD v2.0 + 技术栈说明 + 主界面设计
> 零基础 Demo 适配版

---

## 一、项目目录结构

```
fake-it/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # 全局布局（手机长宽比容器）
│   │   ├── page.tsx                  # 主页面（气泡 + 输入框）
│   │   └── globals.css               # 全局样式 + CSS 动画
│   │
│   ├── api/                          # 后端 API Routes
│   │   ├── recommend/route.ts        # 角色推荐+故事预生成：问题 → 5个角色+故事
│   │   ├── cbt/route.ts              # CBT五模块：角色+问题 → 结构化输出
│   │   ├── roundtable/route.ts       # 圆桌讨论：3角色+问题 → 各自视角
│   │   └── mystery/route.ts          # 每日神秘卡：日期 → 角色
│   │
│   ├── components/                   # UI 组件
│   │   ├── BubbleCanvas.tsx          # 气泡区域（CSS动画 + 随机轨迹）
│   │   ├── Bubble.tsx                # 单个气泡（头像+大小+颜色+光晕）
│   │   ├── MysteryCard.tsx           # 神秘卡（金色外框+翻开动画）
│   │   ├── StoryModal.tsx            # 故事浮窗（背景模糊+左右切换）
│   │   ├── CBTDialog.tsx             # CBT对话容器（分步渲染+继续按钮）
│   │   ├── CBTModule.tsx             # 单个CBT模块（流式逐字输出）
│   │   ├── RoundTable.tsx            # 圆桌区（右下角+拖拽接收）
│   │   ├── RoundTableResult.tsx      # 圆桌讨论结果（3角色视角展示）
│   │   ├── CollectionBar.tsx         # 底部收藏入口+展开列表
│   │   └── HistoryBar.tsx            # 底部历史入口+展开列表
│   │
│   ├── hooks/                        # 自定义 React Hooks
│   │   ├── useBubbles.ts             # 气泡状态管理（位置/大小/动画）
│   │   ├── useDrag.ts                # 拖拽逻辑（Pointer Events）
│   │   ├── useLongPress.ts           # 长按收藏逻辑（0.5s计时）
│   │   ├── useLocalStorage.ts        # LocalStorage 读写封装
│   │   └── useCBTStream.ts           # CBT流式输出+分步控制
│   │
│   ├── lib/                          # 工具函数
│   │   ├── llm.ts                    # LLM 调用封装（多模型切换）
│   │   ├── prompts.ts                # 所有 Prompt 模板
│   │   ├── colors.ts                 # 气泡纯色定义（多巴胺色系）
│   │   ├── characters.ts             # 角色池配置（不含头像）
│   │   ├── avatars.ts                # 角色头像映射表（用 name 索引）
│   │   └── utils.ts                  # 通用工具函数
│   │
│   ├── types/                        # TypeScript 类型定义
│   │   └── index.ts                  # 所有接口和类型
│   │
│   └── store/                        # 全局状态（React Context）
│       └── AppContext.tsx            # 应用状态：当前问题/选中角色/圆桌成员
│
├── public/                           # 静态资源
│   └── avatars/                      # 角色头像图片（后续替换 emoji）
│
├── package.json
├── tailwind.config.ts                # Tailwind 配置
├── tsconfig.json
├── next.config.js
└── .env.local                        # 环境变量（多个 LLM API Key）
```

### 目录设计原则

| 原则 | 说明 |
|------|------|
| 按职责分层 | `app` 管页面路由、`api` 管后端、`components` 管 UI、`hooks` 管逻辑、`lib` 管工具 |
| 文件名即功能 | 每个文件名直接说明它做什么，零基础也能找到 |
| 单文件单职责 | 每个组件/Hook 只做一件事，修改时不影响其他 |

---

## 二、核心模块划分

```
┌──────────────────────────────────────────────────────┐
│                     主页面 page.tsx                    │
│                                                       │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────┐  │
│  │ 输入框    │  │ 气泡区域   │  │ 底部操作栏        │  │
│  │          │  │           │  │                  │  │
│  │ 用户输入  │  │ BubbleCanvas│ │ CollectionBar  │  │
│  │ 问题     │  │  ├ Bubble  │  │ HistoryBar      │  │
│  │          │  │  └ Mystery │  │                  │  │
│  └────┬─────┘  │  Card     │  └──────────────────┘  │
│       │        └─────┬─────┘                        │
│       │              │                               │
│       │     ┌────────┼────────┐                     │
│       │     ▼        ▼        ▼                      │
│       │  点击    拖拽    长按                        │
│       │   │       │       │                         │
│       │   ▼       ▼       ▼                         │
│       │ ┌─────┐ ┌─────┐ ┌─────┐                    │
│       │ │故事  │ │圆桌 │ │收藏 │                    │
│       │ │浮窗  │ │区   │ │     │                    │
│       │ │Story │ │Round│ │     │                    │
│       │ │Modal │ │Table│ │     │                    │
│       │ └──┬──┘ └──┬──┘ └─────┘                    │
│       │    │       │                               │
│       │    ▼       ▼                               │
│       │  ┌─────────────┐                          │
│       │  │ CBT 对话     │  ← 核心输出模块           │
│       │  │ CBTDialog    │                          │
│       │  │  ├ Module 1  │                          │
│       │  │  ├ Module 2  │                          │
│       │  │  ├ Module 3  │                          │
│       │  │  ├ Module 4  │                          │
│       │  │  └ Module 5  │                          │
│       │  └─────────────┘                          │
│       │                │                           │
│       │                ▼                           │
│       │     记录到历史（LocalStorage）              │
└──────────────────────────────────────────────────────┘
```

### 模块职责表

| 模块 | 职责 | 依赖 |
|------|------|------|
| **BubbleCanvas** | 渲染所有气泡，CSS 动画驱动漂浮，管理气泡位置 | useBubbles, colors |
| **Bubble** | 单个气泡外观：头像(emoji) + 纯色 + 大小 + 光晕 | colors |
| **MysteryCard** | 神秘卡：金色外框 + 问号 + 翻开动画 | Framer Motion |
| **StoryModal** | 故事浮窗：背景模糊 + 人物介绍 + 多面人生 + "和Ta聊"（关闭后点其他气泡查看下一个） | Framer Motion |
| **CBTDialog** | CBT 对话容器：五模块按顺序逐个流式渲染，自动衔接无"继续"按钮 | useCBTStream |
| **CBTModule** | 单个 CBT 模块：逐字渲染 + 模块标题 + 内容 | useCBTStream |
| **RoundTable** | 圆桌区：右下角半透明 + 接收拖拽 + 满3人亮起 | useDrag |
| **RoundTableResult** | 圆桌讨论结果：3角色视角展示 + 选1人 | api/roundtable |
| **CollectionBar** | 底部收藏：计数 + 展开 + 横向列表 | useLocalStorage |
| **HistoryBar** | 底部历史：记录 + 展开 + 列表 | useLocalStorage |

### Hooks 职责表

| Hook | 职责 | 输入 → 输出 |
|------|------|------------|
| **useBubbles** | 管理气泡位置/大小/动画状态 | 角色列表 → 气泡状态数组 |
| **useDrag** | 拖拽逻辑：按下→移动→松开 | 气泡ID → 拖拽位置+是否在圆桌区 |
| **useLongPress** | 长按 0.5s 触发收藏 | 气泡ID → 是否触发 |
| **useLocalStorage** | LocalStorage 读写封装 | key → value（自动序列化） |
| **useCBTStream** | CBT 五模块自动衔接流式输出 | 角色+问题 → 五模块依次渲染 |

---

## 三、数据模型设计

### 核心类型定义

```typescript
// ============ 角色 ============
interface Character {
  id: string;                    // 唯一标识
  name: string;                  // 角色名
  avatar: string;                // 头像 emoji 或图片路径（后续替换为图片）
  domain: CharacterDomain;       // 领域
  source: CharacterSource;       // 来源类型
  matchScore: number;            // 匹配度 0-100
}

type CharacterDomain =
  | 'leader'      // 领袖/创业者
  | 'philosopher' // 哲人/思想家
  | 'explorer'    // 探索者/科学家
  | 'healer'      // 治愈者/导师
  | 'rebel'       // 反叛者/战士
  | 'creator';    // 创作者/艺术家

type CharacterSource =
  | 'real'        // 现实人物
  | 'movie'       // 电影角色
  | 'tv'          // 电视剧角色
  | 'game'        // 游戏角色
  | 'book'        // 书籍角色
  | 'anime';      // 动漫角色

// ============ 气泡 ============
interface Bubble {
  character: Character;
  size: BubbleSize;              // 大小（由 matchScore 映射）
  color: string;                 // 纯色（由 domain 映射，暂不做渐变）
  position: { x: number; y: number };  // 当前位置
  animationDuration: number;     // CSS 动画时长（秒）
  animationDelay: number;        // CSS 动画延迟（秒）
  isMystery: boolean;            // 是否为神秘卡
  isRevealed: boolean;           // 神秘卡是否已翻开
  hasGlow: boolean;               // 是否有光晕（聊过的角色）
}

type BubbleSize = 'large' | 'medium' | 'small';

// ============ 故事浮窗（多面人生） ============
interface Story {
  characterId: string;
  intro: CharacterIntro;         // 人物介绍
  facets: LifeFacet[];           // 多面人生片段（2-3个）
}

interface CharacterIntro {
  name: string;                  // 角色名
  source: string;                // 来自哪个领域/作品
  tagline: string;               // 一句话标签（如"登月第一人"）
}

interface LifeFacet {
  label: string;                 // 面的标签（如"登月时的冷静决断"）
  content: string;               // 这个人生片段的故事（角色口吻）
}

// ============ 角色推荐结果（预生成方案） ============
// 一次 API 调用返回角色 + 故事，点击气泡零等待
interface RecommendResult {
  characters: RecommendItem[];   // 5 个角色 + 各自故事
}

interface RecommendItem {
  name: string;                  // 角色名
  matchScore: number;            // 匹配度 0-100
  story: {
    intro: CharacterIntro;       // 人物介绍
    facets: LifeFacet[];          // 多面人生片段
  };
}

// ============ CBT 五模块 ============
interface CBTResponse {
  characterId: string;
  question: string;
  modules: CBTModule[];
}

interface CBTModule {
  index: 1 | 2 | 3 | 4 | 5;
  title: string;                 // 模块标题
  content: string;               // 模块内容（角色口吻）
}

// 模块5 特有结构
interface CBTActionModule extends CBTModule {
  action: {
    firstStep: string;           // 极小行动
    emergencyScript: string;     // 应急话术
    backupPlan: string;          // 备选方案
  };
}

// ============ 圆桌讨论 ============
interface RoundTableDiscussion {
  question: string;
  participants: Character[];     // 3个角色
  perspectives: RoundTablePerspective[];
}

interface RoundTablePerspective {
  characterId: string;
  viewpoint: string;             // 一句话立场
  story: string;                 // 一个相关故事
}

// ============ 收藏 ============
interface Collection {
  characters: CollectionItem[];
}

interface CollectionItem {
  character: Character;
  collectedAt: number;          // 时间戳
}

// ============ 历史记录 ============
interface History {
  records: HistoryRecord[];
}

interface HistoryRecord {
  id: string;
  question: string;              // 用户输入的问题
  characterName: string;         // 角色名
  characterAvatar: string;       // 角色头像
  timestamp: number;             // 时间戳
}

// ============ 神秘卡状态 ============
interface MysteryCardState {
  date: string;                  // YYYY-MM-DD
  character: Character;          // 今日角色
  isRevealed: boolean;           // 是否已翻开
}
```

### 气泡颜色定义（纯色，暂不做渐变）

```typescript
// src/lib/colors.ts

const DOMAIN_COLORS: Record<CharacterDomain, string> = {
  leader:      '#FFD700',  // 金色
  philosopher: '#B8A9FF',  // 紫调
  explorer:    '#7FE5FF',  // 蓝青
  healer:      '#A8FFD7',  // 绿调
  rebel:       '#FF9EC7',  // 红粉
  creator:     '#FFD49E',  // 橙黄
};

// 匹配度 → 气泡大小
function matchScoreToSize(score: number): BubbleSize {
  if (score >= 70) return 'large';   // 80px
  if (score >= 40) return 'medium';  // 60px
  return 'small';                    // 40px
}

const SIZE_PX: Record<BubbleSize, number> = {
  large: 80,
  medium: 60,
  small: 40,
};
```

### LocalStorage 数据结构

```typescript
// Key 命名规范：fakeit:{模块}

// fakeit:collection → Collection
// fakeit:history    → History
// fakeit:mystery    → MysteryCardState
// fakeit:bubbles    → Bubble[]（当前会话气泡，刷新后清除）
```

---

### 角色池与头像配置

#### 角色池 `src/lib/characters.ts`

角色信息与头像分离，角色池只管角色数据，头像由独立映射表管理。

```typescript
// src/lib/characters.ts

import { Character } from '@/types';
import { AVATARS, getAvatar } from './avatars';

// 角色池：新增/删除角色只改这里
export const CHARACTER_POOL: Character[] = [
  // ===== 探索者 =====
  { id: 'neil-armstrong', name: 'Neil Armstrong', avatar: '', domain: 'explorer', source: 'real', matchScore: 0 },
  { id: 'marie-curie',    name: '居里夫人',       avatar: '', domain: 'explorer', source: 'real', matchScore: 0 },

  // ===== 反叛者 =====
  { id: 'nezha',       name: '哪吒',       avatar: '', domain: 'rebel', source: 'anime', matchScore: 0 },
  { id: 'arya-stark',  name: 'Arya Stark', avatar: '', domain: 'rebel', source: 'tv',    matchScore: 0 },

  // ===== 领袖 =====
  { id: 'steve-jobs', name: 'Steve Jobs', avatar: '', domain: 'leader', source: 'real', matchScore: 0 },
  { id: 'napoleon',   name: '拿破仑',      avatar: '', domain: 'leader', source: 'real', matchScore: 0 },

  // ===== 哲人 =====
  { id: 'gandalf', name: 'Gandalf', avatar: '', domain: 'philosopher', source: 'movie', matchScore: 0 },
  { id: 'zhuangzi', name: '庄子',   avatar: '', domain: 'philosopher', source: 'real',  matchScore: 0 },

  // ===== 治愈者 =====
  { id: 'dumbledore', name: '邓布利多',  avatar: '', domain: 'healer', source: 'movie', matchScore: 0 },
  { id: 'mr-rogers',  name: 'Mr. Rogers', avatar: '', domain: 'healer', source: 'tv',    matchScore: 0 },

  // ===== 创作者 =====
  { id: 'van-gogh',  name: '梵高',    avatar: '', domain: 'creator', source: 'real', matchScore: 0 },
  { id: 'miyazaki',  name: '宫崎骏',  avatar: '', domain: 'creator', source: 'real', matchScore: 0 },
];

// 运行时填充头像：从映射表查 name → avatar
export function getCharactersWithAvatars(): Character[] {
  return CHARACTER_POOL.map(c => ({
    ...c,
    avatar: getAvatar(c.name),
  }));
}

// 按名称查单个角色
export function getCharacterByName(name: string): Character | undefined {
  const pool = getCharactersWithAvatars();
  return pool.find(c => c.name === name);
}
```

#### 头像映射表 `src/lib/avatars.ts`

独立文件，用角色 name 做 key 索引。替换头像只改这个文件。

```typescript
// src/lib/avatars.ts

// 角色头像映射表
// key   = 角色名（与 characters.ts 的 name 字段一致）
// value = emoji 或图片路径
// 替换头像只改这个文件，不动角色池

export const AVATARS: Record<string, string> = {
  // ===== emoji 阶段（后续可换成图片路径）=====
  'Neil Armstrong': '🧑‍🚀',
  '居里夫人':       '🔬',
  '哪吒':           '🐉',
  'Arya Stark':    '⚔️',
  'Steve Jobs':    '👨‍💼',
  '拿破仑':         '👑',
  'Gandalf':       '🧙‍♂️',
  '庄子':           '🌿',
  '邓布利多':       '🧓',
  'Mr. Rogers':    '🤗',
  '梵高':           '🎨',
  '宫崎骏':         '🎬',
};

// 获取头像：先查映射表，查不到用默认 emoji
export function getAvatar(name: string): string {
  return AVATARS[name] || '👤';
}
```

#### 后续替换头像

```typescript
// 现在（emoji）
'Neil Armstrong': '🧑‍🚀',

// 后续（图片路径）
'Neil Armstrong': '/avatars/neil-armstrong.png',
```

图片放到 `public/avatars/` 目录，改 `avatars.ts` 这一行即可，角色池和组件代码都不用动。

#### 新增角色流程

1. `characters.ts` 加角色信息（id、name、domain、source）
2. `avatars.ts` 加一行头像映射（name → emoji/图片路径）

两个文件各加一行，互不干扰。

#### LLM 与角色池的关系（预生成方案）

```
角色池 characters.ts（12个角色）
  提供 name 列表给 LLM
         │
         ▼
用户问题 + 角色池 name 列表 → LLM（一次调用）
         │
         ▼
LLM 返回 5 个角色：
  · name + matchScore（角色推荐）
  · story.intro + story.facets（多面人生，预生成）
         │
         ▼
前端用 name 查角色池 → 拿到 domain → 映射气泡颜色
前端用 name 查头像表 → 拿到 avatar → 渲染气泡头像
前端把 story 存入内存缓存 → 点击气泡零等待
```

LLM 一次调用完成角色推荐 + 故事预生成。
头像和颜色由前端配置决定，LLM 不需要知道。

#### 缓存策略

```typescript
// 前端缓存：推荐结果 + 故事
// 存在 AppContext 或组件 state 中

interface RecommendCache {
  question: string;              // 用户输入的问题
  characters: RecommendItem[];  // 5 个角色 + 故事
}

// 用户点击气泡 → 从 cache.characters 找到对应角色 → 直接取 story
// 无需再次调用 API
```

---

## 四、LLM 配置设计

### 多模型切换

```typescript
// src/lib/llm.ts

interface LLMConfig {
  name: string;                  // 模型标识（仅用于日志/调试）
  model: string;                 // 模型名（如 gpt-4o-mini）
  apiKey: string;                // 从环境变量读取
  baseURL?: string;              // 自定义 API 地址（可选，兼容第三方）
}

// 当前使用的模型——通过修改 LLM_CONFIG 直接切换
// 开发时改这里测试不同模型，上线后固定一个
export const LLM_CONFIG: LLMConfig = {
  name: process.env.LLM_NAME || 'default',
  model: process.env.LLM_MODEL || 'gpt-4o-mini',
  apiKey: process.env.LLM_KEY || '',
  baseURL: process.env.LLM_BASE,    // 可选
};

// 统一调用入口
export async function callLLM(prompt: string): Promise<ReadableStream> {
  // 调用 OpenAI 兼容 API，流式返回
  // ...
}
```

### 环境变量配置

```bash
# .env.local
# 一次只配一个模型，切换时改这里

# 用 OpenAI 时
LLM_NAME=openai-gpt4o-mini
LLM_KEY=sk-xxxxxxxxxxxx
LLM_MODEL=gpt-4o-mini
# LLM_BASE=                              # 可选，OpenAI 官方不需要填

# 切换到 DeepSeek 时，注释掉上面，改成：
# LLM_NAME=deepseek
# LLM_KEY=sk-xxxxxxxxxxxx
# LLM_MODEL=deepseek-chat
# LLM_BASE=https://api.deepseek.com/v1
```

### 模型切换方式

**不做 UI 切换，改 .env.local 即可：**
- 开发测试时：注释/取消注释环境变量，重启服务即可换模型
- 上线后：固定一个模型配置，不需要切换

---

## 五、代码规范建议

### 文件命名

| 类型 | 规范 | 示例 |
|------|------|------|
| 组件 | PascalCase | `BubbleCanvas.tsx`, `StoryModal.tsx` |
| Hook | camelCase + use 前缀 | `useBubbles.ts`, `useDrag.ts` |
| API Route | kebab-case 目录 | `api/recommend/route.ts` |
| 工具函数 | camelCase | `colors.ts`, `llm.ts` |
| 类型文件 | 单数 | `types/index.ts` |

### 组件规范

```typescript
// 每个组件文件结构：类型导入 → 组件定义 → 导出

// ✅ 正确示例
import { Character } from '@/types';
import { DOMAIN_COLORS } from '@/lib/colors';

interface BubbleProps {
  character: Character;
  size: BubbleSize;
  onClick: (id: string) => void;
  onLongPress: (id: string) => void;
}

export function Bubble({ character, size, onClick, onLongPress }: BubbleProps) {
  // 1. Hooks
  // 2. 事件处理函数
  // 3. 渲染
  return (
    <div onClick={...} onPointerDown={...}>
      {/* ... */}
    </div>
  );
}
```

### CSS/Tailwind 规范

```typescript
// 颜色统一从 colors.ts 读取，不在组件内硬编码

// ✅ 正确（纯色）
<div style={{ backgroundColor: color }}>

// ❌ 错误
<div style={{ backgroundColor: '#FFD700' }}>
```

### 状态管理规范

```typescript
// 全局状态用 React Context，不用 Redux/Zustand（Demo 不需要）
// src/store/AppContext.tsx

interface AppState {
  question: string;                    // 当前问题
  bubbles: Bubble[];                   // 当前气泡
  recommendCache: RecommendItem[] | null;  // 预生成结果（角色+故事缓存）
  selectedCharacter: Character | null;  // 选中的角色
  roundTableMembers: Character[];      // 圆桌成员
  currentCBTModule: number;            // 当前 CBT 模块索引（1-5，自动衔接）
  isLoading: boolean;                  // 预生成 loading 状态
}

interface AppContextValue extends AppState {
  setQuestion: (q: string) => void;
  setBubbles: (b: Bubble[]) => void;
  selectCharacter: (c: Character) => void;
  addToRoundTable: (c: Character) => void;
}
```

### 开发顺序建议

```
第1步：搭项目骨架
  · Next.js + Tailwind 初始化
  · 目录结构创建
  · globals.css 写气泡 CSS 动画
  · .env.local 配置 LLM API Key

第2步：LLM 调用封装
  · llm.ts 单模型配置读取
  · prompts.ts 所有 Prompt 模板
  · API Routes 搭建

第3步：静态页面
  · 主页面布局（输入框 + 气泡区 + 底部栏）
  · 用真实 LLM 返回数据渲染气泡
  · 气泡漂浮动画跑通

第4步：故事浮窗（多面人生）
  · 点击气泡弹出浮窗
  · 人物介绍 + 多面人生片段渲染
  · 关闭浮窗后可点击其他气泡查看下一个角色

第5步：CBT 对话
  · 五模块自动衔接，逐个流式输出
  · 无"继续"按钮，模块间自动过渡
  · 模块之间有过渡动画（淡入/滑动）

第6步：拖拽 + 圆桌
  · 拖拽气泡到圆桌区
  · 圆桌满3人亮起
  · 圆桌讨论结果展示

第7步：收藏 + 历史
  · 长按收藏
  · LocalStorage 读写
  · 底部展开列表

第8步：神秘卡
  · 金色外框 + 问号
  · 翻开动画
  · 每日刷新逻辑
```

---

*架构设计 · 2026-07-17 · v2 · 多面人生 + 多模型 + 纯色气泡*
