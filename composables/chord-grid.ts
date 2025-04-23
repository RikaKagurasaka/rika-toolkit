export function useUnifiedChord(chord: MaybeRef<NoteInChord[]>, rootCoord: MaybeRef<{ x: number, y: number }>, mainNoteLevel: MaybeRef<number>) {
    return computed(() => {
        let rootLevel = coords2level(toValue(rootCoord).x, toValue(rootCoord).y, toValue(mainNoteLevel));
        const result = [{ dw: 0, dx: 0, dy: 0 }, ...toValue(chord)].map((note) => {
            let x = note.dx + toValue(rootCoord).x;
            let y = note.dy + toValue(rootCoord).y;
            x = ((x + 5 + 12) % 12) - 5;
            y = ((y + 1 + 3) % 3) - 1;
            let level = coords2level(x, y, toValue(mainNoteLevel));
            let w = note.dw || 0;
            if (level < rootLevel) {
                w += 1;
            }
            return { w, x, y };
        });
        return result.sort((a, b) => (a.w - b.w) * 12 + (coords2level(a.x, a.y) - coords2level(b.x, b.y)));
    });
}