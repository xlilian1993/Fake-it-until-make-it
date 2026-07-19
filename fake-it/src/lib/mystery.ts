import { getCharacterNames } from './characters';

export interface MysteryEntry {
  name: string;
}

function dateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

/** 根据日期从完整角色池中固定选出一个今日限定角色 */
export function getDailyMystery(): MysteryEntry {
  const allNames = getCharacterNames();
  const seed = dateSeed();
  const idx = seed % allNames.length;
  return { name: allNames[idx] };
}
