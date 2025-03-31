export interface BenchmarkStats {
    min: number;
    max: number;
    mean: number;
    median: number;
    p99: number;
    sum: number;
}

export type BenchmarkImplementation = {
    name: string;
    label: string;
    stats: BenchmarkStats;
};

export interface BenchmarkResults {
    implementations: BenchmarkImplementation[];
}

export interface RowData {
    implementation: string; // e.g., 'ProtobufJS', 'DOD'
    min: number;
    max: number;
    mean: number;
    median: number;
    p99: number;
    sum: number;
    throughput: number; // Messages per second
}

export interface HistoricalP99Data {
    time: string;
    [key: string]: number | string; // Allow dynamic implementation keys
}

export type ThemeMode = "light" | "dark" | "system";
