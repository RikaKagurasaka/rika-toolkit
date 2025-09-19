import { computed, reactive, ref } from 'vue'
import { createSharedComposable } from "@vueuse/core"
import { useConfig } from "./config";

const { r, v, t, rm, resolution } = useConfig()


const sigmoid = (x: number) => 1 / (1 + Math.exp(-x))

export const curvePoints = computed(() => {
    const points = []
    for (let i = 0; i <= toValue(resolution); i++) {
        let r1 = (-Math.cos(i / toValue(r) * Math.PI) + 1) / 2
        let r2 = Math.exp(-(i - toValue(r)) / toValue(t))
        let coeff = sigmoid((i - toValue(r)))
        let y = (r1 * (1 - coeff) + r2 * coeff) * toValue(v)
        if (y < 0) y = 0
        if (y > 1) y = 1
        points.push(y)
    }
    return points
})
