import React, { useRef } from "react";
import { BenchmarkGrid } from "@/components/BenchmarkGrid";
import { RowData } from "@/types";
import { FirstDataRenderedEvent, Theme } from "ag-grid-community";

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

export const BenchmarkResultsSection: React.FC<BenchmarkResultsSectionProps> = ({
    rowData,
    onFirstDataRendered,
    theme,
    currentTheme,
}) => {
    const chartContainerRef1 = useRef<HTMLDivElement>(null);
    const chartContainerRef2 = useRef<HTMLDivElement>(null);

    // Wrapper for onFirstDataRendered to pass refs
    const handleFirstDataRendered = (params: FirstDataRenderedEvent) => {
        onFirstDataRendered(params, chartContainerRef1.current, chartContainerRef2.current);
    };

    return (
        <div className="benchmark-section layout-row1">
            {/* Container for Grid A */}
            <BenchmarkGrid
                rowData={rowData}
                onFirstDataRendered={handleFirstDataRendered}
                theme={theme}
                currentTheme={currentTheme}
            />

            <div className="charts-column">
                {/* Container for stacked charts A & B */}
                <div ref={chartContainerRef1} className="chart"></div>
                <div ref={chartContainerRef2} className="chart"></div>
            </div>
        </div>
    );
};
