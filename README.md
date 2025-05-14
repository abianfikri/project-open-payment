Project Open Payment

Deskripsi
Repositori ini berisi implementasi proyek Tugas Group Project untuk mata kuliah  Manajemen Data, Informasi, dan Konten. Proyek bertujuan membangun layanan data berskala besar berbasis RDS, Async API, dan melakukan Load Testing  menggunakan dataset Open Payments Data  dari CMS (Centers for Medicare & Medicaid Services, USA).

## Struktur Proyek
project-open-payment/
├── express-api/ # Folder backend API menggunakan Express.js (Async)
│ ├── routes/ # Routing logic
│ ├── controllers/ # Endpoint handler
│ └── db.js # Koneksi database PostgreSQL (read-only)
├── open-payment-app/ # Aplikasi frontend (opsional) berbasis React.js
└── README.md # Dokumentasi ini


## Fitur API
- `GET /payments`: Mengambil data pembayaran dengan dukungan:
  - Pagination (`page`, `limit`)
  - Filtering (`city`, `specialty`)
  - Sorting (`sort_by`, `order`)
- Format respons dalam JSON

## Teknologi
- **Backend**: Node.js + Express (Async/Await)
- **Database**: PostgreSQL (Read-Only)
- **Frontend (opsional)**: React.js
- **Load Testing**: Artillery / Locust
- **Dokumentasi API**: Postman Collection / Swagger

 Cara Menjalankan API

1. Clone repositori:
  bash
git clone https://github.com/abianfikri/project-open-payment.git
cd project-open-payment/express-api

 2.  Install dependencies:

npm install

  3. Jalankan server:

npm start

  4.  Endpoint dapat diakses melalui:

http://localhost:3000/payments

Pengujian Beban (Load Testing)

Uji performa dilakukan menggunakan Artillery atau Locust untuk simulasi 100, 300, dan 500 pengguna simultan.

Dataset

    Sumber: CMS Open Payments Data

    Data telah melalui proses cleaning sebelum diunggah ke PostgreSQL

