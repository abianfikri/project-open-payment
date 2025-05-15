import React, { useEffect, useState, useCallback } from "react";

const Table = ({ filters }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [totalPage, setTotalPage] = useState(1);
    const [sortBy, setSortBy] = useState("Physician_First_Name");
    const [sortOrder, setSortOrder] = useState("asc");
    const [searchTerm, setSearchTerm] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        const queryParams = new URLSearchParams({
            page,
            sort_by: sortBy,
            sort_order: sortOrder,
            ...filters,
        });

        if (searchTerm) {
            queryParams.append("search", searchTerm);
        }

        try {
            const response = await fetch(
                `http://localhost:3000/api/open-payment?${queryParams}`
            );
            const result = await response.json();
            setData(result.data || []);
            setTotalPage(result.total_page || 1);
        } catch (error) {
            console.error("Fetch error:", error);
        } finally {
            setLoading(false);
        }
    }, [page, sortBy, sortOrder, filters, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setPage(1);
    };

    const handleSort = (field) => {
        const order = sortBy === field && sortOrder === "asc" ? "desc" : "asc";
        setSortBy(field);
        setSortOrder(order);
    };

    const renderPagination = () => {
        const pages = [];
        const maxVisible = 10;

        let start = Math.max(2, page - 4);
        let end = Math.min(totalPage - 1, page + 4);

        if (totalPage <= maxVisible) {
            for (let i = 1; i <= totalPage; i++) pages.push(i);
        } else {
            pages.push(1);
            if (start > 2) pages.push("...");
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPage - 1) pages.push("...");
            pages.push(totalPage);
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
                value={searchTerm}
                onChange={handleSearchChange}
            />
            {loading ? (
                <p>Loading...</p>
            ) : (
                <>
                    <table className="table table-striped table-hover table-bordered table-fixed align-middle">
                        <thead className="table-dark">
                            <tr>
                                {columns.map(({ key, label }) => (
                                    <th
                                        key={key}
                                        onClick={() => handleSort(key)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {label}{" "}
                                        {sortBy === key &&
                                            (sortOrder === "asc" ? "▲" : "▼")}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={columns.length}
                                        className="text-center"
                                    >
                                        Data Tidak Ditemukan
                                    </td>
                                </tr>
                            ) : (
                                data.map((item, index) => (
                                    <tr key={index}>
                                        <td>{formatName(item)}</td>
                                        <td>
                                            {formatSpecialty(
                                                item.Physician_Specialty
                                            )}
                                        </td>
                                        <td>
                                            {capitalize(item.Recipient_City)}
                                        </td>
                                        <td>
                                            {item.Recipient_State?.toUpperCase() ||
                                                "-"}
                                        </td>
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
                                            {item.Payment_Publication_Date ||
                                                "-"}
                                        </td>
                                        <td>
                                            {capitalize(
                                                item.Interest_Held_by_Physician_or_an_Immediate_Family_Member ||
                                                    "-"
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                    {renderPagination()}
                </>
            )}
        </div>
    );
};

const capitalize = (str) =>
    str ? str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase()) : "";

const formatCurrency = (amount) =>
    amount && !isNaN(amount)
        ? `$${Number(amount).toLocaleString("en-US", {
              minimumFractionDigits: 2,
          })}`
        : "-";

const formatName = ({
    Physician_First_Name,
    Physician_Middle_Name,
    Physician_Last_Name,
}) =>
    [Physician_First_Name, Physician_Middle_Name, Physician_Last_Name]
        .filter(Boolean)
        .map(capitalize)
        .join(" ");

const formatSpecialty = (specialty) =>
    specialty
        ? specialty
              .split("|")
              .map((s) => capitalize(s.trim()))
              .join(", ")
        : "-";

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
