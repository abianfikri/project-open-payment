import React, { useEffect, useState } from "react";

const Table = ({ filter }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [sortBy, setSortBy] = useState("Physician_First_Name");
    const [sortOrder, setSortOrder] = useState("asc");

    const fetchData = async (
        pageNum = 1,
        sortByField = sortBy,
        order = sortOrder
    ) => {
        setLoading(true);
        try {
            const response = await fetch(
                `http://localhost:3000/api/open-payment?page=${pageNum}&sort_by=${sortByField}&sort_order=${order}`
            );
            const result = await response.json();
            setData(result.data);
            setTotalPage(result.total_page);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
        setLoading(false);
    };

    const handleSort = (field) => {
        const order = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(order);
        fetchData(page, field, order);
    };

    useEffect(() => {
        fetchData(page, sortBy, sortOrder);
    }, [page, sortBy, sortOrder]);

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
                    <table className="table table-striped table-hover table-bordered table-fixed align-middle">
                        <thead className="table-dark">
                            <tr>
                                {columns.map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {col.label}{" "}
                                        {sortBy === col.key &&
                                            (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, index) => (
                                <tr key={index}>
                                    {/* Name */}
                                    <td className="text-start">
                                        {`${capitalize(
                                            item.Physician_First_Name
                                        )} ${capitalize(
                                            item.Physician_Middle_Name
                                        )} ${capitalize(
                                            item.Physician_Last_Name
                                        )}`.trim()}
                                    </td>
                                    {/* Specialty */}
                                    <td className="text-start">
                                        {item.Physician_Specialty
                                            ? item.Physician_Specialty.split(
                                                  "|"
                                              )
                                                  .map((s) =>
                                                      capitalize(s.trim())
                                                  )
                                                  .join(", ")
                                            : "-"}
                                    </td>

                                    {/* City */}
                                    <td>{capitalize(item.Recipient_City)}</td>

                                    {/* State */}
                                    <td>
                                        {item.Recipient_State?.toUpperCase() ||
                                            "-"}
                                    </td>

                                    {/* Total Amount */}
                                    <td>
                                        {formatCurrency(
                                            item.Total_Amount_Invested_USDollars
                                        )}
                                    </td>
                                    <td>
                                        {item.Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name ||
                                            "-"}
                                    </td>
                                    <td>
                                        {item.Payment_Publication_Date || "-"}
                                    </td>
                                    <td className="text-start">
                                        {capitalize(
                                            item.Interest_Held_by_Physician_or_an_Immediate_Family_Member
                                        ).trim()}
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

const capitalize = (str) => {
    if (!str) return "";
    return str
        .toLowerCase()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
};

const formatCurrency = (amount) => {
    if (!amount || isNaN(amount)) return "-";
    return `$${Number(amount).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
};

const columns = [
    { key: "Physician_First_Name", label: "Name" },
    { key: "Physician_Specialty", label: "Specialty" },
    { key: "Recipient_City", label: "City" },
    { key: "Recipient_State", label: "State" },
    { key: "Total_Amount_Invested_USDollars", label: "Total Amount" },
    {
        key: "Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name",
        label: "Company Name",
    },
    { key: "Payment_Publication_Date", label: "Payment Date" },
    {
        key: "Interest_Held_by_Physician_or_an_Immediate_Family_Member",
        label: "Term Of Interest",
    },
];

export default Table;
