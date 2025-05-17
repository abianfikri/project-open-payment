const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const koneksi = require("../config/database");
const util = require("util");

const app = express();
const PORT = process.env.PORT || 3000;

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];
app.use(
    cors({
        origin: (origin, cb) =>
            !origin || allowedOrigins.includes(origin)
                ? cb(null, true)
                : cb(new Error("Not allowed by CORS")),
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const query = util.promisify(koneksi.query).bind(koneksi);

const allowedColumns = [
    "Change_Type",
    "Physician_Profile_ID",
    "Physician_NPI",
    "Physician_First_Name",
    "Physician_Middle_Name",
    "Physician_Last_Name",
    "Physician_Name_Suffix",
    "Recipient_Primary_Business_Street_Address_Line1",
    "Recipient_Primary_Business_Street_Address_Line2",
    "Recipient_City",
    "Recipient_State",
    "Recipient_Zip_Code",
    "Recipient_Country",
    "Recipient_Province",
    "Recipient_Postal_Code",
    "Physician_Primary_Type",
    "Physician_Specialty",
    "Record_ID",
    "Program_Year",
    "Total_Amount_Invested_USDollars",
    "Value_of_Interest",
    "Terms_of_Interest",
    "Submitting_Applicable_Manufacturer_or_Applicable_GPO_Name",
    "Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_ID",
    "Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Name",
    "Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_State",
    "Applicable_Manufacturer_or_Applicable_GPO_Making_Payment_Country",
    "Dispute_Status_for_Publication",
    "Interest_Held_by_Physician_or_an_Immediate_Family_Member",
    "Payment_Publication_Date",
];

const buildSearchClause = (search) => {
    if (!search) return { clause: "", values: [] };

    const searchColumns = [
        "Physician_First_Name",
        "Physician_Last_Name",
        "Physician_Specialty",
        "Recipient_City",
        "Recipient_State",
    ];

    const conditions = searchColumns.map((col) => `${col} LIKE ?`).join(" OR ");
    const values = searchColumns.map(() => `%${search}%`);

    return {
        clause: `(${conditions})`,
        values,
    };
};

const buildFilterClause = (filters) => {
    const whereClauses = [];
    const values = [];

    for (const key in filters) {
        if (!allowedColumns.includes(key) || !filters[key]) continue;

        const value = filters[key];

        if (Array.isArray(value)) {
            const orClause = value.map(() => `${key} LIKE ?`).join(" OR ");
            whereClauses.push(`(${orClause})`);
            value.forEach((v) => values.push(`%${v}%`));
        } else if (key === "Physician_Specialty") {
            const specialties = value.split(",");
            const orClause = specialties
                .map(() => `${key} LIKE ?`)
                .join(" OR ");
            whereClauses.push(`(${orClause})`);
            specialties.forEach((s) => values.push(`%${s.trim()}%`));
        } else {
            whereClauses.push(`${key} LIKE ?`);
            values.push(`%${value}%`);
        }
    }

    return {
        clause: whereClauses.length > 0 ? whereClauses.join(" AND ") : "",
        values,
    };
};

app.get("/api/open-payment", async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            sort_by = "Physician_First_Name",
            sort_order = "asc",
            search = "",
            ...filters
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        // VALIDASI BAD REQUEST
        if (isNaN(page) || page <= 0) {
            return res.status(400).json({
                status: "error",
                message: "Invalid 'page' parameter. Must be a positive integer.",
            });
        }

        if (isNaN(limit) || limit <= 0) {
            return res.status(400).json({
                status: "error",
                message: "Invalid 'limit' parameter. Must be a positive integer.",
            });
        }

        if (!allowedColumns.includes(sort_by)) {
            return res.status(400).json({
                status: "error",
                message: `'sort_by' must be one of allowed columns.`,
            });
        }


        if (!["asc", "desc"].includes(sort_order.toLowerCase())) {
            return res.status(400).json({
                status: "error",
                message: `'sort_order' must be 'asc' or 'desc'.`,
            });
        }

        if (!allowedColumns.includes(sort_by)) sort_by = "Physician_Profile_ID";
        sort_order = sort_order.toLowerCase() === "desc" ? "DESC" : "ASC";

        const { clause: searchClause, values: searchValues } =
            buildSearchClause(search);
        const { clause: filterClause, values: filterValues } =
            buildFilterClause(filters);

        const combinedClause = [searchClause, filterClause]
            .filter(Boolean)
            .join(" AND ");
        const whereClause = combinedClause ? `WHERE ${combinedClause}` : "";
        const queryValues = [...searchValues, ...filterValues];

        const countQuery = `SELECT COUNT(*) as total FROM cleaned_open_payments ${whereClause}`;
        const countResult = await query(countQuery, queryValues);
        const total = countResult[0]?.total || 0;
        const totalPage = Math.ceil(total / limit);

        const dataQuery = `
            SELECT * FROM cleaned_open_payments
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order}
            LIMIT ? OFFSET ?
        `;
        const dataValues = [...queryValues, limit, offset];
        const rows = await query(dataQuery, dataValues);

        res.status(200).json({
            status: "success",
            message: rows.length
                ? "Data fetch success"
                : "Data tidak ditemukan",
            page,
            total_page: totalPage,
            total,
            data: rows,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: "Internal Server Error",
            error: err.message,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
});