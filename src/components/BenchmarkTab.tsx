import { useBenchmark } from "@/hooks/useBenchmark";
import { useTheme } from "@/hooks/useTheme";
import {
    RowData,
    // Remove unused imports
    // BenchmarkImplementation,
    // HistoricalP99Data
} from "../types";
import { FirstDataRenderedEvent /* Removed GridApi, Theme */ } from "ag-grid-community";
import React, { useCallback, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { getBenchmarkDefinitionById } from "@/benchmarks";
import { Navbar } from "@/components/Navbar";
// Import the new section components
import { BenchmarkResultsSection } from "./BenchmarkResultsSection";
import { HistoricalDataSection } from "./HistoricalDataSection";

// Default values
const DEFAULT_ITERATIONS = 100;
const DEFAULT_MAX_HISTORY = 10;

type LegendPosition = "top" | "right" | "bottom" | "left";

const calculateThroughput = (sumMs: number, itemsProcessed: number): number => {
    if (sumMs <= 0 || itemsProcessed <= 0) return 0;
    // Throughput: items / (total time in seconds)
    return Math.round(itemsProcessed / (sumMs / 1000));
};

export const BenchmarkTab: React.FC = () => {
    const { benchmarkId } = useParams<{ benchmarkId: string }>();
    const benchmarkDef = useMemo(
        () => (benchmarkId ? getBenchmarkDefinitionById(benchmarkId) : null),
        [benchmarkId]
    );

    const [iterations, setIterations] = useState(DEFAULT_ITERATIONS);
    const [maxHistoricalPoints, setMaxHistoricalPoints] = useState(DEFAULT_MAX_HISTORY);

    const {
        results,
        loading,
        autoRun,
        historicalP99Data,
        benchmarkConfig,
        handleRunBenchmarks,
        handleAutoRunToggle,
        handleBenchmarkConfigChange,
    } = useBenchmark({
        benchmarkDef: benchmarkDef || null,
        iterations,
        maxHistoricalPoints,
        autoRun: true,
    });

    const { myTheme, themeMode, cycleTheme } = useTheme();

    const handleGeneralConfigChange = useCallback(
        (newIterations: number, newMaxHistory: number) => {
            setIterations(newIterations);
            setMaxHistoricalPoints(newMaxHistory);
            // Persist these general settings if needed (e.g., to localStorage)
        },
        []
    );

    // Prepare row data for the BenchmarkGrid (passed to BenchmarkResultsSection)
    const benchmarkRowData: RowData[] = useMemo(() => {
        if (!results) return [];

        return results.implementations.map(impl => ({
            implementation: impl.label,
            min: impl.stats.min,
            max: impl.stats.max,
            mean: impl.stats.mean,
            median: impl.stats.median,
            p99: impl.stats.p99,
            sum: impl.stats.sum,
            // Throughput calculation now uses itemsProcessed from results
            throughput: calculateThroughput(impl.stats.sum, results.itemsProcessed),
        }));
    }, [results]);

    // Callback for BenchmarkResultsSection to create charts A & B
    const handleBenchmarkFirstDataRendered = useCallback(
        (
            params: FirstDataRenderedEvent,
            chartContainer1: HTMLDivElement | null, // Receive refs from section
            chartContainer2: HTMLDivElement | null
        ) => {
            // Check if refs and data are available
            if (params.api && chartContainer1 && chartContainer2 && benchmarkRowData.length > 0) {
                // Clear previous charts
                chartContainer1.innerHTML = "";
                chartContainer2.innerHTML = "";

                // --- Chart 1: Time Stats ---
                const chart1ThemeOverrides = {
                    common: {
                        title: { enabled: true, text: "Benchmark Time Stats (ms)" },
                        legend: { position: "bottom" as LegendPosition }, // Cast needed here
                    },
                    column: {
                        // Example: Specify series colors if needed
                        // series: { fill: ['#fde047', '#f97316'], strokeWidth: 0 },
                    },
                };
                params.api.createRangeChart({
                    chartType: "groupedColumn",
                    cellRange: {
                        columns: ["implementation", "min", "max", "mean", "median", "p99"],
                    },
                    chartContainer: chartContainer1,
                    chartThemeOverrides: chart1ThemeOverrides,
                });

                // --- Chart 2: Throughput ---
                const chart2ThemeOverrides = {
                    common: {
                        title: { enabled: true, text: "Throughput (items/second)" },
                        legend: { position: "bottom" as LegendPosition }, // Cast needed here
                    },
                };
                params.api.createRangeChart({
                    chartType: "column",
                    cellRange: { columns: ["implementation", "throughput"] },
                    chartContainer: chartContainer2,
                    chartThemeOverrides: chart2ThemeOverrides,
                });
            }
        },
        [benchmarkRowData] // Depends on the benchmark row data
    );

    // Callback for HistoricalDataSection (might not be needed if handled internally)
    // const handleHistoricalFirstDataRendered = useCallback(...);

    if (!benchmarkDef) {
        return <div>Benchmark with ID '{benchmarkId}' not found.</div>;
    }

    const ConfigComponent = benchmarkDef.ConfigComponent;

    return (
        <div className="benchmark-tab">
            <Navbar
                iterations={iterations}
                maxHistoricalPoints={maxHistoricalPoints}
                onConfigChange={handleGeneralConfigChange}
                onRunBenchmarks={handleRunBenchmarks}
                onAutoRunToggle={handleAutoRunToggle}
                loading={loading}
                autoRun={autoRun}
                cycleTheme={cycleTheme}
                currentTheme={themeMode}
                ConfigComponent={ConfigComponent}
                benchmarkConfig={benchmarkConfig}
                onBenchmarkConfigChange={handleBenchmarkConfigChange}
            />

            {/* Use the new section components */}
            <BenchmarkResultsSection
                rowData={benchmarkRowData}
                onFirstDataRendered={handleBenchmarkFirstDataRendered}
                theme={myTheme}
                currentTheme={themeMode}
            />

            <HistoricalDataSection
                historicalData={historicalP99Data}
                // Pass implementations for HistoricalGrid internal use
                implementations={results?.implementations ?? []}
                // No onFirstDataRendered needed here
                theme={myTheme}
                currentTheme={themeMode}
            />
        </div>
    );
};
