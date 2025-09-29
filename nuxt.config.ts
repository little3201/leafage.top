// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'
import tailwindcss from "@tailwindcss/vite"

export default defineNuxtConfig({
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

  content: {
    build: {
      markdown: {
        highlight: {
          langs: ['html', 'css', 'vue','sql', 'java', 'xml', 'yaml', 'md']
        }
      }
    }
  }
})