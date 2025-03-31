import React, { useRef, forwardRef } from "react";
import { BenchmarkGrid } from "@/components/BenchmarkGrid";
import { RowData } from "@/types";
import { FirstDataRenderedEvent, Theme } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";

interface BenchmarkResultsSectionProps {
    rowData: RowData[];
    onFirstDataRendered: (
        params: FirstDataRenderedEvent,
        chartContainer1: HTMLDivElement | null,
        chartContainer2: HTMLDivElement | null
    ) => void;
    theme: Theme;
    currentTheme: string;
}

export const BenchmarkResultsSection = forwardRef<AgGridReact, BenchmarkResultsSectionProps>(
    ({ rowData, onFirstDataRendered, theme, currentTheme }, ref) => {
        const chartContainerRef1 = useRef<HTMLDivElement>(null);
        const chartContainerRef2 = useRef<HTMLDivElement>(null);

        const handleFirstDataRendered = (params: FirstDataRenderedEvent) => {
            onFirstDataRendered(params, chartContainerRef1.current, chartContainerRef2.current);
        };

        return (
            <div className="benchmark-section layout-row1">
                <BenchmarkGrid
                    ref={ref}
                    rowData={rowData}
                    onFirstDataRendered={handleFirstDataRendered}
                    theme={theme}
                    currentTheme={currentTheme}
                />
                <div className="charts-column">
                    <div ref={chartContainerRef1} className="chart"></div>
                    <div ref={chartContainerRef2} className="chart"></div>
                </div>
            </div>
        );
    }
);

BenchmarkResultsSection.displayName = "BenchmarkResultsSection";
