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
            ...implementations.map(impl => ({
                headerName: `${impl.label} p99 (ms)`,
                field: impl.name,
                type: "numericColumn",
                flex: 1,
                valueFormatter: (params: ValueFormatterParams) => params.value.toFixed(2),
            })),
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
            if (params.api && chartContainerRef3.current) {
                lineChartRef.current = params.api.createRangeChart({
                    chartType: "area",
                    cellRange: {
                        columns: ["time", ...implementations.map(impl => impl.name)],
                        rowStartIndex: 0,
                        rowEndIndex: rowData.length - 1,
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
            }
        },
        [chartContainerRef3, rowData, implementations]
    );

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
