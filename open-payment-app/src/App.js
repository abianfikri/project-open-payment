import logo from "./logo.svg";
import "./App.css";

import Header from "./components/Header";
import Table from "./components/Table";

function App() {
    return (
        <div className="App">
            <Header />
            <div className="container-fluid p-0">
                <h2 className="m-3">Data Dummy Pembayaran</h2>
            </div>
            <div className="container-fluid">
                <div className="row">
                    <div className="col-md-3">{/* <FilterSidebar /> */}</div>
                    <div className="col-md-9">
                        <Table />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
