/**
 * WebGPU interface for the music research calculation compute shader
 * This file provides a TypeScript wrapper for the WGSL compute shader
 * 
 * Note: Requires WebGPU support and appropriate type definitions
 * You may need to install @webgpu/types: npm install --save-dev @webgpu/types
*/

/// <reference types="@webgpu/types" />

import calgulateWgsl from './calculate.wgsl?raw';
export interface OvertuneData {
    cent: number;
    intensity: number;
}

export interface ComputeParams {
    overtuneDataCount: number;
    fixedBaseFrequenciesCount: number;
    curvePointsCount: number;
    variableBaseFreqFrom: number;
    variableBaseFreqTo: number;
    currentVariableFreq: number;
}

export interface ResultData {
    x: number;
    y: number;
}

export class MusicResearchGPUCompute {
    private device: GPUDevice;
    private computePipeline: GPUComputePipeline | undefined = undefined;
    private bindGroupLayout: GPUBindGroupLayout | undefined = undefined;

    constructor(device: GPUDevice) {
        this.device = device;
        this.initializePipeline();
    }

    private async initializePipeline() {
        // Create bind group layout first
        this.bindGroupLayout = this.device.createBindGroupLayout({
            label: 'Music Research Compute Bind Group Layout',
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'read-only-storage' }
                },
                {
                    binding: 1,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'read-only-storage' }
                },
                {
                    binding: 2,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'read-only-storage' }
                },
                {
                    binding: 3,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'uniform' }
                },
                {
                    binding: 4,
                    visibility: GPUShaderStage.COMPUTE,
                    buffer: { type: 'storage' }
                }
            ]
        });

        // Create shader module with inline WGSL code
        const shaderModule = this.device.createShaderModule({
            label: 'Music Research Compute Shader',
            code: this.getWGSLShaderCode()
        });

        // Create compute pipeline
        this.computePipeline = this.device.createComputePipeline({
            label: 'Music Research Compute Pipeline',
            layout: this.device.createPipelineLayout({
                bindGroupLayouts: [this.bindGroupLayout]
            }),
            compute: {
                module: shaderModule,
                entryPoint: 'main'
            }
        });
    }

    private getWGSLShaderCode(): string {
        return calgulateWgsl;
    }

    /**
     * Compute the music research calculations on GPU
     */
    async compute(
        overtuneData: OvertuneData[],
        fixedBaseFrequencies: number[],
        curvePoints: number[],
        variableBaseFreqRange: { from: number; to: number }
    ): Promise<ResultData[]> {
        // Ensure from <= to
        if (variableBaseFreqRange.from > variableBaseFreqRange.to) {
            throw new Error('variableBaseFreqRange.from must be <= variableBaseFreqRange.to');
        }
        
        const variableFreqCount = variableBaseFreqRange.to - variableBaseFreqRange.from + 1;

        // Create buffers
        const overtuneBuffer = this.createOvertuneDataBuffer(overtuneData);
        const fixedBaseFreqBuffer = this.createFixedBaseFreqBuffer(fixedBaseFrequencies);
        const curvePointsBuffer = this.createCurvePointsBuffer(curvePoints);
        const paramsBuffer = this.createParamsBuffer({
            overtuneDataCount: overtuneData.length,
            fixedBaseFrequenciesCount: fixedBaseFrequencies.length,
            curvePointsCount: curvePoints.length,
            variableBaseFreqFrom: variableBaseFreqRange.from,
            variableBaseFreqTo: variableBaseFreqRange.to,
            currentVariableFreq: 0 // Not used in this context
        });
        const resultBuffer = this.createResultBuffer(variableFreqCount);

        // Create bind group
        const bindGroup = this.device.createBindGroup({
            label: 'Music Research Compute Bind Group',
            layout: this.bindGroupLayout!,
            entries: [
                { binding: 0, resource: { buffer: overtuneBuffer } },
                { binding: 1, resource: { buffer: fixedBaseFreqBuffer } },
                { binding: 2, resource: { buffer: curvePointsBuffer } },
                { binding: 3, resource: { buffer: paramsBuffer } },
                { binding: 4, resource: { buffer: resultBuffer } }
            ]
        });

        // Execute compute shader
        const commandEncoder = this.device.createCommandEncoder({
            label: 'Music Research Compute Command Encoder'
        });

        const computePass = commandEncoder.beginComputePass({
            label: 'Music Research Compute Pass'
        });

        computePass.setPipeline(this.computePipeline!);
        computePass.setBindGroup(0, bindGroup);

        // Dispatch with appropriate workgroup count
        const workgroupCount = Math.ceil(variableFreqCount / 64);
        computePass.dispatchWorkgroups(workgroupCount, 1, 1);
        computePass.end();

        // Copy result buffer for reading
        const readBuffer = this.device.createBuffer({
            label: 'Music Research Result Read Buffer',
            size: resultBuffer.size,
            usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ
        });

        commandEncoder.copyBufferToBuffer(
            resultBuffer, 0,
            readBuffer, 0,
            resultBuffer.size
        );

        // Submit and wait for completion
        this.device.queue.submit([commandEncoder.finish()]);
        await this.device.queue.onSubmittedWorkDone();

        // Read results
        await readBuffer.mapAsync(GPUMapMode.READ);
        const resultArrayBuffer = readBuffer.getMappedRange();

        // ResultData in WGSL is {x: i32, y: f32} = 8 bytes per entry
        const resultData = new DataView(resultArrayBuffer);

        // Convert to ResultData format
        const results: ResultData[] = [];
        for (let i = 0; i < variableFreqCount; i++) {
            const offset = i * 8; // 8 bytes per ResultData (4 bytes i32 + 4 bytes f32)
            const x = resultData.getInt32(offset, true); // little-endian
            const y = resultData.getFloat32(offset + 4, true); // little-endian
            results.push({ x, y });
        }

        // Cleanup
        readBuffer.unmap();
        readBuffer.destroy();
        overtuneBuffer.destroy();
        fixedBaseFreqBuffer.destroy();
        curvePointsBuffer.destroy();
        paramsBuffer.destroy();
        resultBuffer.destroy();

        return results;
    }

    private createOvertuneDataBuffer(data: OvertuneData[]): GPUBuffer {
        const buffer = this.device.createBuffer({
            label: 'Overtune Data Buffer',
            size: Math.max(1024 * 8, data.length * 8), // 2 floats per OvertuneData
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const arrayBuffer = new Float32Array(1024 * 2); // Max size from WGSL
        for (let i = 0; i < data.length && i < 1024; i++) {
            const item = data[i];
            if (item) {
                arrayBuffer[i * 2] = item.cent;
                arrayBuffer[i * 2 + 1] = item.intensity;
            }
        }

        this.device.queue.writeBuffer(buffer, 0, arrayBuffer);
        return buffer;
    }

    private createFixedBaseFreqBuffer(data: number[]): GPUBuffer {
        const buffer = this.device.createBuffer({
            label: 'Fixed Base Frequencies Buffer',
            size: Math.max(64 * 4, data.length * 4), // Max 64 frequencies
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const arrayBuffer = new Float32Array(64);
        for (let i = 0; i < Math.min(data.length, 64); i++) {
            arrayBuffer[i] = data[i] ?? 0;
        }

        this.device.queue.writeBuffer(buffer, 0, arrayBuffer);
        return buffer;
    }

    private createCurvePointsBuffer(data: number[]): GPUBuffer {
        const buffer = this.device.createBuffer({
            label: 'Curve Points Buffer',
            size: Math.max(4096 * 4, data.length * 4), // Max 4096 points
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
        });

        const arrayBuffer = new Float32Array(4096);
        for (let i = 0; i < Math.min(data.length, 4096); i++) {
            arrayBuffer[i] = data[i] ?? 0;
        }

        this.device.queue.writeBuffer(buffer, 0, arrayBuffer);
        return buffer;
    }

    private createParamsBuffer(params: ComputeParams): GPUBuffer {
        const buffer = this.device.createBuffer({
            label: 'Compute Parameters Buffer',
            size: 32, // 8 u32 values for 16-byte alignment
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        // Use Int32Array for signed integers, then convert to appropriate buffer format
        const arrayBuffer = new ArrayBuffer(32);
        const view = new DataView(arrayBuffer);
        
        // Store as little-endian values
        view.setUint32(0, params.overtuneDataCount, true);           // u32
        view.setUint32(4, params.fixedBaseFrequenciesCount, true);   // u32
        view.setUint32(8, params.curvePointsCount, true);            // u32
        view.setInt32(12, params.variableBaseFreqFrom, true);        // i32 - can be negative
        view.setInt32(16, params.variableBaseFreqTo, true);          // i32 - can be negative
        view.setInt32(20, params.currentVariableFreq, true);        // i32 - can be negative
        view.setUint32(24, 0, true);                                 // padding
        view.setUint32(28, 0, true);                                 // padding

        this.device.queue.writeBuffer(buffer, 0, arrayBuffer);
        return buffer;
    }

    private createResultBuffer(count: number): GPUBuffer {
        return this.device.createBuffer({
            label: 'Result Buffer',
            size: count * 8, // 2 floats per result (x, y)
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
        });
    }

    /**
     * Cleanup GPU resources
     */
    destroy() {
        // Cleanup will be handled by WebGPU when device is lost
    }
}

/**
 * Utility function to check WebGPU support and create compute instance
 */
export async function createMusicResearchGPUCompute(): Promise<MusicResearchGPUCompute | null> {
    if (!navigator.gpu) {
        console.warn('WebGPU not supported');
        return null;
    }

    try {
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            console.warn('No WebGPU adapter found');
            return null;
        }

        const device = await adapter.requestDevice();
        return new MusicResearchGPUCompute(device);
    } catch (error) {
        console.error('Failed to initialize WebGPU:', error);
        return null;
    }
}