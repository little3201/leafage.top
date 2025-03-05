// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
  future: {
    compatibilityVersion: 4
  },

  devtools: { enabled: true },

  modules: [
    '@nuxt/content',
    "@nuxt/eslint"
  ],

  css: ['~/assets/css/main.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  compatibilityDate: "2025-03-03",

  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['sql', 'java', 'xml']
        }
      }
    }
  }
})