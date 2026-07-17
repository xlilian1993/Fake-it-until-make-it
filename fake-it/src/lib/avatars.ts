const AVATAR_MAP: Record<string, string> = {
  '乔布斯': '/avatars/jobs.png',
  'Steve Jobs': '/avatars/jobs.png',
  '林黛玉': '/avatars/lindaiyu.png',
  '宫崎骏': '/avatars/miyazaki.png',
  '甄嬛': '/avatars/zhenhuan.png',
  '庄子': '/avatars/zhuangzi.png',
};

export function getAvatar(name: string): string {
  return AVATAR_MAP[name] || '🫧';
}

export function isImageAvatar(avatar: string): boolean {
  return avatar.startsWith('/');
}
