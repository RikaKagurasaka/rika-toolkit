<script setup lang="ts">
const mainNoteLevel = useLocalStorage("chord.mainNoteLevel", 0);
const selectedRootCoord = ref({ x: 0, y: 0, w: 0 });
const gridSizing = {
  cellSize: 64,
  gap: 8,
  headerSize: 32,
};
const chord = ref<NoteInChord[]>([]);
const unifiedChord = useUnifiedChord(chord, selectedRootCoord, mainNoteLevel);
const userClicked = ref(false);
const handleClick = (x: number, y: number) => {
  selectedRootCoord.value = { ...selectedRootCoord.value, x, y };
  userClicked.value = true;
};
const handleChordChange = async (newChord: NoteInChord[]) => {
  chord.value = newChord;
};
const muted = ref(false);
watchDeep(unifiedChord, () => {
  if (import.meta.client && userClicked.value && !muted.value) {
    playNotes(unifiedChord.value, mainNoteLevel.value);
  }
});
</script>

<template>
  <div class="flex flex-col items-center m-8 chord-grid">
    <ChordGrid
      :mainNoteLevel="mainNoteLevel"
      :gridSizing="gridSizing"
      @click="handleClick"
    >
      <ChordBoxes
        v-if="chord"
        :unifiedChord="unifiedChord"
        :gridSizing="gridSizing"
      />
    </ChordGrid>

    <div class="flex items-center gap-2 mt-4">
      <label for="mainNoteLevel">主音</label>
      <select id="mainNoteLevel" v-model="mainNoteLevel">
        <option v-for="(note, i) in NOTES" :key="note" :value="i">
          {{ note }}
        </option>
      </select>
      <label for="rootNote">根音</label>
      <input
        id="rootNote"
        class="max-w-16"
        v-model="NOTES[coords2level(selectedRootCoord.x, selectedRootCoord.y)]"
        readonly
      />
      <ChordOctaveSelector v-model="selectedRootCoord.w" />
      <ChordSelector @change="handleChordChange" />
      <button
        @click="muted = !muted"
        class="text-2xl bg-transparent"
        :class="muted ? 'text-gray-500' : 'text-chord-1d'"
      >
        <Icon :name="muted ? 'mdi:volume-off' : 'mdi:volume-high'" />
      </button>
    </div>
    <div class="m-8 w-full">
      <p>
        传统的五度圈已经过时辣！快来学习
        <a href="https://www.youtube.com/watch?v=cMnuMjXeHrY" target="_blank"
          >LΛMPLIGHT大神的最新成果</a
        >。LΛMPLIGHT提出通过利用更高的质数倍（7、11）频率构造音程，可以得到相较于传统音律更丰富的微分音。但即使是在传统音乐的范畴中，这种分析方法依然可以为我们提供新的视角。
      </p>
      <p>
        本工具是基于上述视频的
        <a
          href="https://www.youtube.com/watch?v=cMnuMjXeHrY&t=87s"
          target="_blank"
          >01:27</a
        >
        处出现的表格制作的。传统五度圈只考虑了三倍音，我们不妨尝试引入五倍音，构造一个二维的「五三度网格」。
      </p>
      <p>根据理论：</p>
      <ol>
        <li>
          「零维」<ChordLamplightIcon class="inline-flex!" />是纯一度（一倍音）
        </li>
        <li>
          「一维」<ChordLamplightIcon
            class="inline-flex!"
            :w="1"
          />是纯八度（二倍音）
        </li>
        <li>
          「二维」<ChordLamplightIcon
            class="inline-flex!"
            :x="1"
          />是纯五度（三倍音）
        </li>
        <li>
          「三维」<ChordLamplightIcon
            class="inline-flex!"
            :y="1"
          />是大三度（五倍音）
        </li>
      </ol>
      <p>
        横向为三倍音，如果只看一行，和传统五度圈是类似的。相邻的两个音成纯五度关系。
      </p>
      <p>纵向为五倍音，如果只看一列，恰好是一个八度中的三个大三度。</p>
      <p>
        大三度这样一个本应比较协和的音程，在传统五度圈中却相隔甚远，而通过增加一个维度，可以拉近它们之间的距离。
      </p>
      <p>
        你可以通过下拉框选择不同的和弦，点击网格选择根音，浏览和弦的在网格上的分布。
      </p>
      <br />
      <p class="text-gray-500">
        又：由于这个网格左右联通，上下联通，所以如果类比五度圈的话，从拓扑上讲，这个图应该叫「五三度甜甜圈」。
      </p>
    </div>
  </div>
</template>

<style lang="scss" scoped>
input {
  @apply rounded-md px-2 py-1;
}
p {
  @apply my-2;
}
</style>
