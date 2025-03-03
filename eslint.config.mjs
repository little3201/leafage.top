// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import globals from "globals"
import js from "@eslint/js"
import pluginVue from "eslint-plugin-vue"

export default withNuxt(
  // Your custom configs here
  [
    {
      languageOptions: {
        globals: {
          ...globals.browser,
          ...globals.node
        },
        ecmaVersion: "latest",
        sourceType: 'module'
      }
    },
    js.configs.recommended,
    ...pluginVue.configs["flat/recommended"], // Vue3
    {
      rules: {
        // https://eslint.org/docs/latest/use/configure/configuration-files
        'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
        'vue/multi-word-component-names': 'off',
        'vue/no-multiple-template-root': 'off'
      }
    },
    { ignores: [".nuxt/"] }
  ]
)
