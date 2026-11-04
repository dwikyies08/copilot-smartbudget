---
name: smartbudget-ui-styling
description: >-
  Use this skill whenever creating, editing, or refactoring pages, layouts, cards,
  forms, tables, or CSS styles in SmartBudget. Provides strict styling and layout
  boundaries optimized for low-parameter / fast models with modern, colorful,
  minimalist FinTech glass essence and Tailwind CSS v3 rules.
---

# SmartBudget UI Styling & Layout Boundaries (Low-Model Optimized)

Ikuti panduan ini secara **ketat dan berurutan** saat membuat atau mengubah tampilan UI di **SmartBudget**. Panduan ini dirancang agar model ringan (*low model*) dapat menghasilkan antarmuka FinTech yang modern, *colorful*, minimalis, dan memiliki *glass essence* yang bersih tanpa *error* build CSS.

---

## 1. Aturan Pantangan Mutlak (NEVER DO)

1. **JANGAN gunakan sintaks Tailwind v4**:
   - ❌ Salah: `--spacing(6)`, `w-(--sidebar-width)`, `bg-(--primary)`, `@theme inline`, `@import "tailwindcss"`
   - ✅ Benar: `h-6`, `w-[var(--sidebar-width)]`, `bg-primary`, `@tailwind base; @tailwind components; @tailwind utilities;`
2. **JANGAN menumpuk `backdrop-blur` (No Nested Blur)**:
   - `<Card>` dan `.glass-card` sudah memiliki `backdrop-filter: blur(12px)` dari `src/app/globals.css`.
   - ❌ Salah: Menambahkan `backdrop-blur-md` atau `.glass-card` di dalam `<CardContent>`.
   - ✅ Benar: Gunakan `.glass-subtle` atau `rounded-lg border bg-card/60` untuk item di dalam `<Card>`.
3. **JANGAN membuat warna kustom di luar palet semantik**:
   - ❌ Salah: `bg-[#123456]`, `text-pink-400`, `border-purple-700`, atau `style={{ background: ... }}`
   - ✅ Benar: Gunakan hanya 5 warna aksen FinTech yang sudah ditentukan di bawah ini.

---

## 2. Tabel Keputusan Warna Semantik (Colorful FinTech Palette)

Pilih kelas warna **hanya** dari tabel berikut sesuai konteks fitur:

| Konteks Data / Fitur | Surface / Card Tint | Icon Box (`size-8` / `size-10`) | Teks / Nominal |
| :--- | :--- | :--- | :--- |
| **Utama / Brand / Saldo Total** | `surface-emerald` atau default `<Card>` | `bg-primary/10 text-primary ring-1 ring-primary/20` | `text-primary` atau `.amount-neutral` |
| **Pemasukan (Income / Surplus)** | `surface-emerald` | `bg-emerald-500/10 text-emerald-600 dark:text-emerald-400` | `.amount-income` (`text-emerald-600 dark:text-emerald-400`) |
| **Pengeluaran (Expense / Defisit)** | `surface-rose` | `bg-rose-500/10 text-rose-600 dark:text-rose-400` | `.amount-expense` (`text-rose-600 dark:text-rose-400`) |
| **Investasi / Tabungan / Prediksi AI** | `surface-indigo` | `bg-indigo-500/10 text-indigo-600 dark:text-indigo-400` | `text-indigo-600 dark:text-indigo-400` |
| **Belanja Bulanan / Peringatan Budget** | `surface-amber` | `bg-amber-500/10 text-amber-600 dark:text-amber-400` | `text-amber-600 dark:text-amber-400` |
| **Dompet (Wallet) / Transfer** | `surface-sky` | `bg-sky-500/10 text-sky-600 dark:text-sky-400` | `text-sky-600 dark:text-sky-400` |

---

## 3. Aturan Tata Letak & Spacing (Layout Boundaries)

Gunakan ukuran spacing yang tetap agar halaman selalu proporsional:

1. **Container Halaman**:
   Selalu bungkus konten halaman dengan:
   `className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6"`
2. **Jarak Antar Seksi**:
   - Antar blok besar halaman: `gap-6`
   - Antar kartu di dalam grid: `gap-4` (untuk 4 kolom KPI) atau `gap-6` (untuk 2-3 kolom konten)
   - Antar baris list di dalam kartu: `space-y-2.5` atau `space-y-3`
3. **Batas Ukuran Teks**:
   - Judul Halaman (`h1`): `text-xl font-semibold tracking-tight`
   - Deskripsi Halaman: `text-sm text-muted-foreground`
   - Judul Kartu (`CardTitle`): `text-base font-semibold` (atau `text-xs font-medium text-muted-foreground` untuk kartu KPI kecil)
   - Angka Utama KPI: `text-xl font-bold font-mono tabular-nums`

---

## 4. Template Komponen Siap Pakai (Copy-Paste Recipes)

Saat membuat halaman atau komponen baru, salin struktur JSX standar dari:
- [Component Recipes](./references/component-recipes.md)

---

## 5. Langkah Verifikasi Wajib

Setiap kali selesai mengubah file `.tsx` atau `.css`, jalankan pemeriksaan berikut:
1. Pastikan tidak ada class Tailwind v4 (`--spacing`, `-(--`).
2. Jalankan `npx tsc --noEmit` untuk memastikan tidak ada error TypeScript.

