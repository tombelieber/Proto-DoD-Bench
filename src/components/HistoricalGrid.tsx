import { useCallback, useEffect, useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import {
    ChartRef,
    ColDef,
    FirstDataRenderedEvent,
    Theme,
    ValueFormatterParams,
} from "ag-grid-community";
import { HistoricalP99Data, BenchmarkImplementation } from "../types";

// Add status bar CSS import
// import 'ag-grid-enterprise/styles/ag-status-bar.css';

interface HistoricalGridProps {
    rowData: HistoricalP99Data[];
    theme: Theme;
    currentTheme: string;
    implementations: BenchmarkImplementation[];
}

export const HistoricalGrid: React.FC<HistoricalGridProps> = ({
    rowData,
    theme,
    currentTheme,
    implementations,
}) => {
    const gridRef = useRef<AgGridReact>(null);
    const chartContainerRef3 = useRef<HTMLDivElement>(null);
    const columnDefs: ColDef<HistoricalP99Data>[] = useMemo(
        () => [
            { headerName: "Time", field: "time", flex: 1 },
            ...(Array.isArray(implementations)
                ? implementations.map(impl => ({
                      headerName: `${impl.label} p99 (ms)`,
                      field: impl.name,
                      type: "numericColumn",
                      flex: 1,
                      valueFormatter: (params: ValueFormatterParams) =>
                          typeof params.value === "number" ? params.value.toFixed(2) : "",
                  }))
                : []),
        ],
        [implementations]
    );

    const lineChartRef = useRef<ChartRef>(undefined);

    const defaultColDef: ColDef = useMemo(
        () => ({
            sortable: true,
            filter: true,
            resizable: true,
        }),
        []
    );

    // Add status bar config
    const statusBar = useMemo(() => {
        return {
            statusPanels: [
                {
                    statusPanel: "agTotalRowCountComponent",
                    align: "left",
                },
            ],
        };
    }, []);

    // Update grid data when historical data changes
    useEffect(() => {
        if (gridRef.current?.api) {
            gridRef.current.api.applyTransaction({
                update: rowData,
            });
            // * update chart cellRange
            if (lineChartRef.current) {
                gridRef.current.api.updateChart({
                    chartId: lineChartRef.current.chartId,
                    type: "rangeChartUpdate",
                    cellRange: {
                        rowStartIndex: 0,
                        rowEndIndex: rowData.length - 1,
                    },
                });
            }
        }
    }, [rowData]);

    // When historical grid data is rendered, create the line chart
    const onFirstDataRendered = useCallback(
        (params: FirstDataRenderedEvent) => {
            console.log(
                "HistoricalGrid onFirstDataRendered called. Implementations:",
                implementations
            );

            // Only create chart if we have the necessary elements and data
            if (
                params.api &&
                chartContainerRef3.current &&
                Array.isArray(implementations) &&
                implementations.length > 0 &&
                rowData.length > 0 // Ensure we have data points
            ) {
                try {
                    console.log("HistoricalGrid: Creating chart...");

                    // Clear any existing chart
                    chartContainerRef3.current.innerHTML = "";

                    // Make sure we have valid columns
                    const validColumns = [
                        "time",
                        ...implementations
                            .filter(impl => impl && impl.name) // Filter out any undefined implementations
                            .map(impl => impl.name),
                    ];

                    lineChartRef.current = params.api.createRangeChart({
                        chartType: "area",
                        cellRange: {
                            columns: validColumns,
                            rowStartIndex: 0,
                            rowEndIndex: Math.max(0, rowData.length - 1),
                        },
                        chartThemeOverrides: {
                            common: {
                                title: {
                                    enabled: true,
                                    text: "p99 metrics over time",
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

                    console.log("HistoricalGrid: Chart successfully created");
                } catch (error) {
                    console.error("Error creating historical chart:", error);
                    // Clear the chart container on error
                    if (chartContainerRef3.current) {
                        chartContainerRef3.current.innerHTML = "";
                    }
                    lineChartRef.current = undefined;
                }
            } else {
                console.log(
                    "HistoricalGrid: Not creating chart due to missing data or implementations"
                );
            }
        },
        [chartContainerRef3, rowData, implementations]
    );

    // Update grid data when historical data changes
    useEffect(() => {
        if (gridRef.current?.api) {
            // Update the grid data
            gridRef.current.api.applyTransaction({
                update: rowData,
            });

            // Only update chart if we have both the chart reference and data
            if (lineChartRef.current && rowData.length > 0 && implementations.length > 0) {
                try {
                    console.log("HistoricalGrid: Updating chart with new data...", {
                        chartId: lineChartRef.current.chartId,
                        rowCount: rowData.length,
                    });

                    // Make sure we have valid column data
                    const validColumns = [
                        "time",
                        ...implementations
                            .filter(impl => impl && impl.name) // Filter out any undefined implementations
                            .map(impl => impl.name),
                    ];

                    gridRef.current.api.updateChart({
                        chartId: lineChartRef.current.chartId,
                        type: "rangeChartUpdate",
                        cellRange: {
                            columns: validColumns,
                            rowStartIndex: 0,
                            rowEndIndex: Math.max(0, rowData.length - 1),
                        },
                    });
                } catch (error) {
                    console.error("Error updating historical chart:", error);
                    // If updating fails, recreate the chart
                    if (chartContainerRef3.current && gridRef.current.api) {
                        chartContainerRef3.current.innerHTML = "";
                        onFirstDataRendered({ api: gridRef.current.api } as FirstDataRenderedEvent);
                    }
                }
            }
        }
    }, [rowData, implementations, onFirstDataRendered]);

    return (
        <>
            <div
                className={`grid-container ag-theme-${currentTheme === "dark" ? "dark" : "alpine"}`}
            >
                <AgGridReact
                    ref={gridRef}
                    rowData={rowData}
                    columnDefs={columnDefs}
                    defaultColDef={defaultColDef}
                    enableCharts={true}
                    cellSelection
                    onFirstDataRendered={onFirstDataRendered}
                    theme={theme}
                    chartThemes={[currentTheme === "dark" ? "ag-vivid-dark" : "ag-vivid"]}
                    statusBar={statusBar}
                />
            </div>
            <div ref={chartContainerRef3} className="chart" />
        </>
    );
};
