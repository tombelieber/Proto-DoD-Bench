import { MyModel } from "@/MyModel";
import { MyModelDODStore } from "@/MyModelDODStore";
import { BenchmarkDefinition, BenchmarkRunOptions, ExtendedBenchmarkResults } from "@/types";
import { computeStats } from "@/lib/stats";
import { ProtobufConfigComponent } from "@/components/benchmark-configs/ProtobufConfig";

const DEFAULT_NUM_MESSAGES = 10000;

// --- Benchmark Logic ---

/**
 * Generates an array of binary messages,
 * with random values for each iteration.
 */
function generateBinaryData(numMessages: number): {
    protobufjsMessages: Uint8Array[];
} {
    const protobufjsMessages: Uint8Array[] = [];

    for (let i = 0; i < numMessages; i++) {
        const msg = {
            id: i,
            value: 1.0 + Math.random() * 99.0,
        };
        const protobufjsEncoded = MyModel.encode(msg);
        protobufjsMessages.push(protobufjsEncoded.finish());
    }
    return { protobufjsMessages };
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

const TARGET_SIZE = 20 * 1024 * 1024; // 20 MB in bytes.
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

// --- Benchmark Runner Function (Adapts to new interface) ---

async function runProtobufBenchmark(
    options: BenchmarkRunOptions
): Promise<ExtendedBenchmarkResults> {
    // Extract config with type safety
    const numMessages =
        typeof options.config.numMessages === "number" && options.config.numMessages > 0
            ? options.config.numMessages
            : DEFAULT_NUM_MESSAGES;
    const iterations = options.iterations;

    console.log(
        `Starting Protobuf benchmarks with ${numMessages} messages, ${iterations} iterations...`
    );

    const timesDOD: number[] = [];
    const timesPB: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const { protobufjsMessages: dataSnapshot } = generateBinaryData(numMessages);

        const startDOD = performance.now();
        decodeWithDOD(dataSnapshot);
        const endDOD = performance.now();
        timesDOD.push(endDOD - startDOD);

        const startPB = performance.now();
        decodeWithProtobufjs(dataSnapshot);
        const endPB = performance.now();
        timesPB.push(endPB - startPB);
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
        // Number of messages processed per iteration is the key metric for throughput
        itemsProcessed: numMessages,
    };
}

// --- Benchmark Definition Export ---

export const runProtobufBenchmarkDefinition: BenchmarkDefinition = {
    id: "protobuf",
    label: "Protobuf vs DOD Decode",
    runBenchmark: runProtobufBenchmark,
    ConfigComponent: ProtobufConfigComponent,
    defaultConfig: {
        numMessages: DEFAULT_NUM_MESSAGES,
    },
    description:
        "Compares the decoding speed of standard Protobuf.js vs. a custom Data-Oriented Design store.",
};

// Remove the old export if it exists
// export async function runBenchmarks(...) {}
