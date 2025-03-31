import { computeStats } from "@/lib/stats";
import { BenchmarkDefinition, BenchmarkRunOptions, ExtendedBenchmarkResults } from "@/types";
import { BinaryStringConfigComponent } from "../components/benchmark-configs/BinaryStringConfig";

// Default values
const DEFAULT_ITERATIONS = 10 * 1_000;

// --- Test Functions and Setup ---

/**
 * Sets up the binary data for testing:
 * - Creates sample strings "CALL" and "PUT"
 * - Encodes them into Uint8Array using TextEncoder
 */
function setupBinaryData() {
    const options = ["CALL", "PUT"];
    const textEncoder = new TextEncoder();
    const binaryOptions: Uint8Array[] = options.map(str => textEncoder.encode(str));

    return {
        CALL_BINARY: binaryOptions[0],
        PUT_BINARY: binaryOptions[1],
        CALL_STRING: options[0],
        PUT_STRING: options[1],
    };
}

/**
 * Compares two Uint8Arrays element by element using a traditional loop.
 */
function compareBinaryArraysUsingLoop(a: Uint8Array, b: Uint8Array): boolean {
    if (a.byteLength !== b.byteLength) return false;
    for (let i = 0; i < a.byteLength; i++) {
        if (a[i] !== b[i]) return false;
    }
    return true;
}

/**
 * Compares two Uint8Arrays using the Array.every() method.
 */
function compareBinaryArraysUsingEvery(a: Uint8Array, b: Uint8Array): boolean {
    return a.length === b.length && a.every((value, index) => value === b[index]);
}

/**
 * Benchmarks string decoding performed on the fly.
 */
function runOnTheFlyStringDecoding(binary: Uint8Array, compareString: string): boolean {
    const txtDecoder = new TextDecoder("UTF-8");
    const decoded = txtDecoder.decode(binary);
    return decoded === compareString;
}

/**
 * Benchmarks string comparison with pre-decoded strings.
 */
function runPreDecodedStringComparison(decodedStr: string, compareString: string): boolean {
    return decodedStr === compareString;
}

// --- Benchmark Runner Function ---

async function runBinaryStringBenchmark(
    options: BenchmarkRunOptions
): Promise<ExtendedBenchmarkResults> {
    const benchmarkIterations = options.iterations;
    const internalIterations =
        typeof options.config.internalIterations === "number" &&
        options.config.internalIterations > 0
            ? options.config.internalIterations
            : DEFAULT_ITERATIONS;

    console.log(
        `Starting binary string comparison benchmarks with ${internalIterations} internal iterations, ${benchmarkIterations} benchmark iterations...`
    );

    const data = setupBinaryData();
    const txtDecoder = new TextDecoder("UTF-8");
    const decodedCall = txtDecoder.decode(data.CALL_BINARY);

    // Time arrays for different methods
    const timesBinaryLoop: number[] = [];
    const timesBinaryEvery: number[] = [];
    const timesOnTheFlyDecoding: number[] = [];
    const timesPreDecodedComparison: number[] = [];

    // Run the benchmark iterations
    for (let i = 0; i < benchmarkIterations; i++) {
        // Binary Loop
        const startBinaryLoop = performance.now();
        for (let j = 0; j < internalIterations; j++) {
            compareBinaryArraysUsingLoop(data.CALL_BINARY, data.PUT_BINARY);
        }
        const endBinaryLoop = performance.now();
        timesBinaryLoop.push(endBinaryLoop - startBinaryLoop);

        // Binary Every
        const startBinaryEvery = performance.now();
        for (let j = 0; j < internalIterations; j++) {
            compareBinaryArraysUsingEvery(data.CALL_BINARY, data.PUT_BINARY);
        }
        const endBinaryEvery = performance.now();
        timesBinaryEvery.push(endBinaryEvery - startBinaryEvery);

        // On-the-fly String Decoding
        const startOnTheFly = performance.now();
        for (let j = 0; j < internalIterations; j++) {
            runOnTheFlyStringDecoding(data.CALL_BINARY, "CALL");
        }
        const endOnTheFly = performance.now();
        timesOnTheFlyDecoding.push(endOnTheFly - startOnTheFly);

        // Pre-decoded String Comparison
        const startPreDecoded = performance.now();
        for (let j = 0; j < internalIterations; j++) {
            runPreDecodedStringComparison(decodedCall, "CALL");
        }
        const endPreDecoded = performance.now();
        timesPreDecodedComparison.push(endPreDecoded - startPreDecoded);
    }

    // Compute stats for all methods
    const statsBinaryLoop = computeStats(timesBinaryLoop);
    const statsBinaryEvery = computeStats(timesBinaryEvery);
    const statsOnTheFlyDecoding = computeStats(timesOnTheFlyDecoding);
    const statsPreDecodedComparison = computeStats(timesPreDecodedComparison);

    console.log("Binary Loop stats (ms):", statsBinaryLoop);
    console.log("Binary Every stats (ms):", statsBinaryEvery);
    console.log("On-the-fly String Decoding stats (ms):", statsOnTheFlyDecoding);
    console.log("Pre-decoded String Comparison stats (ms):", statsPreDecodedComparison);

    return {
        implementations: [
            {
                name: "binaryLoop",
                label: "Binary Comparison - Loop",
                stats: statsBinaryLoop,
            },
            {
                name: "binaryEvery",
                label: "Binary Comparison - Every",
                stats: statsBinaryEvery,
            },
            {
                name: "onTheFlyDecoding",
                label: "String Comparison - On-the-Fly Decode",
                stats: statsOnTheFlyDecoding,
            },
            {
                name: "preDecodedComparison",
                label: "String Comparison - Pre-Decoded",
                stats: statsPreDecodedComparison,
            },
        ],
        // Each iteration processes the internalIterations, multiplied by the number of bytes
        // in the comparison strings
        itemsProcessed: internalIterations,
    };
}

// --- Benchmark Definition Export ---

export const runBinaryStringBenchmarkDefinition: BenchmarkDefinition = {
    id: "binaryString",
    label: "Binary String vs String Matching",
    runBenchmark: runBinaryStringBenchmark,
    ConfigComponent: BinaryStringConfigComponent,
    defaultConfig: {
        internalIterations: DEFAULT_ITERATIONS,
    },
    description:
        "Compares performance of binary array matching versus string matching with and without decoding.",
};
