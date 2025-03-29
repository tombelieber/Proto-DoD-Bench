import { MyModel } from "./MyModel";
import { MyModelDODStore } from "./MyModelDODStore";

const NUM_MESSAGES = 10_000;
const ITERATIONS = 100;
// const NUM_MESSAGES = 1e6; // 1 million messages
// const ITERATIONS = 100;

interface MyModelData {
    id: number;
    value: number;
}

/**
 * Generates an array of binary messages and their original data,
 * with random values for each iteration.
 */
function generateBinaryData(): {
    protobufjsMessages: Uint8Array[];
    originalData: MyModelData[];
} {
    const protobufjsMessages: Uint8Array[] = [];
    const originalData: MyModelData[] = [];

    for (let i = 0; i < NUM_MESSAGES; i++) {
        // Generate a random value (for example, between 1.0 and 100.0)
        const msg = {
            id: i,
            value: 1.0 + Math.random() * 99.0,
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
 * Decodes messages using the DOD parser.
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
 * In each iteration, it generates new random binary messages.
 */
async function runBenchmark(
    fn: (binaryData: Uint8Array[]) => void,
): Promise<number[]> {
    const times: number[] = [];
    for (let i = 0; i < ITERATIONS; i++) {
        // Generate new random messages for this iteration.
        const { protobufjsMessages } = generateBinaryData();
        const start = performance.now();
        fn(protobufjsMessages);
        const end = performance.now();
        times.push(end - start);
    }
    return times;
}

export async function runBenchmarks() {
    console.log("Starting benchmarks...");
    // Generate initial data just to know the count.
    const { protobufjsMessages } = generateBinaryData();
    console.log(
        "Generated binary data:",
        protobufjsMessages.length,
        "messages",
    );

    console.log("Benchmarking DOD decode...");
    const timesDOD = await runBenchmark(decodeWithDOD);
    const statsDOD = computeStats(timesDOD);
    console.log("DOD decode stats (ms):", statsDOD);

    console.log("Benchmarking protobufjs static decode...");
    const timesPB = await runBenchmark(decodeWithProtobufjs);
    const statsPB = computeStats(timesPB);
    console.log("Protobufjs decode stats (ms):", statsPB);

    // Display results on the page
    const pre = document.createElement("pre");
    pre.textContent = `
Protobufjs decode stats (ms):
Min:    ${statsPB.min.toFixed(4)}
Max:    ${statsPB.max.toFixed(4)}
Mean:   ${statsPB.mean.toFixed(4)}
Median: ${statsPB.median.toFixed(4)} (p50)
p99:    ${statsPB.p99.toFixed(4)}
Sum:    ${statsPB.sum.toFixed(4)}

DOD decode stats (ms):
Min:    ${statsDOD.min.toFixed(4)}
Max:    ${statsDOD.max.toFixed(4)}
Mean:   ${statsDOD.mean.toFixed(4)}
Median: ${statsDOD.median.toFixed(4)} (p50)
p99:    ${statsDOD.p99.toFixed(4)}
Sum:    ${statsDOD.sum.toFixed(4)}
`;
    document.body.appendChild(pre);
}
