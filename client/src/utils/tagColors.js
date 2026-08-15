export const CATEGORY_PALETTES = [
  { name: 'purple', color: 'var(--purple)', bg: 'var(--purple-bg)' },
  { name: 'teal', color: 'var(--teal)', bg: 'var(--teal-bg)' },
  { name: 'pink', color: 'var(--pink)', bg: 'var(--pink-bg)' },
  { name: 'coral', color: 'var(--coral)', bg: 'var(--coral-bg)' }
];

/**
 * Deterministically maps a tag string to a category color theme so colors never flicker.
 */
export const getTagTheme = (tag = '') => {
  const str = String(tag || '').toLowerCase().trim();
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % CATEGORY_PALETTES.length;
  return CATEGORY_PALETTES[index];
};
