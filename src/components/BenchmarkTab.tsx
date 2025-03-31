import React, { useRef, useCallback, useMemo } from 'react';
import { FirstDataRenderedEvent } from 'ag-grid-community';
import { BenchmarkGrid } from './BenchmarkGrid';
import { HistoricalGrid } from './HistoricalGrid';
import { RowData } from '../types';
import { useBenchmark } from '../hooks/useBenchmark';
import { BenchmarkType } from '../main';
import { useTheme } from '../hooks/useTheme';
import { Navbar } from './Navbar';

interface BenchmarkTabProps
{
  type: BenchmarkType;
  autoRun?: boolean;
  interval?: number;
}

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

  // Prepare row data as numbers.
  const rowData: RowData[] = useMemo( () =>
  {
    if ( !results ) return [];
    return [
      {
        metric: "Min",
        protobufjs: results.protobufjs.min,
        dod: results.dod.min,
      },
      {
        metric: "Max",
        protobufjs: results.protobufjs.max,
        dod: results.dod.max,
      },
      {
        metric: "Mean",
        protobufjs: results.protobufjs.mean,
        dod: results.dod.mean,
      },
      {
        metric: "Median (p50)",
        protobufjs: results.protobufjs.median,
        dod: results.dod.median,
      },
      {
        metric: "p99",
        protobufjs: results.protobufjs.p99,
        dod: results.dod.p99,
      },
      {
        metric: "Sum",
        protobufjs: results.protobufjs.sum,
        dod: results.dod.sum,
      },
    ];
  }, [ results ] );

  // When grid data is rendered, automatically create charts.
  const onFirstDataRendered = useCallback( ( params: FirstDataRenderedEvent ) =>
  {
    if ( params.api && chartContainerRef1.current && chartContainerRef2.current ) {
      // Chart 1: rows 0-4 (all metrics except "Sum")
      params.api.createRangeChart( {
        chartType: "groupedColumn",
        cellRange: {
          columns: [ "metric", "protobufjs", "dod" ],
          rowStartIndex: 0,
          rowEndIndex: 4,
        },
        chartThemeOverrides: {
          common: {
            title: {
              enabled: true,
              text: "Benchmark Stats (ms) - Metrics",
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
        chartContainer: chartContainerRef1.current,
      } );

      // Chart 2: row 5 ("Sum")
      params.api.createRangeChart( {
        chartType: "groupedColumn",
        cellRange: {
          columns: [ "metric", "protobufjs", "dod" ],
          rowStartIndex: 5,
          rowEndIndex: 5,
        },
        chartThemeOverrides: {
          common: {
            title: {
              enabled: true,
              text: "Benchmark Stats (ms) - Sum",
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
        chartContainer: chartContainerRef2.current,
      } );
    }
  }, [] );

  return (
    <div className="benchmark-tab">
      <Navbar
        loading={ loading }
        autoRun={ isAutoRunning }
        themeMode={ themeMode }
        onRunBenchmarks={ handleRunBenchmarks }
        onAutoRunToggle={ handleAutoRunToggle }
        onThemeToggle={ cycleTheme }
        showBenchmarkControls
      />
      <div className="top-section">
        <BenchmarkGrid
          rowData={ rowData }
          onGridReady={ handleRunBenchmarks }
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
          rowData={ historicalP99Data }
          theme={ myTheme }
          currentTheme={ currentTheme }
        />
      </div>
    </div>
  );
}; 