const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const koneksi = require("../config/database");
const util = require("util");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

const allowedOrigins = ["http://localhost:3000", "http://localhost:3001"];

app.use(
    cors({
        origin: function (origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error("Not allowed by CORS"));
            }
        },
    })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const query = util.promisify(koneksi.query).bind(koneksi);

// Ambil semua kolom yang diperbolehkan untuk sort & filter
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

app.get("/api/open-payment", async (req, res) => {
    try {
        let {
            page = 1,
            limit = 10,
            sort_by = "Physician_Profile_ID",
            sort_order = "asc",
            ...filters
        } = req.query;

        page = parseInt(page);
        limit = parseInt(limit);
        const offset = (page - 1) * limit;

        // Validasi kolom untuk sort
        if (!allowedColumns.includes(sort_by)) {
            sort_by = "Physician_Profile_ID";
        }

        sort_order = sort_order.toLowerCase() === "desc" ? "DESC" : "ASC";

        // Build WHERE clause dari filters yang dikirim
        const whereClauses = [];
        const values = [];

        Object.keys(filters).forEach((key) => {
            if (allowedColumns.includes(key) && filters[key]) {
                whereClauses.push(`${key} LIKE ?`);
                values.push(`%${filters[key]}%`);
            }
        });

        const whereClause =
            whereClauses.length > 0
                ? `WHERE ${whereClauses.join(" AND ")}`
                : "";

        // Query count
        const countQuery = `SELECT COUNT(*) as total FROM cleaned_open_payments ${whereClause}`;
        const countResult = await query(countQuery, values);
        const total = countResult[0].total;
        const totalPage = Math.ceil(total / limit);

        // Query data utama
        const dataQuery = `
            SELECT * FROM cleaned_open_payments
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order}
            LIMIT ? OFFSET ?
        `;

        const dataValues = [...values, limit, offset];
        const rows = await query(dataQuery, dataValues);

        res.status(200).json({
            status: "success",
            message: "Data fetch success",
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
