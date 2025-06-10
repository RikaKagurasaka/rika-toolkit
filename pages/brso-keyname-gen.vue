<script setup lang="ts">
const minNote = useLocalStorage("brso-keyname-gen.minNote", 0);
const maxNote = useLocalStorage("brso-keyname-gen.maxNote", 131);
const standardNote = useLocalStorage("brso-keyname-gen.standardNote", 48);
const divisions = useLocalStorage("brso-keyname-gen.divisions", 41);

const generatedKeys = computed(() => {
  if (
    minNote.value > maxNote.value ||
    divisions.value <= 0 ||
    !Number.isInteger(divisions.value)
  ) {
    return "";
  }

  const get12TETNoteName = (midiNote: number): string => {
    const noteNames = [
      "C",
      "C#",
      "D",
      "D#",
      "E",
      "F",
      "F#",
      "G",
      "G#",
      "A",
      "A#",
      "B",
    ];
    const octave = Math.floor(midiNote / 12) - 1;
    const name = noteNames[midiNote % 12];
    return `${name}${octave}`;
  };

  const noteNameMap: { [note: number]: string } = {};
  const distanceMap: { [note: number]: number } = {};

  const midiNoteRangeStart = 0;
  const midiNoteRangeEnd = 131;

  for (
    let midiNote = midiNoteRangeStart;
    midiNote <= midiNoteRangeEnd;
    midiNote++
  ) {
    const n_float =
      standardNote.value +
      (divisions.value / 12) * (midiNote - standardNote.value);
    const n = Math.round(n_float);

    const pitch12TET = 100 * (midiNote - standardNote.value);
    const pitchCustom = (1200 / divisions.value) * (n - standardNote.value);
    const distance = Math.abs(pitch12TET - pitchCustom);

    if (distanceMap[n] === undefined || distance < distanceMap[n]) {
      distanceMap[n] = distance;
      noteNameMap[n] = get12TETNoteName(midiNote);
    }
  }

  const namedNotes = Object.keys(noteNameMap)
    .map(Number)
    .sort((a, b) => a - b);
  const finalNames: { [note: number]: string } = {};

  if (namedNotes.length === 0) {
    return "无法生成键名，没有任何12平均律的音符映射到指定范围。";
  }

  for (let note = minNote.value; note <= maxNote.value; note++) {
    if (noteNameMap[note]) {
      finalNames[note] = noteNameMap[note];
    } else {
      let closestNamedNote: number | null = null;
      let minAbsDist = Infinity;

      for (const namedNote of namedNotes) {
        const d = Math.abs(note - namedNote);
        if (d < minAbsDist) {
          minAbsDist = d;
          closestNamedNote = namedNote;
        } else if (d === minAbsDist) {
          closestNamedNote = Math.min(closestNamedNote!, namedNote);
        }
      }

      if (closestNamedNote !== null) {
        const baseName = noteNameMap[closestNamedNote];
        const distance = note - closestNamedNote;
        const absDistance = Math.abs(distance);
        if (distance > 0) {
          finalNames[note] = `${"+".repeat(absDistance)}${baseName}`;
        } else {
          finalNames[note] = `${"-".repeat(absDistance)}${baseName}`;
        }
      } else {
        finalNames[note] = `?${note}?`;
      }
    }
  }

  const keys: string[] = [];
  for (let note = maxNote.value; note >= minNote.value; note--) {
    keys.push(finalNames[note] || `UNNAMED(${note})`);
  }
  return keys.join("\n");
});
</script>

<template>
  <div class="p-8">
    <h1 class="text-2xl mb-4 font-bold">BRSO Articulate键名生成器</h1>

    <div class="grid md:grid-cols-4 sm:grid-cols-2 gap-4 mb-4">
      <div class="form-control">
        <label for="minNote">最低音</label>
        <p class="text-sm text-gray-500">默认 0, 范围 0-131</p>
        <input
          id="minNote"
          v-model.number="minNote"
          type="number"
          min="0"
          max="131"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control">
        <label for="maxNote">最高音</label>
        <p class="text-sm text-gray-500">默认 131, 范围 0-131</p>
        <input
          id="maxNote"
          v-model.number="maxNote"
          type="number"
          min="0"
          max="131"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control">
        <label for="standardNote">标准音</label>
        <p class="text-sm text-gray-500">默认 48, 范围 0-131</p>
        <input
          id="standardNote"
          v-model.number="standardNote"
          type="number"
          min="0"
          max="131"
          class="input input-bordered w-full"
        />
      </div>
      <div class="form-control">
        <label for="divisions">平均律的数量</label>
        <p class="text-sm text-gray-500">默认 41</p>
        <input
          id="divisions"
          v-model.number="divisions"
          type="number"
          min="1"
          class="input input-bordered w-full"
        />
      </div>
    </div>

    <div class="form-control">
      <label for="output">生成的键名</label>
      <p class="text-sm text-gray-500">
        从最高音到最低音，基于12平均律音名生成
      </p>
      <textarea
        id="output"
        class="textarea textarea-bordered font-mono"
        :value="generatedKeys"
        readonly
        rows="15"
      ></textarea>
    </div>
  </div>
</template>

<style scoped>
h1 {
  @apply text-2xl font-bold mb-4;
}
.form-control {
  @apply flex flex-col gap-1;
}
label {
  @apply text-base font-medium;
}
</style>