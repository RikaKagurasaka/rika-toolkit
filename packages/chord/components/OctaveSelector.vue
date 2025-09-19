<script setup lang="ts">
import LamplightIcon from './LamplightIcon.vue';

const props = defineProps<{
  modelValue: number;
}>();
const modelValue = useVModel(props, "modelValue");
</script>

<template>
  <div class="flex gap-2">
    <template v-for="w in [-1, 0, 1]" :key="w">
      <label
        :for="`octave-${w}`"
        class="cursor-pointer w-6 h-6 flex items-center justify-center"
        :class="modelValue === w ? 'opacity-100 saturate-150' : 'opacity-20'"
        ><LamplightIcon class="inline-flex!" :w="w"
      /></label>
      <input
        type="radio"
        :id="`octave-${w}`"
        :value="w"
        hidden
        v-model="modelValue"
      />
    </template>
  </div>
</template>

<style lang="scss" scoped></style>
