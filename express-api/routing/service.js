const express = require("express");
const bodyParser = require("body-parser");
const koneksi = require("../config/database");
const util = require("util");

const app = express();
const PORT = process.env.PORT || 3000;
const cors = require("cors");

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Promisify koneksi.query agar bisa pakai async/await
const query = util.promisify(koneksi.query).bind(koneksi);

// GET with pagination, filter, sort
app.get("/api/open-payment", async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            sort_by = "Physician_Profile_ID",
            sort_order = "asc",
            vendor_name,
        } = req.query;

        const offset = (page - 1) * limit;

        // Filter query (misal by vendor_name)
        let whereClause = "";
        if (vendor_name) {
            whereClause = `WHERE vendor_name LIKE '%${vendor_name}%'`;
        }

        // Hitung total data
        const countQuery = `SELECT COUNT(*) as total FROM cleaned_open_payments ${whereClause}`;
        const countResult = await query(countQuery);
        const total = countResult[0].total;
        const totalPage = Math.ceil(total / limit);

        // Query data utama
        const dataQuery = `
            SELECT * FROM cleaned_open_payments
            ${whereClause}
            ORDER BY ${sort_by} ${sort_order.toUpperCase()}
            LIMIT ${parseInt(limit)} OFFSET ${offset}
        `;
        const rows = await query(dataQuery);

        res.status(200).json({
            status: "success",
            message: "Data fetch success",
            page: parseInt(page),
            total_page: totalPage,
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

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server running at port: ${PORT}`);
});
