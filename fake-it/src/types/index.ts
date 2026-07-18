// ============ 角色 ============
export type CharacterDomain =
  | 'leader'      // 领袖/创业者
  | 'philosopher' // 哲人/思想家
  | 'explorer'    // 探索者/科学家
  | 'healer'      // 治愈者/导师
  | 'rebel'       // 反叛者/战士
  | 'creator';    // 创作者/艺术家

export type CharacterSource =
  | 'real'   // 现实人物
  | 'movie'  // 电影角色
  | 'tv'     // 电视剧角色
  | 'game'   // 游戏角色
  | 'book'   // 书籍角色
  | 'anime'; // 动漫角色

export interface Character {
  id: string;
  name: string;
  avatar: string;
  domain: CharacterDomain;
  source: CharacterSource;
  matchScore: number;
}

// ============ 气泡 ============
export type BubbleSize = 'large' | 'medium' | 'small';

export interface Bubble {
  character: Character;
  size: BubbleSize;
  color: string;
  position: { x: number; y: number };
  animationDuration: number;
  animationDelay: number;
  isMystery: boolean;
  isRevealed: boolean;
  hasGlow: boolean;
}

// ============ 故事（多面人生） ============
export interface CharacterIntro {
  name: string;
  source: string;
  tagline: string;
}

export interface LifeFacet {
  label: string;
  content: string;
}

export interface Story {
  characterId: string;
  intro: CharacterIntro;
  facets: LifeFacet[];
}

// ============ 角色推荐结果（预生成方案） ============
export interface RecommendItem {
  name: string;
  matchScore: number;
  domain: CharacterDomain;
  source: CharacterSource;
  story: {
    intro: CharacterIntro;
    facets: LifeFacet[];
  };
}

export interface RecommendResult {
  characters: RecommendItem[];
}

// ============ CBT 五模块 ============
export interface CBTModule {
  index: 1 | 2 | 3 | 4 | 5;
  title: string;
  content: string;
  action?: {
    firstStep: string;
    emergencyScript: string;
    backupPlan: string;
  };
}

export interface CBTActionModule extends CBTModule {
  action: {
    firstStep: string;
    emergencyScript: string;
    backupPlan: string;
  };
}

export interface CBTResponse {
  characterName: string;
  question: string;
  modules: CBTModule[];
}

// ============ 圆桌讨论 ============
export interface RoundTablePerspective {
  characterName: string;
  viewpoint: string;   // 一句话立场
  story: string;       // 一个相关故事
}

export interface RoundTableResponse {
  question: string;
  perspectives: RoundTablePerspective[];
}
