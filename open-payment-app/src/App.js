import logo from "./logo.svg";
import "./App.css";
import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import Table from "./components/Table";
import FilterSidebar from "./components/FilterSidebar";

function App() {
    const [filters, setFilters] = useState({});

    const handleFilterChange = (newFilters) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
    };

    return (
        <div className="App">
            <Header />
            <div className="container-fluid p-0">
                <h2 className="m-3">Data Dummy Pembayaran</h2>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3">
                        <FilterSidebar onFilterChange={handleFilterChange} />
                    </div>
                    <div className="col-md-9">
                        <Table filters={filters} />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
