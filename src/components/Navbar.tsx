import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import
{
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";

// Zod schema for validation
const formSchema = z.object( {
    numMessages: z.coerce.number().int().positive( "Must be positive" ).min( 1 ),
    iterations: z.coerce.number().int().positive( "Must be positive" ).min( 1 ),
    maxHistoricalPoints: z.coerce.number().int().positive( "Must be positive" ).min( 1 ).max( 100 ),
} );

interface NavbarProps
{
    themeMode: string;
    onThemeToggle: () => void;
    showBenchmarkControls?: boolean;
    loading?: boolean;
    autoRun?: boolean;
    onRunBenchmarks?: () => void;
    onAutoRunToggle?: () => void;
    numMessages: number;
    iterations: number;
    maxHistoricalPoints: number;
    onConfigChange: ( numMessages: number, iterations: number, maxHistoricalPoints: number ) => void;
}

export const Navbar: React.FC<NavbarProps> = ( {
    loading = false,
    autoRun = false,
    themeMode,
    onRunBenchmarks,
    onAutoRunToggle,
    onThemeToggle,
    showBenchmarkControls = false,
    numMessages,
    iterations,
    maxHistoricalPoints,
    onConfigChange,
} ) =>
{
    const form = useForm<z.infer<typeof formSchema>>( {
        resolver: zodResolver( formSchema ),
        defaultValues: {
            numMessages: numMessages,
            iterations: iterations,
            maxHistoricalPoints: maxHistoricalPoints,
        },
        mode: "onChange",
    } );

    function onSubmit ( values: z.infer<typeof formSchema> )
    {
        onConfigChange( values.numMessages, values.iterations, values.maxHistoricalPoints );
    }

    const baseButtonSmStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-3";

    return (
        <nav className="navbar p-4 flex flex-wrap justify-between items-center gap-4 bg-card text-card-foreground shadow-sm">
            <div className="navbar-left flex-shrink-0">
                <div className="navbar-title">
                    <h1 className="text-xl font-bold">Data Oriented Protobuf Decoding Benchmark</h1>
                    <p className="text-sm text-muted-foreground">
                        Compares DOD vs. ProtobufJS decoding.
                    </p>
                </div>
            </div>

            { showBenchmarkControls && (
                <Form { ...form }>
                    <form onSubmit={ form.handleSubmit( onSubmit ) } className="flex items-end gap-3 flex-wrap p-2 rounded-md">
                        <FormField
                            control={ form.control }
                            name="numMessages"
                            render={ ( { field } ) => (
                                <FormItem className="flex flex-col gap-1">
                                    <FormLabel className="text-xs font-medium text-muted-foreground">Messages</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"

                                            className="h-9 w-28 px-3"
                                            placeholder="e.g., 10k"
                                            { ...field }
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            ) }
                        />
                        <FormField
                            control={ form.control }
                            name="iterations"
                            render={ ( { field } ) => (
                                <FormItem className="flex flex-col gap-1">
                                    <FormLabel className="text-xs font-medium text-muted-foreground">Iterations</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"

                                            className="h-9 w-24 px-3"
                                            placeholder="e.g., 100"
                                            { ...field }
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            ) }
                        />
                        <FormField
                            control={ form.control }
                            name="maxHistoricalPoints"
                            render={ ( { field } ) => (
                                <FormItem className="flex flex-col gap-1">
                                    <FormLabel className="text-xs font-medium text-muted-foreground">History</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min="1"
                                            max="100"
                                            step="1"
                                            className="h-9 w-20 px-3"
                                            placeholder="e.g., 10"
                                            { ...field }
                                        />
                                    </FormControl>
                                    <FormMessage className="text-xs" />
                                </FormItem>
                            ) }
                        />
                        <Button type="submit" variant="ghost" className="h-9 px-3 text-xs">Apply</Button>
                    </form>
                </Form>
            ) }

            <div className="navbar-buttons flex items-center gap-2 flex-shrink-0">
                { showBenchmarkControls && (
                    <>
                        <Button onClick={ onRunBenchmarks } disabled={ loading || autoRun } size="sm">
                            { loading ? "Running..." : "Run Once" }
                        </Button>
                        <Button
                            onClick={ onAutoRunToggle }
                            disabled={ loading && !autoRun }
                            className={ cn(
                                baseButtonSmStyles,
                                "transition-colors w-[85px]",
                                autoRun
                                    ? "bg-green-600 hover:bg-green-700 text-primary-foreground border-transparent"
                                    : "bg-red-600 hover:bg-red-700 text-primary-foreground border-transparent"
                            ) }
                        >
                            { autoRun ? "Auto: ON" : "Auto: OFF" }
                        </Button>
                    </>
                ) }
                <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                    onClick={ onThemeToggle }
                    title={ `Toggle theme (Current: ${themeMode})` }
                >
                    { themeMode === "light" ? "☀️" : themeMode === "dark" ? "🌙" : "💻" }
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </nav>
    );
};
