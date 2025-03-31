import React, { useRef, useCallback, useMemo } from 'react';
import { FirstDataRenderedEvent } from 'ag-grid-community';
import { BenchmarkGrid } from './BenchmarkGrid';
import { HistoricalGrid } from './HistoricalGrid';
import { RowData, BenchmarkImplementation, HistoricalP99Data } from '../types';
import { useBenchmark } from '../hooks/useBenchmark';
import { BenchmarkType } from '../main';
import { useTheme } from '../hooks/useTheme';
import { Navbar } from './Navbar';
import { NUM_MESSAGES } from '../NUM_MESSAGES';

// Define the allowed legend positions
type LegendPosition = 'top' | 'right' | 'bottom' | 'left';

interface BenchmarkTabProps
{
  type: BenchmarkType;
  autoRun?: boolean;
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

// Calculate throughput in messages per second
const calculateThroughput = ( sumMs: number ) =>
{
  if ( sumMs === 0 ) return 0;
  return Math.round( ( NUM_MESSAGES / sumMs ) * 1000 ); // Convert ms to seconds
};

export const BenchmarkTab: React.FC<BenchmarkTabProps> = ( { type, autoRun = true, interval = 1000 } ) =>
{
  const {
    results,
    loading,
    autoRun: isAutoRunning,
    historicalP99Data,
    handleRunBenchmarks,
    handleAutoRunToggle,
  } = useBenchmark( { type, autoRun, interval } );

  const { currentTheme, myTheme, themeMode, cycleTheme } = useTheme();

  const chartContainerRef1 = useRef<HTMLDivElement>( null );
  const chartContainerRef2 = useRef<HTMLDivElement>( null );

  // Prepare row data for the pivoted grid.
  const rowData: RowData[] = useMemo( () =>
  {
    const benchmarkResults = type === 'protobuf' ? results : getEmptyResults();
    if ( !benchmarkResults ) return [];

    return benchmarkResults.implementations.map( impl => ( {
      implementation: impl.label, // Use the label for display
      min: impl.stats.min,
      max: impl.stats.max,
      mean: impl.stats.mean,
      median: impl.stats.median,
      p99: impl.stats.p99,
      sum: impl.stats.sum,
      throughput: calculateThroughput( impl.stats.sum ),
    } ) );
  }, [ results, type ] );

  // Adjust chart creation for pivoted data.
  const onFirstDataRendered = useCallback( ( params: FirstDataRenderedEvent ) =>
  {
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
          // Select the implementation column and the metric columns
          columns: [ "implementation", "min", "max", "mean", "median", "p99" ],
          rowStartIndex: 0,
          rowEndIndex: currentGridData.length - 1,
        },
        chartContainer: chartContainerRef1.current,
        chartThemeOverrides: chart1ThemeOverrides,
        // AG Grid automatically groups by the first column ('implementation')
        // and creates series for the other selected columns ('min', 'max', etc.)
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
  }, [ results, type, rowData ] );

  const displayHistoricalData = type === 'protobuf' ? historicalP99Data : [ getEmptyHistoricalData() ];

  return (
    <div className="benchmark-tab">
      <Navbar
        loading={ loading }
        autoRun={ isAutoRunning }
        themeMode={ themeMode }
        onRunBenchmarks={ handleRunBenchmarks }
        onAutoRunToggle={ handleAutoRunToggle }
        onThemeToggle={ cycleTheme }
        showBenchmarkControls={ type === 'protobuf' }
      />
      <div className="top-section">
        <BenchmarkGrid
          rowData={ rowData }
          onGridReady={ type === 'protobuf' ? handleRunBenchmarks : undefined }
          onFirstDataRendered={ onFirstDataRendered }
          theme={ myTheme }
          currentTheme={ currentTheme }
        />
        <div className="charts-container">
          <div ref={ chartContainerRef1 } className="chart" />
          <div ref={ chartContainerRef2 } className="chart" />
        </div>
      </div>

      <div className="bottom-section">
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