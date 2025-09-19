import { ref } from "vue";
import Mexp from "math-expression-evaluator";
import * as Tone from "tone";
import { useConfig } from "./store";

const { formulaCent, formulaIntensity, maxI } = useConfig();
const mexp = new Mexp();
mexp.addToken([
    {
        token: "i",
        show: "i",
        value: "i",
        type: Mexp.tokenTypes.CONSTANT,
        precedence: 0,
    },
    {
        token: "max",
        show: "max",
        value: function (a: number, b: number) {
            return Math.max(a, b);
        },
        type: Mexp.tokenTypes.FUNCTION_WITH_N_ARGS,
        precedence: 5,
    },
    {
        token: "min",
        show: "min",
        value: function (a: number, b: number) {
            return Math.min(a, b);
        },
        type: Mexp.tokenTypes.FUNCTION_WITH_N_ARGS,
        precedence: 5,
    }, {
        token: "log2",
        show: "log2",
        value: function (x: number) {
            return Math.log2(x);
        },
        type: Mexp.tokenTypes.FUNCTION_WITH_ONE_ARG,
        precedence: 5,
    }
]);
function evaluateFormula(formula: string, i: number): number {
    try {
        return mexp.eval(formula, [], { i });
    } catch (e) {
        return 0;
    }
}

export const overtuneData = computed(() => {
    const data = [];
    for (let i = 1; i <= maxI.value; i++) {
        const cent = evaluateFormula(formulaCent.value, i) * 1200;
        const intensity = evaluateFormula(formulaIntensity.value, i);
        data.push({ i, cent, intensity: intensity > 0 ? intensity : 0 });
    }
    const sum = data.reduce((acc, cur) => acc + cur.intensity ** 2, 0);
    data.forEach(d => d.intensity /= sum);
    return data;
}) as ComputedRef<{ i: number; cent: number; intensity: number }[]>;

export const synth = computedAsync(async () => {
    await Tone.start();
    const poly = new Tone.PolySynth(Tone.MonoSynth, {
        oscillator: {
            type: "custom",
            partials: overtuneData.value.map(d => d.intensity),
        },
        envelope: {
            "attack": 0.05,
            "attackCurve": "linear",
            "decay": 0.3,
            "decayCurve": "exponential",
            "release": 0.8,
            "releaseCurve": "exponential",
            "sustain": 0.4
        },
        "filter": {
            "Q": 1,
            "detune": 0,
            "frequency": 0,
            "gain": 0,
            "rolloff": -12,
            "type": "lowpass"
        },
        "filterEnvelope": {
            "attack": 0.001,
            "attackCurve": "linear",
            "decay": 0.7,
            "decayCurve": "exponential",
            "release": 0.8,
            "releaseCurve": "exponential",
            "sustain": 0.1,
            "baseFrequency": 300,
            "exponent": 2,
            "octaves": 4
        },
    }).toDestination();
    return poly;
}, null, { lazy: true });