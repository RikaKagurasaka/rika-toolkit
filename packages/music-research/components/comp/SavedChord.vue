<script setup lang="ts">
const { chord, isCurrent = false } = defineProps<{
  chord: number[];
  isCurrent?: boolean;
}>();
const emit = defineEmits<{
  (e: "delete"): void;
  (e: "apply"): void;
  (e: "play"): void;
  (e: "stop"): void;
}>();
const root = computed(() => chord[0]!);
const positives = computed(() =>
  chord.filter((d) => d > root.value).sort((a, b) => a - b)
);
const negatives = computed(() =>
  chord.filter((d) => d < root.value).sort((a, b) => a - b)
);
</script>

<template>
  <div class="card">
    <div class="w-full h-full flex flex-col justify-evenly items-center">
      <div v-if="positives.length" class="flex items-center text-blue-600">
        <span v-for="(sem, i) in positives" :key="i" class="mx-1">
          <ruby
            >{{ Math.round(sem) }}
            <rt v-if="root != 0">+{{ Math.round(sem - root) }}</rt></ruby
          >
        </span>
      </div>
      <span v-if="root != 0">{{ Math.round(root) }}</span>
      <div v-if="negatives.length" class="flex items-center text-red-600">
        <span v-for="(sem, i) in negatives" :key="i" class="mx-1">
          <ruby
            >{{ Math.round(sem) }}
            <rt v-if="root != 0">{{ Math.round(sem - root) }}</rt></ruby
          >
        </span>
      </div>
    </div>
    <div
      class="btn-play my-btn"
      @mousedown="emit('play')"
      @mouseup="emit('stop')"
      @mouseleave="emit('stop')"
    >
      <span class="p-1 bg-white rounded i-mdi-volume"></span>
    </div>
    <div class="btn-apply my-btn" @click="emit('apply')">
      <span
        class="p-1 bg-white rounded"
        :class="[isCurrent ? 'i-mdi-arrow-right' : 'i-mdi-arrow-left']"
      ></span>
    </div>
    <div class="btn-delete my-btn" @click="emit('delete')">
      <span class="p-1 bg-white rounded i-mdi-delete"></span>
    </div>
  </div>
</template>

<style lang="css" scoped>
.card {
  @apply bg-gray-50 p-4 rounded-lg shadow select-none hover:shadow-lg transition-all cursor-pointer flex items-center relative border;
}
.my-btn {
  @apply h-0 transition-all overflow-hidden transition-duration-100;
  @apply rounded absolute top-full  flex justify-center items-center cursor-pointer opacity-90;
}
.btn-delete {
  @apply left-0 w-full bg-red-500 opacity-100;
  .card:hover & {
    @apply h-6 top-full;
  }
}
.btn-apply {
  @apply left-1/2 w-1/2  bg-green-500 text-lg;
  .card:hover & {
    @apply h-full top-0;
  }
}
.btn-play {
  @apply left-0 w-1/2  bg-blue-500 text-lg;
  .card:hover & {
    @apply h-full top-0;
  }
}
</style>
