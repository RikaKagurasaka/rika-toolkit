import * as d3 from "d3";
import { curvePoints } from "./rxCurve";
import { overtuneData, synth } from "./overtune";
import { type MaybeElementRef, computedAsync } from "@vueuse/core";
import { toRefs } from "@vueuse/core";
import * as Tone from "tone";
import { createMusicResearchGPUCompute } from '../workers/calculate-gpu';
import { useConfig } from "./store";
const gpuCompute = await createMusicResearchGPUCompute();
if (!gpuCompute) {
    alert("WebGPU 不支持或初始化失败，无法使用计算功能");
    throw new Error('WebGPU 不支持或初始化失败');
}


export function usePlot({
    svg,
    margin = 8,
}: {
    svg: MaybeRefOrGetter<SVGSVGElement | null>,
    margin?: MaybeRefOrGetter<number>,
}) {
    // =========== DEFINE CONSTANTS AND REFS ===========
    const {
        edo, negativeX, maxX, snappingDistance, snapping, mainFrequency, volume,
        mode, addedNotes, savedChords,
    } = useConfig();
    const minX = computed(() => negativeX.value ? -maxX.value : 0);

    const { elementX, elementY, isOutside, elementWidth, elementHeight } = useMouseInElement(svg as MaybeElementRef);
    const { pressed } = useMousePressed();
    if (!gpuCompute) {
        throw new Error('WebGPU 不支持或初始化失败');
    }
    // =========== COMPUTED DATA ===========
    const data = computedAsync(async () => {
        switch (mode.value) {
            case 'interval': {
                return gpuCompute.compute(
                    toValue(overtuneData),
                    [0],
                    toValue(curvePoints),
                    { from: minX.value, to: maxX.value },
                )
            }
            case 'chord': {
                return gpuCompute.compute(
                    toValue(overtuneData),
                    [0, ...addedNotes.value],
                    toValue(curvePoints),
                    { from: minX.value, to: maxX.value },
                )
            }
            case 'conchord': {
                const rs = await gpuCompute.compute(
                    toValue(overtuneData),
                    [0, ...addedNotes.value],
                    toValue(curvePoints),
                    { from: -maxX.value, to: -minX.value },
                )
                return rs.map(d => ({ x: -d.x, y: d.y })).reverse();
            }
        }
    });

    const snaps = computed(() => {
        const res = data.value
        if (!res || res.length === 0) return []
        const valleys = [];
        const peaks = [];
        for (let i = 1; i < res.length - 1; i++) {
            if (res[i]!.y < res[i - 1]!.y && res[i]!.y < res[i + 1]!.y) {
                valleys.push(i + minX.value);
            }
            if (res[i]!.y > res[i - 1]!.y && res[i]!.y > res[i + 1]!.y) {
                peaks.push(i + minX.value);
            }
        }
        const endpoints = [minX.value, maxX.value];
        const added = addedNotes.value.filter(v => v > minX.value && v < maxX.value);
        let result = [] as number[];
        if (snapping.value.includes('auto')) {
            switch (mode.value) {
                case 'interval':
                case 'chord':
                    result.push(...[...valleys, ...added, ...endpoints])
                    break;
                case 'conchord':
                    result.push(...[...valleys, ...peaks, ...endpoints])
                    break;
            }
        }
        for (const s of snapping.value) {
            switch (s) {
                case 'valley':
                    result.push(...valleys);
                    break;
                case 'peak':
                    result.push(...peaks);
                    break;
                case 'added':
                    if (mode.value !== 'conchord')
                        result.push(...added);
                    break;
                case 'endpoints':
                    result.push(...endpoints);
                    break;
                case 'edo':
                    for (let i = 0; i <= Math.floor(maxX.value / 1200 * edo.value); i++) {
                        result.push(i * (1200 / edo.value));
                    }
                    break;
            }
        }
        return Array.from(new Set(result)).sort((a, b) => a - b);
    });

    // =========== SCALES ===========

    const { x, y, minY, maxY } = toRefs((computed(() => {
        const maxY = data.value ? d3.quantile(data.value?.map(d => d.y), 0.95) ?? 1 : 1;
        const minY = data.value ? d3.min(data.value?.map(d => d.y)) ?? 0 : 0;
        const x = d3
            .scaleLinear()
            .domain([toValue(minX), toValue(maxX)])
            .range([toValue(margin), toValue(elementWidth) - toValue(margin)]);
        const y = d3
            .scaleLinear()
            .domain([minY, maxY])
            .range([toValue(elementHeight) - toValue(margin), toValue(margin)]);

        return { x, y, maxY, minY };
    })))


    // =========== MOUSE INTERACTION ===========
    const mouseCent = computed(() => x.value.invert(toValue(elementX)));
    const mouseIntensity = computed(() => y.value.invert(toValue(elementY)));
    const snappedMouseCent = computed(() => {
        if (snapping.value) {
            // find the closest valley
            const closest = d3.least(snaps.value, (d) => Math.abs(d - mouseCent.value));
            if (closest !== undefined && Math.abs(closest - mouseCent.value) < snappingDistance.value) {
                return closest;
            }
        }
        return mouseCent.value;
    })

    //========== PLOTTING ==========
    function plot({
        edo,
        data,
        svg,
        maxX,
        minX
    }: {
        edo: number,
        data: { x: number; y: number }[],
        svg: SVGSVGElement,
        maxX: number,
        minX: number,
    }) {
        const s = d3.select(svg);
        const [xx, yy] = [toValue(x), toValue(y)];

        //============================================
        function plotCurve() {
            const line = d3
                .line<{ x: number; y: number }>()
                .x((d) => xx(d.x))
                .y((d) => yy(d.y));
            const dataPoints = [...data];
            // 绑定数据到路径
            const curve = s.selectAll("path.curve-path")
                .data([dataPoints]);
            curve.join("path")
                .attr("class", "curve-path")
                .attr("fill", "none")
                .attr("stroke", "steelblue")
                .attr("stroke-width", 1.5)
                .transition()
                .attr("d", d => line(d))
            return { curve }
        }
        const { curve } = plotCurve();
        // ============================================
        function plotGrid() {
            const g = s
                .selectAll("g.grid-lines")
                .data([null])
                .join("g")
                .attr("class", "grid-lines");
            const gridInterval = 1200 / edo;
            let data = new Array(Math.floor((maxX) / gridInterval) + 2)
                .fill(0)
                .map((_, i) => i * gridInterval);
            if (negativeX.value) {
                data = [...data.map(d => -d).reverse(), ...data];
                // remove duplicates
                data = Array.from(new Set(data)).sort((a, b) => a - b);
            }
            const gridLines = g.selectAll<SVGLineElement, number>("line.grid-line")
                .data(data,)
                .join("line")
                .attr("class", "grid-line")
                .attr("x1", (d) => xx(d))
                .attr("x2", (d) => xx(d))
                .attr("y1", yy(0))
                .attr("y2", yy(toValue(maxY)))
                .attr("stroke", "#ccc")
                .attr("stroke-width", (d) => (d % 1200 == 0 ? 3 : 1))

            // only for 12edo draw note names
            const noteNames = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
            const texts = g.selectAll<SVGTextElement, { x: number; name: string }>("text.grid-text")
                .data(
                    edo !== 12 ? [] :
                        data.map(d => ({ x: d, name: noteNames[(Math.round(d / (1200 / edo)) % edo + edo) % edo]! }))
                )
                .join("text")
                .attr("class", "grid-text")
                .attr("text-anchor", "middle")
                .attr("font-size", 10)
                .attr("opacity", 0.7)
                .style("user-select", "none")
                .attr("x", d => xx(d.x))
                .attr("y", yy(toValue(minY)))
                .text(d => d.name);

            return { gridLines };
        }
        const { gridLines } = plotGrid();
        // ============================================
        function plotCursor() {
            const g = s.selectAll<SVGLineElement, null>("g.cursor-group").data([null]).join("g").attr("class", "cursor-group");
            const mouseData = isOutside.value ? [] : [{ x: toValue(snappedMouseCent), y: toValue(mouseIntensity) }];
            g.selectAll<SVGLineElement, number>("line.cursor-line")
                .data(mouseData)
                .join("line")
                .attr("class", "cursor-line")
                .attr("x1", d => xx(d.x))
                .attr("x2", d => xx(d.x))
                .attr("y1", yy(0))
                .attr("y2", yy(toValue(maxY)))
                .attr("stroke", "red")
                .attr("stroke-width", 1)
                .attr("pointer-events", "none");

            g.selectAll<SVGCircleElement, number>("circle.cursor-circle")
                .data(mouseData)
                .join("circle")
                .attr("class", "cursor-circle")
                .attr("cx", d => xx(d.x))
                .attr("cy", d => yy(d3.least(data, (p) => Math.abs(p.x - d.x))?.y || 0))
                .attr("r", 3)
                .attr("fill", "red")
                .attr("pointer-events", "none");

            g.selectAll<SVGTextElement, number>("text.cursor-text")
                .data(mouseData)
                .join("text")
                .attr("class", "cursor-text")
                .attr("fill", "red")
                .attr("text-anchor", "start")
                .attr("alignment-baseline", "hanging")
                .attr("pointer-events", "none")
                .style("user-select", "none")
                .attr("x", d => xx(d.x) + 4)
                .attr("y", d => yy(maxY.value) + 10)
                .text(d => Math.round(d.x))

            return { mouseData }
        }
        const { mouseData } = plotCursor();
        // ============================================
        function plotAddNoteButton() {

            // do not plot in conchord mode
            if (mode.value === 'conchord') return;

            const g = s.selectAll<SVGLineElement, null>("g.cursor-group").data([null]).join("g").attr("class", "cursor-group");
            g.selectAll<SVGLineElement, number>("rect.add-note-button")
                .data(mouseData)
                .join("rect")
                .attr("class", "add-note-button")
                .attr("x", d => xx(d.x) - 8)
                .attr("y", d => yy(maxY.value) + 25)
                .attr("width", 16)
                .attr("height", 16)
                .attr("fill", d => addedNotes.value.includes(Math.round(d.x)) ? "red" : "green")
                .attr("rx", 2)
                .attr("cursor", "pointer")
                .on("click", (_, d) => {
                    if (!addedNotes.value.includes(Math.round(d.x))) {
                        addedNotes.value.push(Math.round(d.x));
                    } else {
                        addedNotes.value = addedNotes.value.filter(v => v !== Math.round(d.x));
                    }
                    addedNotes.value.sort((a, b) => a - b);
                });
            g.selectAll<SVGLineElement, number>("text.add-note-button")
                .data(mouseData)
                .join("text")
                .attr("class", "add-note-button")
                .attr("x", d => xx(d.x))
                .attr("y", d => yy(maxY.value) + 25 + 12)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("fill", "white")
                .attr("pointer-events", "none")
                .style("user-select", "none")
                .text(d => addedNotes.value.includes(Math.round(d.x)) ? "-" : "+");
        }
        plotAddNoteButton();
        // ============================================
        function plotAddConchordButton() {
            // only plot in conchord mode
            const g = s.selectAll<SVGLineElement, null>("g.conchord-button-group").data([null]).join("g").attr("class", "conchord-button-group");
            const data = mode.value !== 'conchord' ? [] : mouseData;
            g.selectAll<SVGLineElement, number>("rect.conchord-button")
                .data(data)
                .join("rect")
                .attr("class", "conchord-button")
                .attr("x", d => xx(d.x) - 8)
                .attr("y", d => yy(minY.value) - 45)
                .attr("width", 16)
                .attr("height", 16)
                .attr("fill", "darkblue")
                .attr("rx", 2)
                .attr("cursor", "pointer")
                .on("click", async (_, d) => {
                    if (mode.value === 'conchord') {
                        savedChords.value.push([Math.round(d.x), ...addedNotes.value.map(x => x + Math.round(d.x))]);
                    }
                });
            g.selectAll<SVGLineElement, number>("text.add-note-button")
                .data(data)
                .join("text")
                .attr("class", "add-note-button")
                .attr("x", d => xx(d.x))
                .attr("y", d => yy(minY.value) - 45 + 12)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .attr("fill", "white")
                .attr("font-size", 10)
                .attr("pointer-events", "none")
                .style("user-select", "none")
                .text(d => "♪");
        }

        plotAddConchordButton();
        // ============================================
        function plotAddedNotes() {
            const g = s.selectAll<SVGLineElement, null>("g.added-notes-group").data([null]).join("g").attr("class", "added-notes-group");
            // for conchord mode, shift all added notes + cursor cent
            // if mouse outside, donot shift
            const addedNotesData =
                addedNotes.value
                    .map(x => x + Math.round((mode.value === 'conchord' && !isOutside.value ? snappedMouseCent.value : 0)))
                    .map(x => ({ x, y: data.find(d => d.x === x)?.y || 0 }))


            g.selectAll<SVGLineElement, { x: number; y: number }>("line.added-note-line")
                .data(addedNotesData, d => d.x)
                .join("line")
                .attr("class", "added-note-line")
                .attr("x1", d => xx(d.x))
                .attr("y1", d => yy(0))
                .attr("x2", d => xx(d.x))
                .attr("y2", d => yy(maxY.value))
                .attr("stroke", "orange")
                .attr("stroke-width", 1)
                .attr("opacity", 0.5)
                .attr("pointer-events", "none");
            g.selectAll<SVGTextElement, { x: number; y: number }>("text.added-note-text")
                .data(addedNotesData, d => d.x)
                .join("text")
                .attr("class", "added-note-text")
                .attr("x", d => xx(d.x) - 2)
                .attr("y", d => yy(maxY.value) + 8)
                .attr("text-anchor", "end")
                .attr("fill", "orange")
                .attr("font-size", 12)
                .attr("pointer-events", "none")
                .style("user-select", "none")
                .text(d => d.x);
            // for conchord mode, dont plot circle
            g.selectAll<SVGCircleElement, { x: number; y: number }>("circle.added-note-circle")
                .data(mode.value == 'conchord' ? [] : addedNotesData, d => d.x)
                .join("circle")
                .attr("class", "added-note-circle")
                .attr("cx", d => xx(d.x))
                .attr("cy", d => yy(d.y))
                .attr("r", 2)
                .attr("fill", "orange")
                .attr("opacity", 0.5)
                .attr("stroke", "orange")
                .attr("stroke-width", 1)
                .attr("opacity", 0.5)
                .attr("pointer-events", "none");


        }
        plotAddedNotes();
    }

    watch(
        [elementWidth, elementHeight, edo, data, svg, maxX, elementX, elementY, isOutside, addedNotes, snapping, snappedMouseCent, mode],
        () => {
            if (toValue(svg) && toValue(elementWidth) > 0 && toValue(elementHeight) > 0 && toValue(data)) {
                plot({
                    edo: toValue(edo),
                    data: toValue(data)!,
                    svg: toValue(svg) as SVGSVGElement,
                    maxX: toValue(maxX),
                    minX: toValue(minX),
                });
            }
        }, {
        immediate: true,
        deep: true,
    })


    // =========== Audio playing ===========
    async function play(notes?: number[]) {
        if (!notes) {
            notes = [0, snappedMouseCent.value, ...addedNotes.value];
        }
        await Tone.start();

        for (const cent of notes) {
            const freq = mainFrequency.value * Math.pow(2, (cent || 0) / 1200);
            synth.value?.triggerAttack(freq, "4n", volume.value - Math.log2(notes.length));
        }
    }

    async function stop() {
        await Tone.start();
        synth.value?.releaseAll();
    }
    return {
        edo, maxX, snapping, snappedMouseCent, mousePressed: computed(() => pressed.value && !isOutside.value),
        addedNotes, savedChords, mainFrequency, data, valleys: snaps,
        mode, volume,
        play, stop
    };
}

