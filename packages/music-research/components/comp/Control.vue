<script setup lang="ts">
import { useVModel } from "@vueuse/core";

const props = defineProps<{
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  options?: number[];
  optionsLabel?: (value: number) => string;
  optionsSetValueTransform?: (value: number) => number;
}>();
const modelValue = useVModel(props, "value");
const optionSetValue = (value: number) => {
  if (props.optionsSetValueTransform) {
    return props.optionsSetValueTransform(value);
  }
  return value;
};
</script>

<template>
  <div class="grid grid-cols-2 gap-1 w-48">
    <span>{{ label }}</span>
    <input v-model.number="modelValue" type="number" class="input" />
    <input
      type="range"
      :min="min"
      :max="max"
      :step="step"
      v-model.number="modelValue"
      class="grid-col-span-2"
    />
    <div
      class="flex grid-col-span-2 grid-row-start-3 btn-group"
      v-if="options?.length"
    >
      <button
        @click="modelValue = optionSetValue(value)"
        class=""
        v-for="value in options || []"
        :class="
          optionSetValue(value) === modelValue ? 'btn-primary' : 'btn-outline'
        "
        :key="value"
      >
        {{ optionsLabel ? optionsLabel(value) : value }}
      </button>
    </div>
  </div>
</template>

<style lang="css" scoped>
.btn-group button {
  @apply btn-sm;
  @apply rounded-none flex-1 text-xs p-1;
  &:first-child {
    @apply rounded-l;
  }
  &:last-child {
    @apply rounded-r;
  }
}
</style>
