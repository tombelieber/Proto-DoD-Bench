import React from "react";

export interface BenchmarkStats {
    min: number;
    max: number;
    mean: number;
    median: number;
    p99: number;
    sum: number;
}

export interface BenchmarkImplementation {
    name: string; // Unique name for the implementation within the benchmark
    label: string; // Display label for the implementation
    stats: BenchmarkStats;
}

export interface BenchmarkResults {
    implementations: BenchmarkImplementation[];
}

// --- New Scalable Benchmark Definitions ---

// Options passed to every benchmark runner
export interface BenchmarkRunOptions {
    iterations: number;
    // Generic config object for benchmark-specific needs
    config: Record<string, unknown>;
}

// Expected return type from every benchmark runner
export interface ExtendedBenchmarkResults extends BenchmarkResults {
    // A common metric indicating the "work done" for throughput calculation
    itemsProcessed: number;
}

// Interface for the props passed to a benchmark-specific config component
export interface BenchmarkConfigComponentProps {
    config: Record<string, unknown>;
    onConfigChange: (newConfig: Record<string, unknown>) => void;
}

// The main definition structure for a benchmark type
export interface BenchmarkDefinition {
    id: string; // Unique identifier (e.g., 'protobuf', 'loops')
    label: string; // Display label (e.g., 'Protobuf vs DOD')
    // The function that executes the benchmark
    runBenchmark: (options: BenchmarkRunOptions) => Promise<ExtendedBenchmarkResults>;
    // Optional component for benchmark-specific configuration inputs
    ConfigComponent?: React.FC<BenchmarkConfigComponentProps>;
    // Initial default configuration values for this benchmark
    defaultConfig: Record<string, unknown>;
    // Description or details about the benchmark (optional)
    description?: string;
}

// --- End New Definitions ---

// Grid Row Data - throughput is now required
export interface RowData {
    implementation: string;
    min: number;
    max: number;
    mean: number;
    median: number;
    p99: number;
    sum: number;
    throughput: number; // Throughput is now mandatory
}

// Historical data format (remains the same for now)
export interface HistoricalP99Data {
    time: string;
    [implementationName: string]: number | string;
}
