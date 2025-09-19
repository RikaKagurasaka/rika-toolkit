import { createSharedComposable, toRefs, useLocalStorage } from "@vueuse/core"

function useMergedLocalStorage<T extends object>(key: string, defaultValue: T) {
    const stored = useLocalStorage<T>(key, defaultValue)
    for (const k in defaultValue) {
        if (!(k in stored.value)) {
            (stored.value as any)[k] = (defaultValue as any)[k]
        }
    }
    return stored

}

function _useConfig() {
    const compCurveConfig = useMergedLocalStorage('music-research-compCurveConfig', {
        edo: 12,
        minX: 0,
        negativeX: false,
        maxX: 1200,
        snappingDistance: 15,
        snapping: ['auto'] as ('auto' | 'valley' | 'peak' | 'added' | 'endpoints' | 'edo')[],
        mainFrequency: 261.62,
        volume: 5,
        mode: 'interval' as 'interval' | 'chord' | 'conchord',
        addedNotes: [] as number[],
        savedChords: [] as number[][],
        xAxisTickType: 'note' as 'note' | 'edo' | 'cents',
    })
    const overtuneConfig = useMergedLocalStorage('music-research-overtuneConfig', {
        formulaCent: "log2(i)",
        formulaIntensity: "1/i",
        maxI: 10,
    })

    const rxCurveConfig = useMergedLocalStorage('music-research-rxCurveConfig', {
        r: 50,
        v: 1.0,
        t: 100,
        rm: 1200,
        resolution: 1200,
    })
    const UiConfig = useMergedLocalStorage('music-research-UiConfig', {
        collapseTopPanel: false,
    })
    return { ...toRefs(compCurveConfig), ...toRefs(overtuneConfig), ...toRefs(rxCurveConfig), ...toRefs(UiConfig) }
}

export const useConfig = createSharedComposable(_useConfig)