<script setup lang="ts">
import { ref } from "vue";
import { usePlot } from "../composables/compCurve";
import SavedChord from "./comp/SavedChord.vue";
import Control from "./comp/Control.vue";
import { useConfig } from "../composables/config";

const svg = ref<SVGSVGElement | null>(null);
const modes = { interval: "音程", chord: "和弦", conchord: "和声" };
const snappingOptions = {
  auto: "自动",
  valley: "谷点",
  peak: "峰点",
  added: "和弦音",
  endpoints: "端点",
  edo: "平均律",
};
const ticksOptions = {
  note: "音名",
  edo: "平均律",
  cents: "音分",
};
const {
  edo,
  negativeX,
  maxX,
  snappingDistance,
  snapping,
  mainFrequency,
  volume,
  xAxisTickType,
} = useConfig();
const { snappedMouseCent, addedNotes, play, stop, savedChords, data, mode } =
  usePlot({
    svg,
  });

function myPlay() {
  switch (mode.value) {
    case "interval":
    case "chord":
      play([0, snappedMouseCent.value, ...addedNotes.value]);
      break;
    case "conchord":
      play([0, ...addedNotes.value].map((d) => snappedMouseCent.value + d));
      break;
  }
}
</script>

<template>
  <div>
    <h2 class="text-lg font-bold mb-4">复合不和谐度曲线</h2>
    <div class="flex gap-8 mb-4 items-end">
      <Control
        label="平均律"
        v-model:value="edo"
        :min="6"
        :max="53"
        :step="1"
        :options="[12, 19, 31, 41, 53, 93]"
      ></Control>
      <Control
        label="音高范围"
        v-model:value="maxX"
        :min="0"
        :max="3600"
        :step="10"
        :options="[0.5, 1, 2, 3, 4, 5]"
        :optionsSetValueTransform="(v) => v * 1200"
      ></Control>
      <Control
        label="基准音"
        v-model:value="mainFrequency"
        :min="20"
        :max="880"
        :step="1"
        :options="[130.81, 220, 261.62, 440, 523.25]"
        :optionsLabel="(v) => Math.round(v).toString()"
      ></Control>
      <div class="flex flex-col items-start">
        <div class="grid gap-x-2 grid-rows-2 grid-flow-col">
          <span class="text-sm">模式</span>
          <div class="flex items-center btn-group">
            <button
              class=""
              v-for="(label, key) in modes"
              :key="key"
              :class="{
                'btn-primary': mode === key,
                'btn-outline': mode !== key,
              }"
              @click="mode = key"
            >
              {{ label }}
            </button>
          </div>
          <span class="text-sm">低音</span>
          <div class="flex items-center btn-group">
            <button
              class=""
              :class="{
                'btn-primary': negativeX,
                'btn-outline': !negativeX,
              }"
              @click="negativeX = !negativeX"
            >
              {{ negativeX ? "开" : "关" }}
            </button>
          </div>
          <span class="text-sm">横轴标签</span>
          <div class="flex items-center btn-group">
            <button
              v-for="(label, key) in ticksOptions"
              :key="key"
              :class="{
                'btn-primary': xAxisTickType === key,
                'btn-outline': xAxisTickType !== key,
              }"
              class="text-xs p-1 w-fit whitespace-nowrap"
              @click="xAxisTickType = key"
            >
              {{ label }}
            </button>
          </div>
        </div>
        <span class="text-sm">吸附</span>
        <div class="flex items-center btn-group">
          <button
            v-for="(label, key) in snappingOptions"
            :key="key"
            @click="
              snapping = snapping.includes(key)
                ? snapping.filter((d) => d !== key)
                : [...snapping, key]
            "
            class="text-xs p-1 w-fit whitespace-nowrap"
            :class="{
              'btn-primary': snapping.includes(key),
              'btn-outline': !snapping.includes(key),
            }"
          >
            {{ label }}
          </button>
        </div>
      </div>
      <div class="flex items-center">
        <span
          class="mr-2 cursor-pointer"
          :class="volume === 0 ? 'i-mdi-volume-mute' : 'i-mdi-volume-high'"
          @click="volume = volume === 0 ? 5 : 0"
        ></span>
        <input
          type="range"
          min="0"
          max="5"
          step="0.1"
          v-model.number="volume"
          @change=""
          class="flex-1 w-16"
        />
      </div>
    </div>
    <svg
      ref="svg"
      class="w-full h-80 border cursor-crosshair"
      @mousedown="myPlay()"
      @mouseup="stop()"
      @mouseleave="stop()"
    ></svg>
    <div class="w-full grid grid-cols-[auto_1fr] my-4 gap-8">
      <div>
        <h2 class="text-lg font-bold my-4 flex items-center gap-2">
          当前和弦/和声
        </h2>
        <SavedChord
          v-if="addedNotes.length"
          :chord="
            mode === 'conchord'
              ? [
                  snappedMouseCent,
                  ...addedNotes.map((d) => snappedMouseCent + d),
                ]
              : [0, ...addedNotes]
          "
          :isCurrent="true"
          @delete="addedNotes = []"
          @apply="
            addedNotes.length && savedChords.push([0, ...addedNotes]);
            addedNotes.splice(0, addedNotes.length);
          "
          @play="play([0, ...addedNotes])"
          @stop="stop()"
        />
      </div>
      <div>
        <h2 class="text-lg font-bold my-4 flex items-center gap-2">
          保存的和弦/和声
        </h2>
        <div class="flex flex-wrap gap-2">
          <SavedChord
            v-for="(chord, i) in savedChords"
            :key="i"
            :chord="chord"
            @delete="savedChords.splice(i, 1)"
            @apply="
              addedNotes = chord
                .map((d) => d - chord[0]!)
                .filter((d) => d !== 0)
            "
            @play="play([...chord])"
            @stop="stop()"
          />
        </div>
      </div>
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
