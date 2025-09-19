<template>
  <div>
    <Analytics />
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup lang="ts">
import { Analytics } from "@vercel/analytics/nuxt";
</script>

<style>
html {
  @apply bg-gray-50;
}
html,
body {
  @apply h-full;
}
h1 {
  @apply text-2xl font-bold;
}
textarea,
input {
  @apply p-1 rounded-md border border-gray-300  max-w-screen-md font-mono;
  textarea {
    @apply h-20;
  }
}
.form-control {
  @apply flex flex-col gap-2 my-2;
}
</style>
