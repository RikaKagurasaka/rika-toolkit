// WGSL Compute Shader for Music Research Calculations
// This shader implements parallel computation for frequency interaction analysis

// Constants for buffer sizing
const MAX_OVERTUNE_DATA: u32 = 1024u;
const MAX_FIXED_BASE_FREQUENCIES: u32 = 64u;
const MAX_CURVE_POINTS: u32 = 4096u;
const MAX_MERGED_DATA: u32 = 2048u;
const WORKGROUP_SIZE: u32 = 64u;

// Data structures
struct OvertuneData {
    cent: f32,
    intensity: f32,
}

struct ComputeParams {
    overtune_data_count: u32,
    fixed_base_frequencies_count: u32,
    curve_points_count: u32,
    variable_base_freq_from: i32,
    variable_base_freq_to: i32,
    current_variable_freq: i32,
    _padding1: u32,
    _padding2: u32, // For 16-byte alignment
}

struct ResultData {
    x: i32,
    y: f32,
}

// Input buffers
@group(0) @binding(0) var<storage, read> overtune_data: array<OvertuneData, MAX_OVERTUNE_DATA>;
@group(0) @binding(1) var<storage, read> fixed_base_frequencies: array<f32, MAX_FIXED_BASE_FREQUENCIES>;
@group(0) @binding(2) var<storage, read> curve_points: array<f32, MAX_CURVE_POINTS>;
@group(0) @binding(3) var<uniform> params: ComputeParams;

// Output buffer
@group(0) @binding(4) var<storage, read_write> results: array<ResultData>;

// Thread-local storage for merged data (each thread has its own copy)
var<private> thread_merged_data: array<OvertuneData, MAX_MERGED_DATA>;

// Function to merge overtune data with base frequencies for a single thread
fn merge_overtune_data_thread_local(variable_freq: i32) -> u32 {
    var count: u32 = 0u;
    
    // Add overtune data combined with fixed base frequencies
    for (var base_idx: u32 = 0u; base_idx < params.fixed_base_frequencies_count; base_idx++) {
        let base_freq = fixed_base_frequencies[base_idx];
        for (var ot_idx: u32 = 0u; ot_idx < params.overtune_data_count; ot_idx++) {
            if count >= MAX_MERGED_DATA {
                break;
            }
            let ot = overtune_data[ot_idx];
            thread_merged_data[count] = OvertuneData(
                ot.cent + base_freq,
                ot.intensity
            );
            count++;
        }
    }
    
    // Add overtune data combined with current variable frequency
    for (var ot_idx: u32 = 0u; ot_idx < params.overtune_data_count; ot_idx++) {
        if count >= MAX_MERGED_DATA {
            break;
        }
        let ot = overtune_data[ot_idx];
        thread_merged_data[count] = OvertuneData(
            ot.cent + f32(variable_freq),
            ot.intensity
        );
        count++;
    }

    return count;
}

// Insertion sort for thread-local data
fn sort_thread_merged_data(count: u32) {
    for (var i: u32 = 1u; i < count; i++) {
        let key = thread_merged_data[i];
        var j: i32 = i32(i) - 1;

        while j >= 0 && thread_merged_data[u32(j)].cent > key.cent {
            thread_merged_data[u32(j + 1)] = thread_merged_data[u32(j)];
            j--;
        }
        thread_merged_data[u32(j + 1)] = key;
    }
}

// Merge data with same cent values in thread-local storage
fn merge_same_cents_thread_local(count: u32) -> u32 {
    if count == 0u {
        return 0u;
    }

    var final_count: u32 = 1u;
    var write_idx: u32 = 0u;

    for (var i: u32 = 1u; i < count; i++) {
        if abs(thread_merged_data[write_idx].cent - thread_merged_data[i].cent) < 1e-6 {
            // Merge with previous entry
            thread_merged_data[write_idx].intensity += thread_merged_data[i].intensity;
        } else {
            // Move to next position
            write_idx++;
            if write_idx != i {
                thread_merged_data[write_idx] = thread_merged_data[i];
            }
            final_count++;
        }
    }

    return final_count;
}

// Main computation function for frequency interactions using thread-local data
fn compute_interactions_thread_local(final_count: u32) -> f32 {
    var sum: f32 = 0.0;

    if final_count <= 2u {
        return sum;
    }

    for (var i: u32 = 1u; i < (final_count - 1u); i++) {
        for (var j: u32 = (i + 1u); j < final_count; j++) {
            let ii = thread_merged_data[i];
            let jj = thread_merged_data[j];
            let diff = jj.cent - ii.cent;

            if diff >= f32(params.curve_points_count) {
                break;
            }

            let diff_idx = u32(round(diff));
            if diff_idx < params.curve_points_count {
                sum += ii.intensity * jj.intensity * curve_points[diff_idx];
            }
        }
    }

    return sum;
}

@compute @workgroup_size(64, 1, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let thread_id = global_id.x;
    let variable_freq_range = params.variable_base_freq_to - params.variable_base_freq_from + 1;
    
    // Check if this thread should process a frequency value
    // Ensure variable_freq_range is positive
    if (variable_freq_range <= 0 || thread_id >= u32(variable_freq_range)) {
        return;
    }

    let current_variable_freq = params.variable_base_freq_from + i32(thread_id);
    
    // Each thread processes its assigned variable frequency independently
    let merged_count = merge_overtune_data_thread_local(current_variable_freq);
    
    // Sort the merged data
    sort_thread_merged_data(merged_count);
    
    // Merge entries with same cent values
    let final_count = merge_same_cents_thread_local(merged_count);
    
    // Compute the final interaction sum
    let result_sum = compute_interactions_thread_local(final_count);
    
    // Store result
    results[thread_id] = ResultData(current_variable_freq, result_sum);
}
