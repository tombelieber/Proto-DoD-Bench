import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, FirstDataRenderedEvent, Theme } from "ag-grid-community";
import { RowData } from "../types";

interface BenchmarkGridProps {
    rowData: RowData[];
    onGridReady: () => void;
    onFirstDataRendered: (params: FirstDataRenderedEvent) => void;
    theme: Theme;
    currentTheme: string;
}

export const BenchmarkGrid: React.FC<BenchmarkGridProps> = ({
    rowData,
    onGridReady,
    onFirstDataRendered,
    theme,
    currentTheme,
}) => {
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

    const defaultColDef: ColDef = useMemo(
        () => ({
            enableValue: true,
            sortable: true,
            filter: true,
            resizable: true,
        }),
        [],
    );

    return (
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
                theme={theme}
                chartThemes={[
                    currentTheme === "dark" ? "ag-vivid-dark" : "ag-vivid",
                ]}
            />
        </div>
    );
};
