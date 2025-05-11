const express = require('express');
const bodyParser = require('body-parser');
const koneksi = require('../config/database');
const app = express();
const PORT = process.env.PORT || 3000;


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


// Get All Data

app.get('/api/open-payment', (req, res) => {
    // buat query sql
    const querySql = 'SELECT * FROM cleaned_open_payments';
    console.log('Ini GET');

    // jalankan query
    koneksi.query(querySql, (err, rows, field) => {
        // error handling
        if (err) {
            return res.status(500).json({ message: 'Ada kesalahan', error: err });
        }

        // jika request berhasil
        res.status(200).json({ success: true, data: rows });
    });
});

// buat server nya
app.listen(PORT, () => console.log(`Server running at port: ${PORT}`));