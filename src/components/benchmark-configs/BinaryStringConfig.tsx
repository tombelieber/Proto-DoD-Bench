import React from "react";
import { BenchmarkConfigComponentProps } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_ITERATIONS = 1_000_000; // Default value for internal iterations

export const BinaryStringConfigComponent: React.FC<BenchmarkConfigComponentProps> = ({
    config,
    onConfigChange,
}) => {
    // Type checking/assertion for safety when accessing unknown config
    const internalIterations =
        typeof config.internalIterations === "number" && config.internalIterations > 0
            ? config.internalIterations
            : DEFAULT_ITERATIONS;

    const handleIterationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        const newIterations = isNaN(value) || value <= 0 ? DEFAULT_ITERATIONS : value;
        // Update only the internalIterations part of the config
        onConfigChange({ ...config, internalIterations: newIterations });
    };

    return (
        <div className="flex flex-col">
            <Label htmlFor="binaryStringIterations" className="text-muted-foreground">
                Internal Iterations:
            </Label>
            <Input
                id="binaryStringIterations"
                type="number"
                value={internalIterations}
                onChange={handleIterationsChange}
                min="1"
                placeholder={`Default: ${DEFAULT_ITERATIONS.toLocaleString()}`}
                className="w-full"
            />
        </div>
    );
};
