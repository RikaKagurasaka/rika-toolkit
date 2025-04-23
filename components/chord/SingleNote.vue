<script setup lang="ts">
const { name } = defineProps<{
  name: string;
}>();
const letter = computed(() => name.slice(0, 1));
const modifier = computed(() => name.slice(1));
const formatedModifier = computed(() => {
  if (modifier.value === "b") return "♭";
  if (modifier.value === "#") return "♯";
  return "";
});
const hasModifier = computed(() => modifier.value !== "");
</script>

<template>
  <div class="single-note">
    <div class="single-note-letter">{{ letter }}</div>
    <div class="single-note-modifier" v-if="hasModifier">
      {{ formatedModifier }}
    </div>
  </div>
</template>

<style lang="scss" scoped>
.single-note {
  @apply flex items-center justify-center flex-nowrap;
  &:has(+ .single-note)::after {
    @apply content-['/'] mr-0.5;
  }
}
.single-note-modifier {
  @apply text-sm font-mono;
}
</style>
