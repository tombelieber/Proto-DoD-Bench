import React from "react";
import { HistoricalGrid } from "@/components/HistoricalGrid";
import { HistoricalP99Data, BenchmarkImplementation } from "../types";
import { Theme } from "ag-grid-community";

interface HistoricalDataSectionProps {
    historicalData: HistoricalP99Data[];
    implementations: BenchmarkImplementation[];
    theme: Theme;
    currentTheme: string;
}

export const HistoricalDataSection: React.FC<HistoricalDataSectionProps> = ({
    historicalData,
    implementations,
    theme,
    currentTheme,
}) => {
    return (
        <div className="benchmark-section layout-row2">
            {" "}
            {/* CSS class for styling */}
            <HistoricalGrid
                rowData={historicalData}
                implementations={implementations}
                theme={theme}
                currentTheme={currentTheme}
            />
        </div>
    );
};
