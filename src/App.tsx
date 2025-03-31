import { AgChartsEnterpriseModule } from "ag-charts-enterprise";
import { ModuleRegistry } from "ag-grid-community";
import { IntegratedChartsModule, AllEnterpriseModule } from "ag-grid-enterprise";
import React from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useLocation } from "react-router-dom";
import "./App.css";
import { BenchmarkTab } from "./components/BenchmarkTab";

// Register enterprise modules.
ModuleRegistry.registerModules( [
    IntegratedChartsModule.with( AgChartsEnterpriseModule ),
    AllEnterpriseModule,
] );

const tabs = [
    {
        id: 'protobuf',
        label: 'Protobuf Benchmarks',
        path: '/protobuf'
    },
    {
        id: 'json',
        label: 'JSON Benchmarks',
        path: '/json'
    },
    {
        id: 'custom',
        label: 'Custom Benchmarks',
        path: '/custom'
    }
];

const TabNavigation: React.FC = () =>
{
    const location = useLocation();

    return (
        <div className="tab-navigation">
            { tabs.map( ( tab ) => (
                <Link
                    key={ tab.id }
                    to={ tab.path }
                    className={ `tab-button ${location.pathname === tab.path ? 'active' : ''}` }
                >
                    { tab.label }
                </Link>
            ) ) }
        </div>
    );
};

const App: React.FC = () =>
{
    return (
        <BrowserRouter>
            <div className="app-container">
                <main className="main-content">
                    <div className="tab-system">
                        <TabNavigation />
                        <div className="tab-content">
                            <Routes>
                                <Route path="/" element={ <Navigate to="/protobuf" replace /> } />
                                <Route path="/protobuf" element={ <BenchmarkTab type="protobuf" /> } />
                                <Route path="/json" element={ <BenchmarkTab type="json" /> } />
                                <Route path="/custom" element={ <BenchmarkTab type="custom" /> } />
                            </Routes>
                        </div>
                    </div>
                </main>
            </div>
        </BrowserRouter>
    );
};

export default App;
