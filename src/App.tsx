import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { ModuleRegistry } from "ag-grid-community";
import { IntegratedChartsModule, AllEnterpriseModule } from "ag-grid-enterprise";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import "./App.css";
import { BenchmarkTab } from "./components/BenchmarkTab";
import { benchmarkDefinitions } from "./benchmarks";

// Register enterprise modules.
ModuleRegistry.registerModules( [
    AllEnterpriseModule,
    IntegratedChartsModule.with( AgChartsEnterpriseModule ),
] );

const TabNavigation: React.FC = () =>
{
    const location = useLocation();

    return (
        <div className="tab-navigation">
            { benchmarkDefinitions.map( def => (
                <Link
                    key={ def.id }
                    to={ `/benchmark/${def.id}` }
                    className={ `tab-button ${location.pathname === `/benchmark/${def.id}` ? "active" : ""}` }
                >
                    { def.label }
                </Link>
            ) ) }
        </div>
    );
};

const App: React.FC = () =>
{
    const defaultBenchmarkId = benchmarkDefinitions.length > 0 ? benchmarkDefinitions[ 0 ].id : null;

    return (
        <BrowserRouter>
            <div className="app-container">
                <main className="main-content">
                    <div className="tab-system">
                        <TabNavigation />
                        <div className="tab-content">
                            <Routes>
                                <Route
                                    path="/"
                                    element={
                                        defaultBenchmarkId ? (
                                            <Navigate
                                                to={ `/benchmark/${defaultBenchmarkId}` }
                                                replace
                                            />
                                        ) : (
                                            <div>No Benchmarks Defined</div>
                                        )
                                    }
                                />
                                <Route path="/benchmark/:benchmarkId" element={ <BenchmarkTab /> } />
                            </Routes>
                        </div>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
