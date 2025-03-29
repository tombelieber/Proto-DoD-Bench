import { BenchmarkResults } from "./BenchmarkResults";
import { MyModel } from "./MyModel";
import { MyModelDODStore } from "./MyModelDODStore";
import { NUM_MESSAGES, ITERATIONS } from "./NUM_MESSAGES";

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
function decodeWithProtobufjs(binaryData: Uint8Array[]): MyModel[] {
    const res = [];
    for (const msg of binaryData) {
        res.push(MyModel.decode(msg));
    }
    return res;
}
// Preallocate a 20MB target buffer.
const TARGET_SIZE = 20 * 1024 * 1024; // 20 MB in bytes.
// Preallocate a store with 20MB of buffer space.
const dodStore = new MyModelDODStore(TARGET_SIZE);

/**
 * Decodes messages using the DOD parser.
 */
function decodeWithDOD(binaryData: Uint8Array[]): {
    count: number;
    ids: Uint32Array;
    values: Float64Array;
} {
    return dodStore.decodeFromList(binaryData);
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

// /**
//  * Runs the given decode function ITERATIONS times and returns an array of timings.
//  * In each iteration, it generates new random binary messages.
//  */
// async function runBenchmark(
//     fn: (binaryData: Uint8Array[]) => void,
//     name: string,
// ): Promise<number[]> {
//     const times: number[] = [];
//     for (let i = 0; i < ITERATIONS; i++) {
//         // Generate new random messages for this iteration.
//         const { protobufjsMessages } = generateBinaryData();
//         const start = performance.now();
//         fn(protobufjsMessages);
//         const end = performance.now();
//         times.push(end - start);
//     }
//     console.debug(
//         `Benchmark ${name}`,
//         fn(generateBinaryData().protobufjsMessages),
//     );
//     return times;
// }

export async function runBenchmarks(): Promise<BenchmarkResults> {
    console.log("Starting benchmarks...");
    // Generate a snapshot to log the number of messages (this is optional)
    const { protobufjsMessages: initialMessages } = generateBinaryData();
    console.log("Generated binary data:", initialMessages.length, "messages");

    const timesDOD: number[] = [];
    const timesPB: number[] = [];

    for (let i = 0; i < ITERATIONS; i++) {
        // Pre-generate the data snapshot for this iteration.
        const { protobufjsMessages: dataSnapshot } = generateBinaryData();

        // Benchmark DOD decode using the snapshot.
        const startDOD = performance.now();
        decodeWithDOD(dataSnapshot);
        const endDOD = performance.now();
        timesDOD.push(endDOD - startDOD);

        // Benchmark protobufjs static decode using the same snapshot.
        const startPB = performance.now();
        decodeWithProtobufjs(dataSnapshot);
        const endPB = performance.now();
        timesPB.push(endPB - startPB);

        // Optionally, you could verify that resultDOD and resultPB match.
    }
    const snapshot = generateBinaryData().protobufjsMessages;
    const dodData = decodeWithDOD(snapshot);
    const pbjsData = decodeWithProtobufjs(snapshot);
    console.log("Decoded data:", { dodData, pbjsData });

    const statsDOD = computeStats(timesDOD);
    const statsPB = computeStats(timesPB);

    console.log("DOD decode stats (ms):", statsDOD);
    console.log("Protobufjs decode stats (ms):", statsPB);

    return {
        dod: statsDOD,
        protobufjs: statsPB,
    };
}
