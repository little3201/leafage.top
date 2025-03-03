// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'


export default withNuxt(
  // Your custom configs here
  [
    {
      rules: {
        // https://eslint.org/docs/latest/use/configure/configuration-files
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-multiple-template-root': 'off'
      }
    }
  ]
)
