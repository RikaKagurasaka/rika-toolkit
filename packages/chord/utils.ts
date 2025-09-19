export const NOTES = ['C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B']
export const noteCoordsRange = {
    x: [-5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6],
    y: [-1, 0, 1]
}
export function coords2level(x: number, y: number, mainNoteLevel: number = 0) {
    const rs = (7 * x + 4 * y + mainNoteLevel) % 12;
    if (rs < 0) {
        return rs + 12;
    }
    return rs
}


export type NoteInChord = {
    dx: number,
    dy: number,
    dw?: number,
}
export type ChordDef = {
    name: string,
    notes: NoteInChord[]
}
export const BaseChords: ChordDef[] = [
    {
        name: 'maj',
        notes: [
            { dx: 1, dy: 0, },
            { dx: 0, dy: 1, },
        ]
    }, {
        name: 'min',
        notes: [
            { dx: 1, dy: 0, },
            { dx: 1, dy: -1, },
        ]
    },
    {
        name: 'aug',
        notes: [
            { dx: 0, dy: 1, },
            { dx: 0, dy: 2, },
        ]
    },
    {
        name: 'dim',
        notes: [
            { dx: 1, dy: -1, },
            { dx: 2, dy: -2, },
        ]
    }
]
export type ChordModifierOptions = {
    del: { x: number, y: number }[],
    add: { x: number, y: number }[],
}
export type ChordModifierOption = {
    [key: string]: ChordModifierOptions
}
export const SusOptions: ChordModifierOption = {
    "": {
        del: [],
        add: [],
    },
    sus2: {
        del: [{ x: 0, y: 1 }, { x: 1, y: -1 }],
        add: [{ x: 2, y: 0 }],
    },
    sus4: {
        del: [{ x: 0, y: 1 }, { x: 1, y: -1 }],
        add: [{ x: -1, y: 0 }],
    },
};
export const Add7Options: ChordModifierOption = {
    "": {
        del: [],
        add: [],
    },
    maj7: {
        del: [],
        add: [{ x: 1, y: 1 }],
    },
    dom7: {
        del: [],
        add: [{ x: -2, y: 0 }],
    },
    dim7: {
        del: [],
        add: [{ x: -1, y: 1 }],
    },
};



export async function playNotes(notes: { x: number, y: number, w: number }[], mainNoteLevel: number) {
    const Tone = await import('tone');
    Tone.start();
    const now = Tone.now();
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    notes.forEach((note, i) => {
        const noteName = NOTES[coords2level(note.x, note.y, mainNoteLevel)]?.split('/')[0] + `${note.w + 4}`;
        console.log(noteName);
        synth.triggerAttackRelease(noteName, "2n", now + i * 0.05);
    });
}

export function useUnifiedChord(chord: MaybeRef<NoteInChord[]>, rootCoord: MaybeRef<{ x: number, y: number, w: number }>, mainNoteLevel: MaybeRef<number>) {
    return computed(() => {
        let rootLevel = coords2level(toValue(rootCoord).x, toValue(rootCoord).y, toValue(mainNoteLevel));
        const result = [{ dw: 0, dx: 0, dy: 0 }, ...toValue(chord)].map((note) => {
            let x = note.dx + toValue(rootCoord).x;
            let y = note.dy + toValue(rootCoord).y;
            x = ((x + 5 + 12) % 12) - 5;
            y = ((y + 1 + 3) % 3) - 1;
            let level = coords2level(x, y, toValue(mainNoteLevel));
            let w = note.dw || 0 + toValue(rootCoord).w;
            if (level < rootLevel) {
                w += 1;
            }
            return { w, x, y };
        });
        return result.sort((a, b) => (a.w - b.w) * 12 + (coords2level(a.x, a.y) - coords2level(b.x, b.y)));
    });
}