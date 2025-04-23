<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<style>
html {
  @apply bg-gray-50 dark:bg-gray-900;
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
  @apply p-1 rounded-md border border-gray-300 dark:border-gray-700 max-w-screen-md font-mono;
  textarea {
    @apply h-20;
  }
}
.form-control {
  @apply flex flex-col gap-2 my-2;
}
</style>
