import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { FirstDataRenderedEvent } from 'ag-grid-community';
import { BenchmarkGrid } from '@/components/BenchmarkGrid';
import { HistoricalGrid } from '@/components/HistoricalGrid';
import { RowData, BenchmarkImplementation, HistoricalP99Data } from '@/types';
import { BenchmarkType, useBenchmark } from '@/hooks/useBenchmark';
import { useTheme } from '@/hooks/useTheme';
import { Navbar } from '@/components/Navbar';

// Define defaults
const DEFAULT_NUM_MESSAGES = 10000; // Set to 10k
const DEFAULT_ITERATIONS = 100;
const DEFAULT_MAX_HISTORY = 10; // Default for historical points

// LocalStorage key
const CONFIG_STORAGE_KEY = 'benchmarkConfig';

// Function to get initial config from localStorage or defaults
const getInitialConfig = () =>
{
  const savedConfig = localStorage.getItem( CONFIG_STORAGE_KEY );
  if ( savedConfig ) {
    try {
      const parsed = JSON.parse( savedConfig );
      // Basic validation
      return {
        numMessages: typeof parsed.numMessages === 'number' && parsed.numMessages > 0 ? parsed.numMessages : DEFAULT_NUM_MESSAGES,
        iterations: typeof parsed.iterations === 'number' && parsed.iterations > 0 ? parsed.iterations : DEFAULT_ITERATIONS,
        maxHistoricalPoints: typeof parsed.maxHistoricalPoints === 'number' && parsed.maxHistoricalPoints > 0 && parsed.maxHistoricalPoints <= 100 ? parsed.maxHistoricalPoints : DEFAULT_MAX_HISTORY,
      };
    } catch ( e ) {
      console.error( "Failed to parse benchmark config from localStorage", e );
      // Fallback to defaults if parsing fails
    }
  }
  return {
    numMessages: DEFAULT_NUM_MESSAGES,
    iterations: DEFAULT_ITERATIONS,
    maxHistoricalPoints: DEFAULT_MAX_HISTORY,
  };
};

// Define the allowed legend positions
type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

interface BenchmarkTabProps
{
  type: BenchmarkType;
  interval?: number;
}

const DEFAULT_IMPLEMENTATIONS: BenchmarkImplementation[] = [
  {
    name: 'protobufjs',
    label: 'ProtobufJS',
    stats: {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      p99: 0,
      sum: 0,
    }
  },
  {
    name: 'dod',
    label: 'DOD',
    stats: {
      min: 0,
      max: 0,
      mean: 0,
      median: 0,
      p99: 0,
      sum: 0,
    }
  }
];

const getEmptyResults = () => ( {
  implementations: DEFAULT_IMPLEMENTATIONS
} );

const getEmptyHistoricalData = (): HistoricalP99Data =>
{
  const data: HistoricalP99Data = { time: new Date().toLocaleTimeString() };
  DEFAULT_IMPLEMENTATIONS.forEach( impl =>
  {
    data[ impl.name ] = 0;
  } );
  return data;
};

// Calculate throughput needs NUM_MESSAGES, so we pass it now
const calculateThroughput = ( sumMs: number, numMessages: number ): number =>
{
  if ( sumMs === 0 ) return 0;
  return Math.round( ( numMessages / sumMs ) * 1000 ); // Convert ms to seconds
};

export const BenchmarkTab: React.FC<BenchmarkTabProps> = ( { type, interval = 1000 } ) =>
{
  // Initialize state from localStorage or defaults
  const initialConfig = getInitialConfig();
  const [ numMessages, setNumMessages ] = useState( initialConfig.numMessages );
  const [ iterations, setIterations ] = useState( initialConfig.iterations );
  const [ maxHistoricalPoints, setMaxHistoricalPoints ] = useState( initialConfig.maxHistoricalPoints );

  const {
    results,
    loading,
    autoRun,
    historicalP99Data,
    handleRunBenchmarks,
    handleAutoRunToggle,
  } = useBenchmark( { type, numMessages, iterations, maxHistoricalPoints, autoRun: true, interval } );

  const { currentTheme, myTheme, themeMode, cycleTheme } = useTheme();

  const chartContainerRef1 = useRef<HTMLDivElement>( null );
  const chartContainerRef2 = useRef<HTMLDivElement>( null );

  // Update config state when form changes
  const handleConfigChange = useCallback( ( newNumMessages: number, newIterations: number, newMaxHistory: number ) =>
  {
    setNumMessages( newNumMessages );
    setIterations( newIterations );
    setMaxHistoricalPoints( newMaxHistory );
  }, [] );

  // Save config to localStorage whenever it changes
  useEffect( () =>
  {
    const config = { numMessages, iterations, maxHistoricalPoints };
    localStorage.setItem( CONFIG_STORAGE_KEY, JSON.stringify( config ) );
  }, [ numMessages, iterations, maxHistoricalPoints ] );

  // Prepare row data for the pivoted grid.
  const rowData: RowData[] = useMemo( () =>
  {
    const benchmarkResults = type === 'protobuf' ? results : getEmptyResults();
    if ( !benchmarkResults ) return [];

    return benchmarkResults.implementations.map( impl => ( {
      implementation: impl.label,
      min: impl.stats.min,
      max: impl.stats.max,
      mean: impl.stats.mean,
      median: impl.stats.median,
      p99: impl.stats.p99,
      sum: impl.stats.sum,
      throughput: calculateThroughput( impl.stats.sum, numMessages ),
    } ) );
  }, [ results, type, numMessages ] );

  // Adjust chart creation for pivoted data.
  const onFirstDataRendered = useCallback( ( params: FirstDataRenderedEvent ) =>
  {
    params.api.autoSizeAllColumns();
    if ( params.api && chartContainerRef1.current && chartContainerRef2.current ) {
      const currentGridData = rowData; // Use the data already calculated for the grid

      // --- Chart 1: Time Stats (Implementations as categories, Metrics as series) ---
      // Select columns from the grid data to create the side-by-side comparison
      const chart1ThemeOverrides = {
        common: {
          title: {
            enabled: true,
            text: "Benchmark Time Stats (ms)",
          },
          legend: {
            position: "bottom" as LegendPosition,
          },
          padding: {
            top: 20, right: 20, bottom: 20, left: 20,
          },
        },
      };

      params.api.createRangeChart( {
        chartType: 'groupedColumn',
        cellRange: {
          columns: [ "implementation", "min", "max", "mean", "median", "p99" ],
          rowStartIndex: 0,
          rowEndIndex: currentGridData.length - 1,
        },
        chartContainer: chartContainerRef1.current,
        chartThemeOverrides: chart1ThemeOverrides,
      } );

      // --- Chart 2: Throughput --- (Keep as is)
      const chart2ThemeOverrides = {
        common: {
          title: {
            enabled: true,
            text: "Throughput (messages/second)",
          },
          legend: {
            position: "bottom" as LegendPosition,
          },
          padding: {
            top: 20, right: 20, bottom: 20, left: 20,
          },
        },
      };
      params.api.createRangeChart( {
        chartType: "groupedBar",
        cellRange: {
          columns: [ "implementation", "throughput" ],
          rowStartIndex: 0,
          rowEndIndex: currentGridData.length - 1,
        },
        chartContainer: chartContainerRef2.current,
        chartThemeOverrides: chart2ThemeOverrides,
      } );
    }
  }, [ rowData ] );

  const displayHistoricalData = type === 'protobuf' ? historicalP99Data : [ getEmptyHistoricalData() ];

  return (
    <div className="benchmark-tab p-4 space-y-4 flex flex-col h-full">
      <Navbar
        loading={ loading }
        autoRun={ autoRun }
        themeMode={ themeMode }
        onRunBenchmarks={ handleRunBenchmarks }
        onAutoRunToggle={ handleAutoRunToggle }
        onThemeToggle={ cycleTheme }
        showBenchmarkControls={ type === 'protobuf' }
        numMessages={ numMessages }
        iterations={ iterations }
        maxHistoricalPoints={ maxHistoricalPoints }
        onConfigChange={ handleConfigChange }
      />

      <div className="top-section flex flex-grow min-h-0 gap-4">
        <BenchmarkGrid
          rowData={ rowData }
          onGridReady={ type === 'protobuf' ? handleRunBenchmarks : undefined }
          onFirstDataRendered={ onFirstDataRendered }
          theme={ myTheme }
          currentTheme={ currentTheme }
        />
        <div className="charts-container flex flex-col gap-4">
          <div ref={ chartContainerRef1 } className="chart flex-1" />
          <div ref={ chartContainerRef2 } className="chart flex-1" />
        </div>
      </div>

      <div className="bottom-section h-[300px] flex-shrink-0">
        <HistoricalGrid
          rowData={ displayHistoricalData }
          theme={ myTheme }
          currentTheme={ currentTheme }
          implementations={ DEFAULT_IMPLEMENTATIONS }
        />
      </div>
    </div>
  );
}; 