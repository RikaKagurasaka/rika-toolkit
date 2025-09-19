<script setup lang="ts">
import { Transition } from "vue";
import OvertuneConfig from "./components/OvertuneConfig.vue";
import RxConfig from "./components/RxConfig.vue";
import CompCurve from "./components/CompCurve.vue";
import { useConfig } from "./composables/config";

const { collapseTopPanel } = useConfig();
</script>

<template>
  <div class="p-8">
    <div class="flex justify-start">
      <button
        class="btn btn-ghost text-xs p-1"
        @click="collapseTopPanel = !collapseTopPanel"
      >
        <span v-if="collapseTopPanel">显示配置</span>
        <span v-else>收起配置</span>
      </button>
    </div>
    <div class="flex gap-16" v-if="!collapseTopPanel">
      <RxConfig />
      <OvertuneConfig />
    </div>
    <CompCurve />
  </div>
</template>

<style lang="css" scoped></style>
