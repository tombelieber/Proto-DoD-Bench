interface BenchmarkStats {
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
    protobufjs: string;
    dod: string;
}
