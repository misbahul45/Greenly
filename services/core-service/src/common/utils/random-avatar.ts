export function randomAvatarUrl(name: string): string {
  const seed = encodeURIComponent(name);
  const bgColors = 'd4edda,c3e6cb,a8d5ba,76b88e,e8f5e9';
  
  return `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=${bgColors}&backgroundType=solid&width=200&height=200`;
}