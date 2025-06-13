// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  modules: [
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@nuxt/icon",
    "@nuxt/image",
    "@vueuse/nuxt",
    "@unocss/nuxt",
    '@hypernym/nuxt-gsap',
  ],
  css: ["@unocss/reset/tailwind-compat.css", "assets/index.css"],
  app: {
    head: {
      title: "Rika 工具箱",
      meta: [
        { name: "description", content: " 有些时候会突然想写一点小工具，但是不知道这个东西写出来有什么用，或者不知道往哪里放。这个项目就是为了解决该问题而诞生的。这里存放了我不知道如何分类的小工具。 " },
      ],
    },
  },
});
