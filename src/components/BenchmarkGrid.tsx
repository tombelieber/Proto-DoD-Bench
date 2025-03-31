import { useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef, FirstDataRenderedEvent, Theme, ValueFormatterParams } from "ag-grid-community";
import { RowData } from "../types";

interface BenchmarkGridProps
{
    rowData: RowData[];
    onGridReady?: () => void;
    onFirstDataRendered: ( params: FirstDataRenderedEvent ) => void;
    theme: Theme;
    currentTheme: string;
}

const formatNumber = ( value: number, isThroughput: boolean = false ) =>
{
    if ( isThroughput ) {
        return value.toLocaleString( 'en-US' );
    }
    return value.toFixed( 2 );
};

export const BenchmarkGrid: React.FC<BenchmarkGridProps> = ( {
    rowData,
    onGridReady = () => { },
    onFirstDataRendered,
    theme,
    currentTheme,
} ) =>
{
    const columnDefs: ColDef<RowData>[] = useMemo(
        () => [
            { headerName: "Implementation", field: "implementation", flex: 1.5, pinned: 'left' },
            {
                headerName: "Min (ms)", field: "min", type: "numericColumn", flex: 1,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value )
            },
            {
                headerName: "Max (ms)", field: "max", type: "numericColumn", flex: 1,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value )
            },
            {
                headerName: "Mean (ms)", field: "mean", type: "numericColumn", flex: 1,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value )
            },
            {
                headerName: "Median (ms)", field: "median", type: "numericColumn", flex: 1,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value )
            },
            {
                headerName: "p99 (ms)", field: "p99", type: "numericColumn", flex: 1,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value )
            },
            {
                headerName: "Sum (ms)", field: "sum", type: "numericColumn", flex: 1,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value )
            },
            {
                headerName: "Throughput (msg/s)", field: "throughput", type: "numericColumn", flex: 1.2,
                valueFormatter: ( params: ValueFormatterParams ) => formatNumber( params.value, true )
            },
        ],
        []
    );

    const defaultColDef: ColDef = useMemo(
        () => ( {
            enableValue: true,
            sortable: true,
            filter: true,
            resizable: true,
        } ),
        []
    );

    return (
        <div className={ `grid-container ag-theme-${currentTheme === "dark" ? "dark" : "alpine"}` }>
            <AgGridReact
                rowData={ rowData }
                columnDefs={ columnDefs }
                defaultColDef={ defaultColDef }
                enableRangeSelection={ true }
                enableCharts={ true }
                onGridReady={ onGridReady }
                onFirstDataRendered={ onFirstDataRendered }
                theme={ theme }
                chartThemes={ [ currentTheme === "dark" ? "ag-vivid-dark" : "ag-vivid" ] }
            />
        </div>
    );
};
