import { useBenchmark } from "@/hooks/useBenchmark";
import { useTheme } from "@/hooks/useTheme";
import
{
    RowData,
    // Remove unused imports
    // BenchmarkImplementation,
    // HistoricalP99Data
} from "../types";
import { FirstDataRenderedEvent, ChartRef } from "ag-grid-community";
import React, { useCallback, useMemo, useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { getBenchmarkDefinitionById } from "@/benchmarks";
import { Navbar } from "@/components/Navbar";
// Import the new section components
import { BenchmarkResultsSection } from "./BenchmarkResultsSection";
import { HistoricalDataSection } from "./HistoricalDataSection";
import { AgGridReact } from "ag-grid-react";

// Default values
const DEFAULT_ITERATIONS = 100;
const DEFAULT_MAX_HISTORY = 10;

// Add localStorage keys
const STORAGE_KEY_ITERATIONS = 'benchmark_iterations';
const STORAGE_KEY_MAX_HISTORY = 'benchmark_max_history';

// Helper functions to get/set localStorage values with defaults
const getStoredValue = ( key: string, defaultValue: number ): number =>
{
    const stored = localStorage.getItem( key );
    if ( stored ) {
        try {
            const value = parseInt( stored, 10 );
            return isNaN( value ) ? defaultValue : value;
        } catch ( e ) {
            console.error( `Error parsing stored value for ${key}`, e );
        }
    }
    return defaultValue;
};

type LegendPosition = "top" | "right" | "bottom" | "left";

const calculateThroughput = ( sumMs: number, itemsProcessed: number ): number =>
{
    if ( sumMs <= 0 || itemsProcessed <= 0 ) return 0;
    // Throughput: items / (total time in seconds)
    return Math.round( itemsProcessed / ( sumMs / 1000 ) );
};

export const BenchmarkTab: React.FC = () =>
{
    const { benchmarkId } = useParams<{ benchmarkId: string; }>();
    const benchmarkDef = useMemo(
        () => ( benchmarkId ? getBenchmarkDefinitionById( benchmarkId ) : null ),
        [ benchmarkId ]
    );

    // Load initial values from localStorage
    const [ iterations, setIterations ] = useState( () =>
        getStoredValue( STORAGE_KEY_ITERATIONS, DEFAULT_ITERATIONS )
    );
    const [ maxHistoricalPoints, setMaxHistoricalPoints ] = useState( () =>
        getStoredValue( STORAGE_KEY_MAX_HISTORY, DEFAULT_MAX_HISTORY )
    );

    const {
        results,
        loading,
        autoRun,
        historicalP99Data,
        benchmarkConfig,
        handleRunBenchmarks,
        handleAutoRunToggle,
        handleBenchmarkConfigChange,
    } = useBenchmark( {
        benchmarkDef: benchmarkDef || null,
        iterations,
        maxHistoricalPoints,
        autoRun: true,
    } );

    const { myTheme, themeMode, cycleTheme } = useTheme();

    const benchmarkGridRef = useRef<AgGridReact>( null );
    const benchmarkChart1Ref = useRef<ChartRef | undefined>( undefined );
    const benchmarkChart2Ref = useRef<ChartRef | undefined>( undefined );

    // Save iterations and maxHistoricalPoints to localStorage whenever they change
    useEffect( () =>
    {
        localStorage.setItem( STORAGE_KEY_ITERATIONS, iterations.toString() );
    }, [ iterations ] );

    useEffect( () =>
    {
        localStorage.setItem( STORAGE_KEY_MAX_HISTORY, maxHistoricalPoints.toString() );
    }, [ maxHistoricalPoints ] );

    const handleGeneralConfigChange = useCallback(
        ( newIterations: number, newMaxHistory: number ) =>
        {
            setIterations( newIterations );
            setMaxHistoricalPoints( newMaxHistory );
            // localStorage persistence is handled in the useEffects above
        },
        []
    );

    // Prepare row data for the BenchmarkGrid (passed to BenchmarkResultsSection)
    const benchmarkRowData: RowData[] = useMemo( () =>
    {
        if ( !results ) return [];

        return results.implementations.map( impl => ( {
            implementation: impl.label,
            min: impl.stats.min,
            max: impl.stats.max,
            mean: impl.stats.mean,
            median: impl.stats.median,
            p99: impl.stats.p99,
            sum: impl.stats.sum,
            // Throughput calculation now uses itemsProcessed from results
            throughput: calculateThroughput( impl.stats.sum, results.itemsProcessed ),
        } ) );
    }, [ results ] );

    // Callback for BenchmarkResultsSection to create charts A & B
    const handleBenchmarkFirstDataRendered = useCallback(
        (
            params: FirstDataRenderedEvent,
            chartContainer1: HTMLDivElement | null,
            chartContainer2: HTMLDivElement | null
        ) =>
        {
            if ( params.api && chartContainer1 && chartContainer2 && benchmarkRowData.length > 0 ) {
                console.log( "BenchmarkTab: Initial chart creation..." );
                chartContainer1.innerHTML = '';
                chartContainer2.innerHTML = '';

                // Chart 1: Time Stats
                const chart1ThemeOverrides = {
                    common: {
                        title: { enabled: true, text: "Benchmark Time Stats (ms)" },
                        legend: { position: "bottom" as LegendPosition },
                    },
                    column: {
                        // Example: Specify series colors if needed
                        // series: { fill: ['#fde047', '#f97316'], strokeWidth: 0 },
                    },
                };
                const chart1 = params.api.createRangeChart( {
                    chartType: "groupedColumn",
                    cellRange: { columns: [ "implementation", "min", "max", "mean", "median", "p99" ] },
                    chartContainer: chartContainer1,
                    chartThemeOverrides: chart1ThemeOverrides,
                } );
                benchmarkChart1Ref.current = chart1;

                // Chart 2: Throughput
                const chart2ThemeOverrides = {
                    common: {
                        title: { enabled: true, text: "Throughput (items/second)" },
                        legend: { position: "bottom" as LegendPosition },
                    },
                };
                const chart2 = params.api.createRangeChart( {
                    chartType: "column",
                    cellRange: { columns: [ "implementation", "throughput" ] },
                    chartContainer: chartContainer2,
                    chartThemeOverrides: chart2ThemeOverrides,
                } );
                benchmarkChart2Ref.current = chart2;
            }
        },
        [ benchmarkRowData ]
    );

    // Effect to UPDATE charts when data changes
    useEffect( () =>
    {
        const gridApi = benchmarkGridRef.current?.api;
        const chart1 = benchmarkChart1Ref.current;
        const chart2 = benchmarkChart2Ref.current;

        if ( gridApi && benchmarkRowData.length > 0 ) {
            console.log( "BenchmarkTab: Updating charts with new data..." );
            const cellRangeParams = {
                rowStartIndex: 0,
                rowEndIndex: benchmarkRowData.length - 1,
            };

            // Update Chart 1 (Time Stats)
            if ( chart1 ) {
                gridApi.updateChart( {
                    chartId: chart1.chartId,
                    type: "rangeChartUpdate",
                    cellRange: {
                        ...cellRangeParams,
                        columns: [ "implementation", "min", "max", "mean", "median", "p99" ],
                    },
                } );
            }
            // Update Chart 2 (Throughput)
            if ( chart2 ) {
                gridApi.updateChart( {
                    chartId: chart2.chartId,
                    type: "rangeChartUpdate",
                    cellRange: {
                        ...cellRangeParams,
                        columns: [ "implementation", "throughput" ],
                    },
                } );
            }
        } else {
            // Optional: Clear charts if data becomes empty
            // if (chart1) gridApi?.destroyChart(chart1.chartId);
            // if (chart2) gridApi?.destroyChart(chart2.chartId);
            // benchmarkChart1Ref.current = null;
            // benchmarkChart2Ref.current = null;
        }

    }, [ benchmarkRowData ] );

    // Callback for HistoricalDataSection (might not be needed if handled internally)
    // const handleHistoricalFirstDataRendered = useCallback(...);

    if ( !benchmarkDef ) {
        return <div>Benchmark with ID '{ benchmarkId }' not found.</div>;
    }

    const ConfigComponent = benchmarkDef.ConfigComponent;

    return (
        <div className="benchmark-tab">
            <Navbar
                iterations={ iterations }
                maxHistoricalPoints={ maxHistoricalPoints }
                onConfigChange={ handleGeneralConfigChange }
                onRunBenchmarks={ handleRunBenchmarks }
                onAutoRunToggle={ handleAutoRunToggle }
                loading={ loading }
                autoRun={ autoRun }
                cycleTheme={ cycleTheme }
                currentTheme={ themeMode }
                ConfigComponent={ ConfigComponent }
                benchmarkConfig={ benchmarkConfig }
                onBenchmarkConfigChange={ handleBenchmarkConfigChange }
            />

            {/* Use the new section components */ }
            <BenchmarkResultsSection
                ref={ benchmarkGridRef }
                rowData={ benchmarkRowData }
                onFirstDataRendered={ handleBenchmarkFirstDataRendered }
                theme={ myTheme }
                currentTheme={ themeMode }
            />

            <HistoricalDataSection
                historicalData={ historicalP99Data }
                // Pass implementations for HistoricalGrid internal use
                implementations={ results?.implementations ?? [] }
                // No onFirstDataRendered needed here
                theme={ myTheme }
                currentTheme={ themeMode }
            />
        </div>
    );
};
