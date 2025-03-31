import { computeStats } from "@/lib/stats";
import { BenchmarkDefinition, BenchmarkRunOptions, ExtendedBenchmarkResults } from "@/types";

const ARRAY_SIZE = 10000; // Size of the array to iterate over

// --- Test Functions ---

function runForLoop(arr: number[]): number {
    let sum = 0;
    for (let i = 0; i < arr.length; i++) {
        sum += arr[i];
    }
    return sum;
}

function runForOfLoop(arr: number[]): number {
    let sum = 0;
    for (const item of arr) {
        sum += item;
    }
    return sum;
}

function runForInLoop(arr: number[]): number {
    let sum = 0;
    // NOTE: for...in iterates over *keys* (indices for arrays), and keys are strings.
    // It's generally not recommended for array iteration due to performance and potential issues with inherited properties.
    // We include it for comparison as requested.
    for (const key in arr) {
        // Check if the property is directly on the array, not inherited
        if (Object.prototype.hasOwnProperty.call(arr, key)) {
            // Keys are strings, need to convert index to number if using for calculation, or element via arr[key]
            sum += arr[parseInt(key, 10)]; // Or sum += arr[key] if values are not numbers
        }
    }
    return sum;
}

// --- Benchmark Runner Function (Adapts to new interface) ---

async function runLoopBenchmark(options: BenchmarkRunOptions): Promise<ExtendedBenchmarkResults> {
    const iterations = options.iterations;
    // No specific config needed for this benchmark yet, but could be added
    // const configValue = options.config.someKey;

    console.log(
        `Starting loop benchmarks with ${ARRAY_SIZE} elements, ${iterations} iterations...`
    );

    const testArray = Array.from({ length: ARRAY_SIZE }, (_, i) => i + 1);

    const timesFor: number[] = [];
    const timesForOf: number[] = [];
    const timesForIn: number[] = [];

    for (let i = 0; i < iterations; i++) {
        const startFor = performance.now();
        runForLoop(testArray);
        const endFor = performance.now();
        timesFor.push(endFor - startFor);

        const startForOf = performance.now();
        runForOfLoop(testArray);
        const endForOf = performance.now();
        timesForOf.push(endForOf - startForOf);

        const startForIn = performance.now();
        runForInLoop(testArray);
        const endForIn = performance.now();
        timesForIn.push(endForIn - startForIn);
    }

    const statsFor = computeStats(timesFor);
    const statsForOf = computeStats(timesForOf);
    const statsForIn = computeStats(timesForIn);

    console.log("For loop stats (ms):", statsFor);
    console.log("For...of loop stats (ms):", statsForOf);
    console.log("For...in loop stats (ms):", statsForIn);

    return {
        implementations: [
            {
                name: "for",
                label: "For Loop (indexed)",
                stats: statsFor,
            },
            {
                name: "forOf",
                label: "For...of Loop",
                stats: statsForOf,
            },
            {
                name: "forIn",
                label: "For...in Loop (keys)",
                stats: statsForIn,
            },
        ],
        // Each iteration processes the full array
        itemsProcessed: ARRAY_SIZE,
    };
}

// --- Benchmark Definition Export ---

export const runLoopBenchmarkDefinition: BenchmarkDefinition = {
    id: "loops",
    label: "JS Loop Comparison",
    runBenchmark: runLoopBenchmark,
    // No specific ConfigComponent needed
    defaultConfig: {},
    description: "Compares performance of for, for...of, and for...in loops on an array.",
};

// Remove the old export if it exists
// export async function runLoopBenchmarks(...) {}
