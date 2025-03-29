import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import {
    ColDef,
    FirstDataRenderedEvent,
    ModuleRegistry,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
    AllEnterpriseModule,
    IntegratedChartsModule,
} from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import React, { useCallback, useMemo, useRef, useState } from "react";
import { runBenchmarks } from "./main"; // Adjust the path accordingly

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

const App: React.FC = () => {
    const [results, setResults] = useState<BenchmarkResults | null>(null);
    const [loading, setLoading] = useState(false);
    const chartContainerRef1 = useRef<HTMLDivElement>(null);
    const chartContainerRef2 = useRef<HTMLDivElement>(null);

    const handleRunBenchmarks = async () => {
        setLoading(true);
        // runBenchmarks should return: { protobufjs: { ...numbers }, dod: { ...numbers } }
        const res: BenchmarkResults = await runBenchmarks();
        setResults(res);
        setLoading(false);
    };

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
                        },
                        cartesian: {
                            axes: { category: { label: { rotation: 45 } } },
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
                        },
                        cartesian: {
                            axes: { category: { label: { rotation: 45 } } },
                        },
                    },
                    chartContainer: chartContainerRef2.current,
                });
            }
        },
        [],
    );

    return (
        <div
            style={{
                height: "95vh",
                width: "95vw",
                display: "flex",
                flexDirection: "column",
            }}
        >
            <header style={{ padding: "1rem" }}>
                <h1>Data Oriented Protobuf Decoding Benchmark</h1>
                <p>
                    This benchmark compares the performance of a DOD
                    (Structure-of-Array) decoder vs. a standard ProtobufJS
                    decoder.
                </p>
                <button
                    style={{ background: "#5090DC" }}
                    onClick={handleRunBenchmarks}
                    disabled={loading}
                >
                    {loading ? "Running Benchmarks..." : "Run Benchmarks"}
                </button>
            </header>
            <div style={{ flex: 1, display: "flex" }}>
                {/* Left column: AgGrid takes full height */}
                <div className="ag-theme-alpine" style={{ flex: 1 }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        enableRangeSelection={true}
                        enableCharts={true}
                        onGridReady={onGridReady}
                        onFirstDataRendered={onFirstDataRendered}
                    />
                </div>
                {/* Right column: Chart containers stacked vertically */}
                <div
                    style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                    }}
                >
                    <div
                        ref={chartContainerRef1}
                        style={{
                            flex: 1,
                            width: "100%",
                            border: "1px solid #ccc",
                            marginBottom: "1rem",
                        }}
                    />
                    <div
                        ref={chartContainerRef2}
                        style={{
                            flex: 1,
                            width: "100%",
                            border: "1px solid #ccc",
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default App;
