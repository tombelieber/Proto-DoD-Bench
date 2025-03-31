import { MyModel } from "@/MyModel";
import { MyModelDODStore } from "@/MyModelDODStore";
import { BenchmarkResults } from "@/types";

/**
 * Generates an array of binary messages,
 * with random values for each iteration.
 */
function generateBinaryData(numMessages: number): {
    protobufjsMessages: Uint8Array[];
} {
    const protobufjsMessages: Uint8Array[] = [];

    for (let i = 0; i < numMessages; i++) {
        // Use arg
        // Generate a random value (for example, between 1.0 and 100.0)
        const msg = {
            id: i,
            value: 1.0 + Math.random() * 99.0,
        };

        // Generate protobufjs message
        const protobufjsEncoded = MyModel.encode(msg);
        protobufjsMessages.push(protobufjsEncoded.finish());
    }
    return { protobufjsMessages };
}

// ... (decode functions remain the same) ...

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
        n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
    const p99 = sorted[Math.floor(n * 0.99)];
    return { sum, mean, median, p99, min: sorted[0], max: sorted[n - 1] };
}

// export type BenchmarkType = 'protobuf' | 'json' | 'custom'; // Removed unused type

// Update function signature to accept config
export async function runBenchmarks(
    numMessages: number,
    iterations: number
): Promise<BenchmarkResults> {
    console.log(`Starting benchmarks with ${numMessages} messages, ${iterations} iterations...`);

    const timesDOD: number[] = [];
    const timesPB: number[] = [];

    for (let i = 0; i < iterations; i++) {
        // Use arg
        // Pre-generate the data snapshot for this iteration.
        const { protobufjsMessages: dataSnapshot } = generateBinaryData(numMessages); // Use arg

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

    const statsDOD = computeStats(timesDOD);
    const statsPB = computeStats(timesPB);

    console.log("DOD decode stats (ms):", statsDOD);
    console.log("Protobufjs decode stats (ms):", statsPB);

    return {
        implementations: [
            {
                name: "protobufjs",
                label: "ProtobufJS",
                stats: statsPB,
            },
            {
                name: "dod",
                label: "DOD",
                stats: statsDOD,
            },
        ],
    };
}
