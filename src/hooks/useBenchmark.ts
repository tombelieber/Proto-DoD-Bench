import { useCallback, useEffect, useRef, useState } from "react";
import { BenchmarkResults, HistoricalP99Data } from "../types";
import { runBenchmarks } from "../main";

const MAX_HISTORICAL_DATA_POINTS = 10;

export type BenchmarkType = 'protobuf' | 'json' | 'custom';

interface UseBenchmarkOptions {
    type: BenchmarkType;
    autoRun?: boolean;
    interval?: number;
}

export const useBenchmark = (options: UseBenchmarkOptions) => {
    const { type, autoRun: initialAutoRun = true, interval = 1000 } = options;
    const [results, setResults] = useState<BenchmarkResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(initialAutoRun);
    const [historicalP99Data, setHistoricalP99Data] = useState<HistoricalP99Data[]>([]);
    const intervalRef = useRef<number | null>(null);

    const handleRunBenchmarks = useCallback(async () => {
        setLoading(true);
        const res: BenchmarkResults = await runBenchmarks(type);
        setResults(res);

        const now = new Date().toLocaleTimeString();
        const newData: HistoricalP99Data = { time: now };

        // Dynamically add p99 stats for each implementation
        res.implementations.forEach(impl => {
            newData[impl.name] = impl.stats.p99;
        });

        setHistoricalP99Data(prev => {
            const updated = [...prev, newData];
            if (updated.length > MAX_HISTORICAL_DATA_POINTS) {
                return updated.slice(-MAX_HISTORICAL_DATA_POINTS);
            }
            return updated;
        });

        setLoading(false);
    }, [type]);

    const handleAutoRunToggle = useCallback(() => {
        setAutoRun(prev => !prev);
    }, []);

    useEffect(() => {
        if (autoRun) {
            intervalRef.current = window.setInterval(handleRunBenchmarks, interval);
        } else {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [autoRun, handleRunBenchmarks, interval]);

    return {
        results,
        loading,
        autoRun,
        historicalP99Data,
        handleRunBenchmarks,
        handleAutoRunToggle,
    };
};
