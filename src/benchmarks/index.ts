import { BenchmarkDefinition } from "@/types";
import { runProtobufBenchmarkDefinition } from "./protobuf_dod_bench";
import { runLoopBenchmarkDefinition } from "./loop_bench";

// Array of all available benchmark definitions
export const benchmarkDefinitions: BenchmarkDefinition[] = [
    runProtobufBenchmarkDefinition,
    runLoopBenchmarkDefinition,
    // Add new benchmark definitions here
];

// Helper to find a definition by ID
export const getBenchmarkDefinitionById = (id: string): BenchmarkDefinition | undefined => {
    return benchmarkDefinitions.find(def => def.id === id);
};
