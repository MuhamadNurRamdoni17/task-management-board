# Adhiasindo Frontend Test - CRUD Task Management Board

## Profil
- Nama: Muhamad Nur Ramdoni
- Role: Frontend

## Deskripsi Project
Aplikasi ini adalah implementasi frontend untuk kebutuhan test Adhiasindo berupa Task Management Board (Kanban) berbasis React. Aplikasi menampilkan beberapa kolom board dan mendukung pengelolaan task secara penuh dari sisi frontend tanpa backend.

## Tech Stack
- React
- TypeScript
- Vite
- CSS
- Local Storage

## Fitur Utama
1. Board dan Column
- Kolom task: To Do, Doing, Review, Done, Rework.
- Task bisa dipindahkan antar kolom dengan drag and drop.

2. Task Card
- Menampilkan judul, deskripsi, assignee, due date, label, priority, checklist, attachments.
- Mendukung cover image (opsional).

3. CRUD Task
- Create task baru.
- Read task dalam bentuk card dan detail panel.
- Update task melalui form modal.
- Delete task dari card, modal, atau detail panel.

4. Filtering dan Searching
- Search task berdasarkan teks.
- Filter berdasarkan assignee, label, dan due date.

5. Checklist Subtask
- Tambah dan tampilkan subtask.
- Centang/uncentang checklist.
- Progress bar otomatis mengikuti progress checklist.

6. Notifikasi dan Interaksi UI
- Toast notification saat create, update, delete, dan move task.
- Hover effect, transisi halus, animasi card dan modal.
- Statistik per kolom dengan indikator progress.

7. Assignee Dinamis
- Bisa menambahkan assignee baru langsung dari form task.
- Data assignee dan task tersimpan di localStorage.

8. Theme Toggle
- Mendukung mode light/dark melalui tombol toggle di header.

## Penyimpanan Data
Seluruh data task dan assignee disimpan di browser menggunakan localStorage sehingga tetap ada setelah refresh.

## Cara Menjalankan Project
1. Install dependency
```bash
npm install
```

2. Jalankan mode development
```bash
npm run dev
```

3. Build production
```bash
npm run build
```

4. Preview hasil build
```bash
npm run preview
```

## Catatan
Project ini berfokus pada implementasi frontend sesuai requirement test. Tidak menggunakan backend/API.
