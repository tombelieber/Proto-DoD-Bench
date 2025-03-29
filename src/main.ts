import { MyModel } from "./MyModel";
import { MyModelDODStore } from "./MyModelDODStore";

const NUM_MESSAGES = 10_000;
const ITERATIONS = 1000;

// const NUM_MESSAGES = 1e6; // 1 million messages
// const ITERATIONS = 100;

interface MyModelData {
    id: number;
    value: number;
}

/**
 * Generates an array of binary messages and their original data.
 */
function generateBinaryData(): {
    protobufjsMessages: Uint8Array[];
    originalData: MyModelData[];
} {
    const protobufjsMessages: Uint8Array[] = [];
    const originalData: MyModelData[] = [];

    for (let i = 0; i < NUM_MESSAGES; i++) {
        // Use smaller values to avoid precision loss
        const msg = {
            id: i,
            value: 1.0 + i * 0.1, // This will give us values like 1.0, 1.1, 1.2, etc.
        };

        // Generate protobufjs message
        const protobufjsEncoded = MyModel.encode(msg);
        protobufjsMessages.push(protobufjsEncoded.finish());

        originalData.push(msg);
    }
    return { protobufjsMessages, originalData };
}

/**
 * Decodes all messages using protobufjs (static decode).
 */
function decodeWithProtobufjs(binaryData: Uint8Array[]) {
    for (const msg of binaryData) {
        MyModel.decode(msg);
    }
}

// Preallocate a 20MB target buffer.
const TARGET_SIZE = 20 * 1024 * 1024; // 20 MB in bytes.
// Preallocate a store with 20MB of buffer space.
const dodStore = new MyModelDODStore(TARGET_SIZE);

/**
 * Usage example:
 * Given an array of Uint8Array messages (each 14 bytes),
 * concatenate them into the preallocated targetBuffer and decode them
 * into preallocated ids and values arrays.
 */
function decodeWithDOD(binaryData: Uint8Array[]) {
    dodStore.decodeFromList(binaryData);
}

/**
 * Computes statistics from an array of numbers.
 */
function computeStats(times: number[]) {
    const sorted = [...times].sort((a, b) => a - b);
    const n = sorted.length;
    const sum = sorted.reduce((acc, cur) => acc + cur, 0);
    const mean = sum / n;
    const median =
        n % 2 === 0
            ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2
            : sorted[Math.floor(n / 2)];
    const p99 = sorted[Math.floor(n * 0.99)];
    return { sum, mean, median, p99, min: sorted[0], max: sorted[n - 1] };
}

/**
 * Runs the given decode function ITERATIONS times and returns an array of timings.
 */
async function runBenchmark(
    fn: (binaryData: Uint8Array[]) => void,
    binaryData: Uint8Array[],
): Promise<number[]> {
    const times: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
        const start = performance.now();
        fn(binaryData);
        const end = performance.now();
        times.push(end - start);

        // // Allow a frame for UI responsiveness.
        // await new Promise(requestAnimationFrame);
    }
    return times;
}

export async function runBenchmarks() {
    console.log("Starting benchmarks...");
    const { protobufjsMessages } = generateBinaryData();
    console.log(
        "Generated binary data:",
        protobufjsMessages.length,
        "messages",
    );

    console.log("Benchmarking decodeWithDOD toJSON static decode...");
    const timesProtobufDOD = await runBenchmark(
        decodeWithDOD,
        protobufjsMessages,
    );
    const statsProtobufDOD = computeStats(timesProtobufDOD);
    console.log("DecodeWithDOD toJSON decode stats (ms):", statsProtobufDOD);

    console.log("Benchmarking protobufjs static decode...");
    const timesProtobufjs = await runBenchmark(
        decodeWithProtobufjs,
        protobufjsMessages,
    );
    const statsProtobufjs = computeStats(timesProtobufjs);
    console.log("Protobufjs decode stats (ms):", statsProtobufjs);

    // Display results on the page
    const pre = document.createElement("pre");
    pre.textContent = `
Protobufjs decode stats (ms):
Min:    ${statsProtobufjs.min.toFixed(2)}
Max:    ${statsProtobufjs.max.toFixed(2)}
Mean:   ${statsProtobufjs.mean.toFixed(2)}
Median: ${statsProtobufjs.median.toFixed(2)} (p50)
p99:    ${statsProtobufjs.p99.toFixed(2)}
Sum:    ${statsProtobufjs.sum.toFixed(2)}

DOD decode stats (ms):
Min:    ${statsProtobufDOD.min.toFixed(2)}
Max:    ${statsProtobufDOD.max.toFixed(2)}
Mean:   ${statsProtobufDOD.mean.toFixed(2)}
Median: ${statsProtobufDOD.median.toFixed(2)} (p50)
p99:    ${statsProtobufDOD.p99.toFixed(2)}
Sum:    ${statsProtobufDOD.sum.toFixed(2)}
`;
    document.body.appendChild(pre);
}

// Protobufjs decode stats (ms):
// Min:    33.00
// Max:    38.90
// Mean:   33.97
// Median: 33.85 (p50)
// p99:    38.90
// Sum:    3397.40

// Protobufjs ToJSON decode stats (ms):
// Min:    33.00
// Max:    38.90
// Mean:   33.97
// Median: 33.85 (p50)
// p99:    38.90
// Sum:    3397.40

// pbf decode stats (ms):
// Min:    51.40
// Max:    53.30
// Mean:   52.28
// Median: 52.30 (p50)
// p99:    53.30
// Sum:    5228.30

// Protobufjs decode stats (ms):
// Min:    33.00
// Max:    35.40
// Mean:   33.68
// Median: 33.60 (p50)
// p99:    35.40
// Sum:    3368.40

// DOD decode stats (ms):
// Min:    28.00
// Max:    49.00
// Mean:   29.35
// Median: 29.05 (p50)
// p99:    49.00
// Sum:    2935.20

// const NUM_MESSAGES = 10_000; const ITERATIONS = 1000; Preview mode

// Protobufjs decode stats (ms):
// Min:    0.30
// Max:    0.70
// Mean:   0.48
// Median: 0.50 (p50)
// p99:    0.60
// Sum:    481.90

// DOD decode stats (ms):
// Min:    0.30
// Max:    1.10
// Mean:   0.40
// Median: 0.40 (p50)
// p99:    0.60
// Sum:    403.70
