import { useCallback, useEffect, useRef, useState } from "react";
import { BenchmarkResults, HistoricalP99Data } from "../types";
import { runBenchmarks } from "@/benchmarks/protobuf_dod_bench";

export type BenchmarkType = 'protobuf' | 'json' | 'custom';

// LocalStorage key for historical data
const HISTORY_STORAGE_KEY = 'historicalBenchmarkData';

// Function to load historical data from localStorage
const loadHistoricalData = (): HistoricalP99Data[] => {
  const savedData = localStorage.getItem(HISTORY_STORAGE_KEY);
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      // Basic validation: check if it's an array
      if (Array.isArray(parsed)) {
        // Optional: Further validation on array items if needed
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse historical benchmark data from localStorage", e);
      // Fallback to empty array if parsing fails or data is invalid
    }
  }
  return [];
};

interface UseBenchmarkOptions {
    type: BenchmarkType;
    numMessages: number;
    iterations: number;
    maxHistoricalPoints: number;
    autoRun?: boolean;
    interval?: number;
}

export const useBenchmark = (options: UseBenchmarkOptions) => {
    const { type, numMessages, iterations, maxHistoricalPoints, autoRun: initialAutoRun = true, interval = 1000 } = options;
    const [results, setResults] = useState<BenchmarkResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(initialAutoRun);
    const intervalRef = useRef<number | null>(null);
    const [historicalP99Data, setHistoricalP99Data] = useState<HistoricalP99Data[]>(loadHistoricalData);

    const handleRunBenchmarks = useCallback(async () => {
        if (loading) return;
        setLoading(true);
        try {
            const res: BenchmarkResults = await runBenchmarks(type, numMessages, iterations);
            setResults(res);

            const now = new Date().toLocaleTimeString();
            const newData: HistoricalP99Data = { time: now };

            res.implementations.forEach(impl => {
                newData[impl.name] = impl.stats.p99;
            });

            setHistoricalP99Data(prev => {
                const updated = [...prev, newData];
                if (updated.length > maxHistoricalPoints) {
                    return updated.slice(-maxHistoricalPoints);
                }
                return updated;
            });
        } finally {
            setLoading(false);
        }
    }, [type, numMessages, iterations, loading, maxHistoricalPoints]);

    const handleAutoRunToggle = useCallback(() => {
        setAutoRun(prev => !prev);
    }, []);

    useEffect(() => {
        if (autoRun) {
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
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

    // Save historical data to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(historicalP99Data));
    }, [historicalP99Data]);

    return {
        results,
        loading,
        autoRun,
        historicalP99Data,
        handleRunBenchmarks,
        handleAutoRunToggle,
    };
};
