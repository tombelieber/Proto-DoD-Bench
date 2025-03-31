import { useCallback, useEffect, useRef, useState } from "react";
import {
    BenchmarkDefinition,
    ExtendedBenchmarkResults,
    HistoricalP99Data,
    BenchmarkRunOptions,
    BenchmarkImplementation,
} from "../types"; // Corrected import path

// Function to get/set storage keys based on benchmark ID
const getHistoryStorageKey = (benchmarkId: string) => `historicalBenchmarkData_${benchmarkId}`;
const getConfigStorageKey = (benchmarkId: string) => `benchmarkConfig_${benchmarkId}`;

// Load historical data for a specific benchmark
const loadHistoricalData = (benchmarkId: string): HistoricalP99Data[] => {
    const storageKey = getHistoryStorageKey(benchmarkId);
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
        try {
            const parsed = JSON.parse(savedData);
            if (Array.isArray(parsed)) {
                return parsed;
            }
        } catch (e) {
            console.error(
                `Failed to parse historical data for ${benchmarkId} from localStorage`,
                e
            );
        }
    }
    return [];
};

// Load config for a specific benchmark, merging with defaults
const loadBenchmarkConfig = (benchmarkDef: BenchmarkDefinition): Record<string, unknown> => {
    const storageKey = getConfigStorageKey(benchmarkDef.id);
    const savedConfig = localStorage.getItem(storageKey);
    let parsedConfig = {};
    if (savedConfig) {
        try {
            parsedConfig = JSON.parse(savedConfig);
        } catch (e) {
            console.error(`Failed to parse config for ${benchmarkDef.id} from localStorage`, e);
        }
    }
    // Merge saved config with defaults, ensuring defaults are present
    return { ...benchmarkDef.defaultConfig, ...parsedConfig };
};

interface UseBenchmarkHookOptions {
    benchmarkDef: BenchmarkDefinition | null; // Pass the whole definition
    iterations: number; // General setting
    maxHistoricalPoints: number; // General setting
    autoRun?: boolean;
    interval?: number;
}

export const useBenchmark = (options: UseBenchmarkHookOptions) => {
    const {
        benchmarkDef,
        iterations,
        maxHistoricalPoints,
        autoRun: initialAutoRun = true,
        interval = 1000,
    } = options;

    // State for the specific config of the *current* benchmark
    const [benchmarkConfig, setBenchmarkConfig] = useState<Record<string, unknown>>({});
    const [results, setResults] = useState<ExtendedBenchmarkResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(initialAutoRun);
    const intervalRef = useRef<number | null>(null);
    const [historicalP99Data, setHistoricalP99Data] = useState<HistoricalP99Data[]>([]);

    // Effect to load config and history when the benchmark definition changes
    useEffect(() => {
        if (benchmarkDef) {
            console.log(`Benchmark changed to: ${benchmarkDef.id}`);
            setBenchmarkConfig(loadBenchmarkConfig(benchmarkDef));
            setHistoricalP99Data(loadHistoricalData(benchmarkDef.id));
            setResults(null); // Clear results when definition changes
        } else {
            // Handle case where no benchmark is selected
            setBenchmarkConfig({});
            setHistoricalP99Data([]);
            setResults(null);
        }
    }, [benchmarkDef]);

    // Effect to save the current benchmark's config when it changes
    useEffect(() => {
        if (benchmarkDef) {
            const storageKey = getConfigStorageKey(benchmarkDef.id);
            localStorage.setItem(storageKey, JSON.stringify(benchmarkConfig));
            console.log(`Saved config for ${benchmarkDef.id}:`, benchmarkConfig);
        }
    }, [benchmarkConfig, benchmarkDef]);

    // Callback to handle changes from a BenchmarkConfigComponent
    const handleBenchmarkConfigChange = useCallback((newConfig: Record<string, unknown>) => {
        setBenchmarkConfig(newConfig);
    }, []);

    // --- Run Benchmark Logic ---
    const handleRunBenchmarks = useCallback(async () => {
        if (loading || !benchmarkDef) return;
        setLoading(true);
        console.log(`Running benchmark: ${benchmarkDef.label} with config:`, benchmarkConfig);
        try {
            const runOptions: BenchmarkRunOptions = {
                iterations,
                config: benchmarkConfig, // Pass the current specific config
            };
            // Call the generic run function from the definition
            const res: ExtendedBenchmarkResults = await benchmarkDef.runBenchmark(runOptions);
            setResults(res);

            // Add to historical data (remains similar)
            const now = new Date().toLocaleTimeString();
            const newData: HistoricalP99Data = { time: now };
            res.implementations.forEach((impl: BenchmarkImplementation) => {
                newData[impl.name] = impl.stats.p99;
            });

            setHistoricalP99Data(prev => {
                const updated = [...prev, newData];
                if (updated.length > maxHistoricalPoints) {
                    return updated.slice(-maxHistoricalPoints);
                }
                return updated;
            });
        } catch (error) {
            console.error(`Error running benchmark ${benchmarkDef.id}:`, error);
            setResults(null); // Clear results on error
        } finally {
            setLoading(false);
        }
        // Dependencies: definition, its config, iterations, loading state
    }, [benchmarkDef, benchmarkConfig, iterations, loading, maxHistoricalPoints]);

    // --- Auto Run Logic (remains similar) ---
    const handleAutoRunToggle = useCallback(() => {
        setAutoRun(prev => !prev);
    }, []);

    useEffect(() => {
        if (autoRun && benchmarkDef) {
            // Only run if a benchmark is selected
            if (intervalRef.current !== null) {
                window.clearInterval(intervalRef.current);
            }
            // Run immediately first time if autoRun is on
            // handleRunBenchmarks(); // Optional: run immediately on toggle/load
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
        // Add benchmarkDef dependency here
    }, [autoRun, handleRunBenchmarks, interval, benchmarkDef]);

    // --- Save History Logic (remains similar, uses benchmark ID) ---
    useEffect(() => {
        if (benchmarkDef) {
            const storageKey = getHistoryStorageKey(benchmarkDef.id);
            localStorage.setItem(storageKey, JSON.stringify(historicalP99Data));
        }
    }, [historicalP99Data, benchmarkDef]);

    return {
        results,
        loading,
        autoRun,
        historicalP99Data,
        benchmarkConfig, // Expose the specific config
        handleRunBenchmarks,
        handleAutoRunToggle,
        handleBenchmarkConfigChange, // Expose the config change handler
    };
};
