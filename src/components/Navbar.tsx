import React, { useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";
import { BenchmarkConfigComponentProps } from "@/types";

interface NavbarProps {
    currentTheme: string;
    cycleTheme: () => void;
    loading?: boolean;
    autoRun?: boolean;
    onRunBenchmarks?: () => void;
    onAutoRunToggle?: () => void;
    iterations: number;
    maxHistoricalPoints: number;
    onConfigChange: (iterations: number, maxHistoricalPoints: number) => void;
    ConfigComponent?: React.FC<BenchmarkConfigComponentProps>;
    benchmarkConfig?: Record<string, unknown>;
    onBenchmarkConfigChange?: (newConfig: Record<string, unknown>) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
    loading = false,
    autoRun = false,
    currentTheme,
    cycleTheme,
    onRunBenchmarks,
    onAutoRunToggle,
    iterations,
    maxHistoricalPoints,
    onConfigChange,
    ConfigComponent,
    benchmarkConfig,
    onBenchmarkConfigChange,
}) => {
    const [localIterations, setLocalIterations] = React.useState(iterations.toString());
    const [localMaxHistory, setLocalMaxHistory] = React.useState(maxHistoricalPoints.toString());

    useEffect(() => {
        setLocalIterations(iterations.toString());
    }, [iterations]);

    useEffect(() => {
        setLocalMaxHistory(maxHistoricalPoints.toString());
    }, [maxHistoricalPoints]);

    const handleApplyGeneralConfig = () => {
        const newIterations = parseInt(localIterations, 10);
        const newMaxHistory = parseInt(localMaxHistory, 10);
        if (
            !isNaN(newIterations) &&
            newIterations > 0 &&
            !isNaN(newMaxHistory) &&
            newMaxHistory > 0 &&
            newMaxHistory <= 100
        ) {
            onConfigChange(newIterations, newMaxHistory);
        } else {
            setLocalIterations(iterations.toString());
            setLocalMaxHistory(maxHistoricalPoints.toString());
            console.warn("Invalid general config values entered.");
        }
    };

    const baseButtonSmStyles =
        "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3";

    return (
        <nav className="navbar p-4 flex flex-wrap justify-between items-center gap-4 bg-card text-card-foreground shadow-sm">
            <div className="navbar-left flex-shrink-0">
                <div className="navbar-title">
                    <h1 className="text-xl font-bold">Performance Benchmark</h1>
                </div>
            </div>

            <div className="config-area flex items-end gap-3 flex-wrap">
                <div className="flex flex-col">
                    <Label htmlFor="iterationsInput" className="text-xs mb-1 text-muted-foreground">
                        Iterations
                    </Label>
                    <Input
                        id="iterationsInput"
                        type="number"
                        min="1"
                        className="h-9 w-24 px-3"
                        placeholder={`${iterations}`}
                        value={localIterations}
                        onChange={e => setLocalIterations(e.target.value)}
                    />
                </div>

                {ConfigComponent && benchmarkConfig && onBenchmarkConfigChange && (
                    <ConfigComponent
                        config={benchmarkConfig}
                        onConfigChange={onBenchmarkConfigChange}
                    />
                )}

                <div className="flex flex-col ">
                    <Label htmlFor="maxHistoryInput" className="text-xs mb-1 text-muted-foreground">
                        History Points
                    </Label>
                    <Input
                        id="maxHistoryInput"
                        type="number"
                        min="1"
                        max="100"
                        step="1"
                        className="h-9 w-24 px-3"
                        placeholder={`${maxHistoricalPoints}`}
                        value={localMaxHistory}
                        onChange={e => setLocalMaxHistory(e.target.value)}
                    />
                </div>

                <Button
                    onClick={handleApplyGeneralConfig}
                    // variant="outline"
                    size="sm"
                    className="h-9 px-3"
                >
                    Apply
                </Button>
            </div>

            <div className="navbar-buttons flex items-center gap-2 flex-shrink-0">
                <Button onClick={onRunBenchmarks} disabled={loading || autoRun} size="sm">
                    {loading ? "Running..." : "Run Once"}
                </Button>
                <Button
                    onClick={onAutoRunToggle}
                    disabled={loading && !autoRun}
                    className={cn(
                        baseButtonSmStyles,
                        "transition-colors w-[85px]",
                        autoRun
                            ? "bg-green-600 hover:bg-green-700 text-primary-foreground border-transparent"
                            : "bg-red-600 hover:bg-red-700 text-primary-foreground border-transparent"
                    )}
                >
                    {autoRun ? "Auto: ON" : "Auto: OFF"}
                </Button>
                <Button
                    // variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={cycleTheme}
                    title={`Toggle theme (Current: ${currentTheme})`}
                >
                    {currentTheme === "light" ? "☀️" : currentTheme === "dark" ? "🌙" : "💻"}
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </nav>
    );
};
