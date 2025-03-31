import React from "react";
import { ITERATIONS, NUM_MESSAGES } from "../NUM_MESSAGES";

interface NavbarProps
{
    themeMode: string;
    onThemeToggle: () => void;
    showBenchmarkControls?: boolean;
    loading?: boolean;
    autoRun?: boolean;
    onRunBenchmarks?: () => void;
    onAutoRunToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ( {
    loading = false,
    autoRun = false,
    themeMode,
    onRunBenchmarks,
    onAutoRunToggle,
    onThemeToggle,
    showBenchmarkControls = false,
} ) =>
{
    return (
        <nav className="navbar">
            <div className="navbar-left">
                <div className="navbar-title">
                    <h1>Data Oriented Protobuf Decoding Benchmark</h1>
                    <h3>
                        NUM_MESSAGES={ NUM_MESSAGES }, ITERATIONS={ ITERATIONS }
                    </h3>
                    <p>
                        This benchmark compares the performance of a DOD (Structure-of-Array)
                        decoder vs. a standard ProtobufJS decoder.
                    </p>
                </div>
            </div>
            <div className="navbar-buttons">
                { showBenchmarkControls && (
                    <>
                        <button className="run-button" onClick={ onRunBenchmarks } disabled={ loading }>
                            { loading ? "Running Benchmarks..." : "Run Benchmarks" }
                        </button>
                        <button
                            className={ `auto-run-button ${autoRun ? "active" : ""}` }
                            onClick={ onAutoRunToggle }
                            disabled={ loading }
                        >
                            { autoRun ? "Stop Auto-Run" : "Start Auto-Run" }
                        </button>
                    </>
                ) }
                <button
                    className="theme-toggle"
                    onClick={ onThemeToggle }
                    title={ `Current theme: ${themeMode} (click to cycle)` }
                >
                    { themeMode === "light" ? "☀️" : themeMode === "dark" ? "🌙" : "💻" }
                </button>
            </div>
        </nav>
    );
};
