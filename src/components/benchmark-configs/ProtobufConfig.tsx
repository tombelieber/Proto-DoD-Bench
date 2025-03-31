import React from "react";
import { BenchmarkConfigComponentProps } from "@/types";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_NUM_MESSAGES = 10000; // Default can be defined here or passed if needed

export const ProtobufConfigComponent: React.FC<BenchmarkConfigComponentProps> = ({
    config,
    onConfigChange,
}) => {
    // Type checking/assertion for safety when accessing unknown config
    const numMessages =
        typeof config.numMessages === "number" && config.numMessages > 0
            ? config.numMessages
            : DEFAULT_NUM_MESSAGES;

    const handleNumMessagesChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(event.target.value, 10);
        const newNumMessages = isNaN(value) || value <= 0 ? DEFAULT_NUM_MESSAGES : value;
        // Update only the numMessages part of the config
        onConfigChange({ ...config, numMessages: newNumMessages });
    };

    return (
        <div className="flex flex-col ">
            <Label htmlFor="protobufNumMessages" className="text-muted-foreground">
                Number of Messages:
            </Label>
            <Input
                id="protobufNumMessages" // Unique ID
                type="number"
                value={numMessages}
                onChange={handleNumMessagesChange}
                min="1"
                placeholder={`Default: ${DEFAULT_NUM_MESSAGES}`}
                className="w-full"
            />
        </div>
    );
};
