# Tubes2_e621
`Penerapan Algoritma BFS dan DFS dalam Mekanisme Penelusuran CSS pada pohon Document Object Model`

---

## Daftar Isi
- [Deskripsi Singkat](#deskripsi-singkat)
- [Requirement](#requirement)
- [Instalasi dan Build](#instalasi-dan-build)
- [Struktur Proyek](#struktur-proyek)
- [Author](#author)

## Deskripsi Singkat
Proyek ini mengimplementasikan pencarian pada penelusuran identitas komponen (*CSS Selectors*) di dalam pohon **Document Object Model (DOM)** pada suatu dokumen HTML yang diberikan (dapat berupa tautan tautan *website* maupun kode HTML mentah). Mesin algoritma inti dibentuk menggunakan dua metode algoritma pencarian visual: **Breadth-First Search (BFS)** secara menyamping lapis demi lapis dan **Depth-First Search (DFS)** secara menelusur kedalaman cabang demi cabang.

## Requirement

| Komponen                   | Keterangan / Versi Minimum |
|----------------------------|----------------------------|
| **Node.js & NPM**          | v18.0 atau yang lebih baru |
| **HTML, CSS, dan JavaScript** | ES6+ Standard           |
| **React**                  | v18.0+ (Menggunakan Vite)  |
| **C#**                     | C# 12.0                    |
| **.NET SDK**               | versi 8.0 atau 9.0 (Dapat disesuaikan di `backEnd.csproj`) |
| **Sistem Operasi**         | Windows / Linux (WSL)      |

## Instalasi dan Build

### 1. Clone Repository
Unduh salinan berkas kode aplikasi *Tubes2* kelompok kami melalui terminal:
```bash
git clone https://github.com/Alpaomega1136/Tubes2_e621.git
```

### 2. Menjalankan Front End Program (React UI)
Dari direktori akar (`/Tubes2_e621`), masuk dan nyalakan antarmuka visual penelusuran.
```bash
# Berpindah ke direktori React
cd src/frontEnd

# Menginstal sekumpulan dependensi yang dibutuhkan
npm install

# Menyalakan program Visualizer di localhost:5173
npm run dev
```

### 3. Menjalankan Back End Program (API C#)
Buka layar Terminal baru. Dari direktori akar (`/Tubes2_e621`), masuk dan nyalakan *server backend* penelusur algoritma pohon DOM.
```bash
# Berpindah ke direktori ASP.NET Core
cd src/backEnd

# Mengecek kompatibilitas versi .NET di terminal Anda
dotnet --version 
# Catatan: Apabila versi yang terinstall berbeda/lebih tua dari kerangka kerja
# di spesifikasi tugas, sesuaikan `<TargetFramework>` pada file `backEnd.csproj` secara manual.

# Jalankan server API (Otomatis berjalan pada Port 5027)
dotnet run
```

## Struktur Proyek
```text
Tubes2_e621/
├── README.md                      # Dokumentasi Proyek Induk
├── doc/                           # Berkas Penyajian Laporan & Dokumen Tugas
│   └── ...                        # Laporan spesifikasi atau PDF pendukung
└── src/
    ├── backEnd/                   # Source Code C# API Framework Backend
    │   ├── controllers/           
    │   ├── models/                
    │   ├── services/              
    │   ├── backEnd.csproj         
    │   └── Program.cs             # Bootstrapper Pintu Masuk Lokal
    │
    └── frontEnd/                  # Source Code React Aplikasi Antarmuka Visual (Vite)
        ├── src/
        │   ├── components/        
        │   ├── services/          
        │   ├── App.jsx            
        │   └── App.css            
        ├── package.json           
        └── vite.config.js         
```

### Author

| Nama                             | NIM         |
|----------------------------------|-------------|
| **An-Dafa Anza Avansyah**        | 13524038    |
| **Muhammad Haris Putra Sulastianto** | 13524053|
| **Raymond Jonathan Dwi Putra J** | 13524059    |
