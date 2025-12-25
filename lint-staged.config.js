/**
 * @filename: lint-staged.config.js
 * @type {import('lint-staged').Configuration}
 */
const config = {
  '*.{js,mjs,ts,mts,tsx}': 'eslint --fix --max-warnings=0',
  '*.{ts,tsx}': () => 'tsc --noEmit'
}

export default config