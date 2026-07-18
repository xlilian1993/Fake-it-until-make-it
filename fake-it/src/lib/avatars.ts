const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';

const AVATAR_MAP: Record<string, string> = {
  '甄嬛': '/avatars/zhenhuan.png',
  '林黛玉': '/avatars/lindaiyu.png',
  'Steve Jobs': '/avatars/jobs.png',
  '乔布斯': '/avatars/jobs.png',
  '宫崎骏': '/avatars/miyazaki.png',
  '庄子': '/avatars/zhuangzi.png',
  '阿姆斯特朗': '/avatars/armstrong.png',
  'Neil Armstrong': '/avatars/armstrong.png',
  '谷爱凌': '/avatars/guailing.png',
  '哈兰德': '/avatars/haaland.png',
  'Erling Haaland': '/avatars/haaland.png',
  '居里夫人': '/avatars/curie.png',
  'Marie Curie': '/avatars/curie.png',
  '郎平': '/avatars/langping.png',
  '马云': '/avatars/mayun.png',
  '马斯克': '/avatars/musk.png',
  'Elon Musk': '/avatars/musk.png',
  '肖邦': '/avatars/chopin.png',
  '贝多芬': '/avatars/beethoven.png',
  '牛顿': '/avatars/newton.png',
  '泰勒斯威夫特': '/avatars/taylorswift.png',
  'Taylor Swift': '/avatars/taylorswift.png',
  '达芬奇': '/avatars/davinci.png',
  '莫扎特': '/avatars/mozart.png',
  '张桂梅': '/avatars/zhangguimei.jpg',
  '安陵容': '/avatars/anlingrong.png',
  '苏轼': '/avatars/sushi.png',
  '王阳明': '/avatars/wangyangming.png',
  '爱因斯坦': '/avatars/einstein.png',
  '孙悟空': '/avatars/sunwukong.png',
  '莎士比亚': '/avatars/shakespeare.png',
  '李白': '/avatars/libai.png',
  '武则天': '/avatars/wuzetian.png',
  '诸葛亮': '/avatars/zhugeliang.png',
  '梵高': '/avatars/vangogh.png',
  '王菲': '/avatars/wangfei.png',
};

export function getAvatar(name: string): string {
  const path = AVATAR_MAP[name];
  return path ? `${BASE}${path}` : '🫧';
}

export function isImageAvatar(avatar: string): boolean {
  return avatar.includes('/avatars/');
}
