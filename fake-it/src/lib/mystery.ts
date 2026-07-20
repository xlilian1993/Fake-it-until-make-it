export interface MysteryEntry {
  name: string;
}

export function getMysteryAvatar(): string {
  return `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/mystery-face.png`;
}

const MYSTERY_POOL = ['甄嬛', '孙悟空', '东方不败'];

/** 从三人池中随机选出一个今日限定角色 */
export function getDailyMystery(): MysteryEntry {
  const idx = Math.floor(Math.random() * MYSTERY_POOL.length);
  return { name: MYSTERY_POOL[idx] };
}
