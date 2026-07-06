export const AVATAR_GRADIENTS = [
  "from-brand to-brand2",
  "from-gain to-emerald-400",
  "from-xp to-amber-300",
  "from-loss to-rose-400",
  "from-violet-500 to-fuchsia-400",
  "from-sky-500 to-cyan-400",
];

export function gradientForSymbol(symbol: string) {
  const idx = symbol.charCodeAt(0) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}
