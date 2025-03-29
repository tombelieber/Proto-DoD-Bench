export interface BenchmarkStats {
    min: number;
    max: number;
    mean: number;
    median: number;
    p99: number;
    sum: number;
}

export interface BenchmarkResults {
    protobufjs: BenchmarkStats;
    dod: BenchmarkStats;
}

export interface RowData {
    metric: string;
    protobufjs: number;
    dod: number;
}

export interface HistoricalP99Data {
    time: string;
    protobufjs: number;
    dod: number;
}

export type ThemeMode = "light" | "dark" | "system";
