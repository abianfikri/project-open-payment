import React, { useEffect, useState } from "react";

const Table = ({ filter }) => {
    //get data
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);

    const fetchData = async (pageNum) => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/open-payment?page=${pageNum}`
            );
            const result = await response.json();
            setData(result.data);
            setTotalPage(result.total_page);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    useEffect(() => {
        fetchData(page);
    }, [page]);

    const renderPagination = () => {
        const pages = [];

        const maxVisible = 10;
        const lastPage = totalPage;

        if (totalPage <= maxVisible) {
            for (let i = 1; i <= totalPage; i++) {
                pages.push(i);
            }
        } else {
            const visiblePages = [];

            const leftLimit = Math.min(page + 4, lastPage - 1);
            const rightLimit = Math.max(page - 5, 2);

            visiblePages.push(1);

            if (rightLimit > 2) {
                visiblePages.push("...");
            }

            for (let i = rightLimit; i <= leftLimit; i++) {
                if (i > 1 && i < lastPage) {
                    visiblePages.push(i);
                }
            }

            if (leftLimit < lastPage - 1) {
                visiblePages.push("...");
            }

            visiblePages.push(lastPage);

            pages.push(...visiblePages);
        }

        return (
            <nav>
                <ul className="pagination justify-content-center">
                    <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
                        <button
                            className="page-link"
                            onClick={() => setPage(page - 1)}
                        >
                            &laquo;
                        </button>
                    </li>
                    {pages.map((p, index) => (
                        <li
                            key={index}
                            className={`page-item ${
                                p === page ? "active" : ""
                            }`}
                        >
                            {p === "..." ? (
                                <span className="page-link">...</span>
                            ) : (
                                <button
                                    className="page-link"
                                    onClick={() => setPage(p)}
                                >
                                    {p}
                                </button>
                            )}
                        </li>
                    ))}
                    <li
                        className={`page-item ${
                            page === totalPage ? "disabled" : ""
                        }`}
                    >
                        <button
                            className="page-link"
                            onClick={() => setPage(page + 1)}
                        >
                            &raquo;
                        </button>
                    </li>
                </ul>
            </nav>
        );
    };

    return (
        <div>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Cari Nama, Spesialisasi, Kota..."
                disabled // belum implementasi filter
            />
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className="table table-striped table-hover table-bordered table-fixed">
                        <thead className="table-dark">
                            <tr>
                                <th>Name</th>
                                <th>Specialty</th>
                                <th>City</th>
                                <th>State</th>
                                <th>Total Amount</th>
                                <th>Company Name</th>
                                <th>Payment Date</th>
                                <th>Term Of Interest</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    <td>{`${item.Physician_First_Name || ""} ${
                                        item.Physician_Middle_Name || ""
                                    } ${item.Physician_Last_Name || ""}`}</td>
                                    <td>{item.Physician_Specialty || "-"}</td>
                                    <td>{item.Recipient_City || "-"}</td>
                                    <td>{item.Recipient_State || "-"}</td>
                                    <td>
                                        {item.Total_Amount_Invested_USDollars ||
                                            "-"}
                                    </td>
                                    <td>
                                        {item.Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name ||
                                            "-"}
                                    </td>
                                    <td>
                                        {item.Payment_Publication_Date || "-"}
                                    </td>
                                    <td>
                                        {item.Interest_Held_by_Physician_or_an_Immediate_Family_Member ||
                                            "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {renderPagination()}
                </>
            )}
        </div>
    );
};

export default Table;
