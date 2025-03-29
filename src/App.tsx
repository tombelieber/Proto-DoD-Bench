import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import {
    ChartRef,
    ColDef,
    colorSchemeDark,
    FirstDataRenderedEvent,
    ModuleRegistry,
    themeAlpine,
    themeBalham,
    themeQuartz,
} from "ag-grid-community";
import {
    AllEnterpriseModule,
    IntegratedChartsModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import "./App.css";
import { runBenchmarks } from "./main"; // Adjust the path accordingly
import { ITERATIONS, NUM_MESSAGES } from "./NUM_MESSAGES";

// Register enterprise modules.
ModuleRegistry.registerModules([
    IntegratedChartsModule.with(AgChartsEnterpriseModule),
    AllEnterpriseModule,
]);

interface BenchmarkStats {
    min: number;
    max: number;
    mean: number;
    median: number;
    p99: number;
    sum: number;
}

interface BenchmarkResults {
    protobufjs: BenchmarkStats;
    dod: BenchmarkStats;
}

interface RowData {
    metric: string;
    protobufjs: number;
    dod: number;
}

interface HistoricalP99Data {
    time: string;
    protobufjs: number;
    dod: number;
}

const MAX_HISTORICAL_DATA_POINTS = 100;

type ThemeMode = "light" | "dark" | "system";

const App: React.FC = () => {
    const [results, setResults] = useState<BenchmarkResults | null>(null);
    const [loading, setLoading] = useState(false);
    const [autoRun, setAutoRun] = useState(true);
    const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
        const savedTheme = localStorage.getItem("themeMode");
        return (savedTheme as ThemeMode) || "system";
    });
    const [historicalP99Data, setHistoricalP99Data] = useState<
        HistoricalP99Data[]
    >([]);

    const currentTheme = useMemo(() => {
        if (themeMode === "system") {
            return window.matchMedia("(prefers-color-scheme: dark)").matches
                ? "dark"
                : "light";
        }
        return themeMode;
    }, [themeMode]);

    const myTheme = useMemo(() => {
        const isDark = currentTheme === "dark";
        return isDark ? themeBalham.withPart(colorSchemeDark) : themeBalham;
    }, [currentTheme]);

    const chartContainerRef1 = useRef<HTMLDivElement>(null);
    const chartContainerRef2 = useRef<HTMLDivElement>(null);
    const chartContainerRef3 = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<number | null>(null);
    const historicalGridRef = useRef<AgGridReact>(null);

    // Theme effect
    useEffect(() => {
        const updateTheme = () => {
            if (themeMode === "system") {
                const systemDark = window.matchMedia(
                    "(prefers-color-scheme: dark)",
                ).matches;
                document.documentElement.setAttribute(
                    "data-theme",
                    systemDark ? "dark" : "light",
                );
            } else {
                document.documentElement.setAttribute("data-theme", themeMode);
            }
        };

        // Initial theme setup
        updateTheme();

        // Listen for system theme changes
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
        const handleChange = () => {
            if (themeMode === "system") {
                updateTheme();
            }
        };

        mediaQuery.addEventListener("change", handleChange);
        return () => mediaQuery.removeEventListener("change", handleChange);
    }, [themeMode]);

    // Save theme preference
    useEffect(() => {
        localStorage.setItem("themeMode", themeMode);
    }, [themeMode]);

    const cycleTheme = () => {
        setThemeMode((prev) => {
            switch (prev) {
                case "light":
                    return "dark";
                case "dark":
                    return "system";
                case "system":
                    return "light";
                default:
                    return "system";
            }
        });
    };

    const handleRunBenchmarks = async () => {
        setLoading(true);
        const res: BenchmarkResults = await runBenchmarks();
        setResults(res);

        // Update historical data
        const now = new Date().toLocaleTimeString();
        const newData: HistoricalP99Data = {
            time: now,
            protobufjs: res.protobufjs.p99,
            dod: res.dod.p99,
        };

        setHistoricalP99Data((prev) => {
            const updated = [...prev, newData];
            if (updated.length > MAX_HISTORICAL_DATA_POINTS) {
                return updated.slice(-MAX_HISTORICAL_DATA_POINTS);
            }
            return updated;
        });

        setLoading(false);
    };

    // Handle auto-run toggle
    const handleAutoRunToggle = () => {
        setAutoRun((prev) => !prev);
    };

    // Cleanup interval on unmount
    useEffect(() => {
        if (autoRun) {
            // Start auto-running
            intervalRef.current = window.setInterval(handleRunBenchmarks, 1000);
        } else {
            // Stop auto-running
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
    }, [autoRun]);

    // Prepare row data as numbers.
    const rowData: RowData[] = useMemo(() => {
        if (!results) return [];
        return [
            {
                metric: "Min",
                protobufjs: results.protobufjs.min,
                dod: results.dod.min,
            },
            {
                metric: "Max",
                protobufjs: results.protobufjs.max,
                dod: results.dod.max,
            },
            {
                metric: "Mean",
                protobufjs: results.protobufjs.mean,
                dod: results.dod.mean,
            },
            {
                metric: "Median (p50)",
                protobufjs: results.protobufjs.median,
                dod: results.dod.median,
            },
            {
                metric: "p99",
                protobufjs: results.protobufjs.p99,
                dod: results.dod.p99,
            },
            {
                metric: "Sum",
                protobufjs: results.protobufjs.sum,
                dod: results.dod.sum,
            },
        ];
    }, [results]);

    // Define column definitions.
    const columnDefs: ColDef<RowData>[] = useMemo(
        () => [
            { headerName: "Metric", field: "metric", flex: 1 },
            {
                headerName: "ProtobufJS (ms)",
                field: "protobufjs",
                type: "numericColumn",
                flex: 1,
            },
            {
                headerName: "DOD (ms)",
                field: "dod",
                type: "numericColumn",
                flex: 1,
            },
        ],
        [],
    );

    // Optional default column definitions.
    const defaultColDef: ColDef = useMemo(
        () => ({
            enableValue: true,
            sortable: true,
            filter: true,
            resizable: true,
        }),
        [],
    );

    // Capture grid API.
    const onGridReady = useCallback(() => {
        handleRunBenchmarks();
    }, []);

    // When grid data is rendered, automatically create charts.
    const onFirstDataRendered = useCallback(
        (params: FirstDataRenderedEvent) => {
            if (
                params.api &&
                chartContainerRef1.current &&
                chartContainerRef2.current
            ) {
                // Chart 1: rows 0-4 (all metrics except "Sum")
                params.api.createRangeChart({
                    chartType: "groupedColumn",
                    cellRange: {
                        columns: ["metric", "protobufjs", "dod"],
                        rowStartIndex: 0,
                        rowEndIndex: 4,
                    },
                    chartThemeOverrides: {
                        common: {
                            title: {
                                enabled: true,
                                text: "Benchmark Stats (ms) - Metrics",
                            },
                            legend: {
                                position: "bottom",
                            },
                            padding: {
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            },
                        },
                    },
                    chartContainer: chartContainerRef1.current,
                });

                // Chart 2: row 5 ("Sum")
                params.api.createRangeChart({
                    chartType: "groupedColumn",
                    cellRange: {
                        columns: ["metric", "protobufjs", "dod"],
                        rowStartIndex: 5,
                        rowEndIndex: 5,
                    },
                    chartThemeOverrides: {
                        common: {
                            title: {
                                enabled: true,
                                text: "Benchmark Stats (ms) - Sum",
                            },
                            legend: {
                                position: "bottom",
                            },
                            padding: {
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            },
                        },
                    },
                    chartContainer: chartContainerRef2.current,
                });
            }
        },
        [],
    );

    // Historical grid column definitions
    const historicalColumnDefs: ColDef<HistoricalP99Data>[] = useMemo(
        () => [
            {
                headerName: "Time",
                field: "time",
                flex: 1,
                sort: "desc",
            },
            {
                headerName: "DOD p99 metrics(ms)",
                field: "dod",
                type: "numericColumn",
                flex: 1,
            },
            {
                headerName: "ProtobufJS p99 metrics(ms)",
                field: "protobufjs",
                type: "numericColumn",
                flex: 1,
            },
        ],
        [],
    );

    // Historical grid default column definitions
    const historicalDefaultColDef: ColDef = useMemo(
        () => ({
            enableValue: true,
            sortable: true,
            filter: true,
            resizable: true,
        }),
        [],
    );

    const lineChartRef = useRef<ChartRef>(undefined);
    // When historical grid data is rendered, create the line chart
    const onHistoricalDataRendered = useCallback(
        (params: FirstDataRenderedEvent) => {
            if (params.api && chartContainerRef3.current) {
                lineChartRef.current = params.api.createRangeChart({
                    chartType: "line",
                    cellRange: {
                        columns: ["time", "protobufjs", "dod"],
                        rowStartIndex: 0,
                        rowEndIndex: historicalP99Data.length - 1,
                    },
                    chartThemeOverrides: {
                        common: {
                            title: {
                                enabled: true,
                                text: "p99 metrics",
                            },
                            legend: {
                                position: "bottom",
                            },
                            padding: {
                                top: 20,
                                right: 20,
                                bottom: 20,
                                left: 20,
                            },
                        },
                    },
                    chartContainer: chartContainerRef3.current,
                });
            }
        },
        [historicalP99Data],
    );

    // Update grid data when historical data changes
    useEffect(() => {
        if (historicalGridRef.current?.api) {
            historicalGridRef.current.api.applyTransaction({
                update: historicalP99Data,
            });
            // * update chart cellRange
            if (lineChartRef.current) {
                historicalGridRef.current.api.updateChart({
                    chartId: lineChartRef.current.chartId,
                    type: "rangeChartUpdate",
                    cellRange: {
                        rowStartIndex: 0,
                        rowEndIndex: historicalP99Data.length - 1,
                    },
                });
            }
        }
    }, [historicalP99Data]);

    return (
        <div className="app-container">
            <nav className="navbar">
                <div className="navbar-left">
                    <div className="navbar-title">
                        <h1>Data Oriented Protobuf Decoding Benchmark</h1>
                        <h3>
                            NUM_MESSAGES={NUM_MESSAGES}, ITERATIONS={ITERATIONS}
                        </h3>
                        <p>
                            This benchmark compares the performance of a DOD
                            (Structure-of-Array) decoder vs. a standard
                            ProtobufJS decoder.
                        </p>
                    </div>
                </div>
                <div className="navbar-buttons">
                    <button
                        className="run-button"
                        onClick={handleRunBenchmarks}
                        disabled={loading}
                    >
                        {loading ? "Running Benchmarks..." : "Run Benchmarks"}
                    </button>
                    <button
                        className={`auto-run-button ${autoRun ? "active" : ""}`}
                        onClick={handleAutoRunToggle}
                        disabled={loading}
                    >
                        {autoRun ? "Stop Auto-Run" : "Start Auto-Run"}
                    </button>
                    <button
                        className="theme-toggle"
                        onClick={cycleTheme}
                        title={`Current theme: ${themeMode} (click to cycle)`}
                    >
                        {themeMode === "light"
                            ? "☀️"
                            : themeMode === "dark"
                            ? "🌙"
                            : "💻"}
                    </button>
                </div>
            </nav>

            <main className="main-content">
                <div className="top-section">
                    <div
                        className={`grid-container ag-theme-${
                            currentTheme === "dark" ? "dark" : "alpine"
                        }`}
                    >
                        <AgGridReact
                            rowData={rowData}
                            columnDefs={columnDefs}
                            defaultColDef={defaultColDef}
                            enableRangeSelection={true}
                            enableCharts={true}
                            onGridReady={onGridReady}
                            onFirstDataRendered={onFirstDataRendered}
                            theme={myTheme}
                            chartThemes={[
                                currentTheme === "dark"
                                    ? "ag-vivid-dark"
                                    : "ag-vivid",
                            ]}
                        />
                    </div>
                    <div className="charts-container">
                        <div ref={chartContainerRef1} className="chart" />
                        <div ref={chartContainerRef2} className="chart" />
                    </div>
                </div>

                <div className="bottom-section">
                    <div
                        className={`grid-container ag-theme-${
                            currentTheme === "dark" ? "dark" : "alpine"
                        }`}
                    >
                        <AgGridReact
                            ref={historicalGridRef}
                            rowData={historicalP99Data}
                            columnDefs={historicalColumnDefs}
                            defaultColDef={historicalDefaultColDef}
                            enableRangeSelection={true}
                            enableCharts={true}
                            onFirstDataRendered={onHistoricalDataRendered}
                            theme={myTheme}
                            chartThemes={[
                                currentTheme === "dark"
                                    ? "ag-vivid-dark"
                                    : "ag-vivid",
                            ]}
                        />
                    </div>
                    <div ref={chartContainerRef3} className="chart" />
                </div>
            </main>
        </div>
    );
};

export default App;
