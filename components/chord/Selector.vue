<script setup lang="ts">
const baseChord = ref<ChordDef>(BaseChords[0]);
const susChord = ref<ChordModifierOption[string]>(SusOptions[""]);
const add7Chord = ref<ChordModifierOption[string]>(Add7Options[""]);
const finalChord = computed(() => {
  let chord = baseChord.value.notes;
  for (let option of [susChord.value, add7Chord.value]) {
    if (option.del) {
      chord = chord.filter(
        (note) =>
          !option.del.some((del) => del.x === note.dx && del.y === note.dy)
      );
    }
    if (option.add) {
      chord = [
        ...chord,
        ...option.add.map((add) => ({ dx: add.x, dy: add.y })),
      ];
    }
  }
  return chord;
});
const emit = defineEmits<{
  change: [{ dx: number; dy: number; dw?: number }[]];
}>();
watch(finalChord, (chord) => {
  emit("change", chord);
});
onMounted(() => {
  emit("change", finalChord.value);
});
</script>

<template>
  <div class="flex items-center gap-2">
    <select v-model="baseChord">
      <option v-for="(chord, i) in BaseChords" :key="chord.name" :value="chord">
        {{ chord.name }}
      </option>
    </select>
    <select v-model="susChord">
      <option v-for="(chord, name) in SusOptions" :key="name" :value="chord">
        {{ name }}
      </option>
    </select>
    <select v-model="add7Chord">
      <option v-for="(chord, name) in Add7Options" :key="name" :value="chord">
        {{ name }}
      </option>
    </select>
  </div>
</template>

<style lang="scss" scoped></style>
