# SmartBudget Agent Boundaries (Styling, Layout & Architecture)

Dokumen ini menetapkan **batas tegas (hard boundaries)** bagi AI Agent (termasuk model ringan / *low-parameter models*) saat membuat atau memodifikasi komponen UI, styling CSS, dan tata letak halaman pada proyek **SmartBudget**.

---

## 1. Hard Boundaries: CSS & Tailwind (WAJIB DITAATI)

1. **Gunakan Sintaks Tailwind CSS v3 Murni**:
   - **DILARANG KERAS** menggunakan sintaks Tailwind v4 seperti `--spacing(6)`, `bg-(--var)`, `w-(--sidebar-width)`, `@import "tailwindcss"`, atau `@theme inline`.
   - **GUNAKAN** sintaks standar Tailwind v3: `h-6`, `p-4`, `bg-primary`, `bg-card`, atau `w-[var(--sidebar-width)]`.
2. **Dilarang Menulis Warna Hex / RGB / OKLCH Mentah di JSX**:
   - **DILARANG**: `bg-[#10b981]`, `text-[rgb(244,63,94)]`, atau inline style warna manual.
   - **GUNAKAN** token semantik dari `globals.css` atau palet warna FinTech yang disetujui:
     - **Brand / Utama**: `primary` (`bg-primary`, `text-primary`, `bg-primary/10`, `ring-primary/20`)
     - **Pemasukan (Income / Surplus)**: `emerald` (`text-emerald-600 dark:text-emerald-400`, `bg-emerald-500/10`, `.amount-income`, `.surface-emerald`)
     - **Pengeluaran (Expense / Defisit)**: `rose` atau `destructive` (`text-rose-600 dark:text-rose-400`, `bg-rose-500/10`, `.amount-expense`, `.surface-rose`)
     - **Investasi / Tabungan**: `indigo` (`text-indigo-600 dark:text-indigo-400`, `bg-indigo-500/10`, `.surface-indigo`)
     - **Belanja / Peringatan Budget**: `amber` (`text-amber-600 dark:text-amber-400`, `bg-amber-500/10`, `.surface-amber`)
     - **Dompet / Transfer / Info**: `sky` (`text-sky-600 dark:text-sky-400`, `bg-sky-500/10`, `.surface-sky`)
3. **Aturan "Simple Glass Essence" (Maksimal 1 Lapisan Blur)**:
   - Komponen `<Card>` (`[data-slot="card"]`) dan class `.glass-card` di `src/app/globals.css` **sudah otomatis memiliki efek glass (`backdrop-blur`)**.
   - **DILARANG** menumpuk `backdrop-blur-*` di dalam elemen yang sudah berada di dalam `<Card>` atau `.glass-card` (nested blur merusak performa dan tampilan).
   - Untuk elemen baris/item di dalam `<Card>`, gunakan `.glass-subtle` atau `rounded-lg border bg-card/60 p-3`.

---

## 2. Layout Boundaries (Formula Tata Letak Standar)

Agar tampilan konsisten, rapi, dan minimalis di semua ukuran layar, gunakan **hanya** struktur container berikut:

1. **Wrapper Halaman Utama (`page.tsx` di dalam `(protected)`)**:
   ```tsx
   <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 p-4 md:p-6">
     {/* 1. Header Halaman */}
     {/* 2. <Separator /> */}
     {/* 3. Konten (KPI Grid / Split Grid / Tabel) */}
   </div>
   ```
2. **Grid Kartu Ringkasan / KPI (Maksimal 4 Kolom)**:
   - Gunakan: `grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4`
3. **Grid Konten Utama & Samping (Chart + Progress / Insight)**:
   - Gunakan: `grid grid-cols-1 gap-6 lg:grid-cols-3` (Komponen utama `lg:col-span-2`, panel samping `lg:col-span-1`).
4. **Tipografi Nominal Uang (IDR)**:
   - Selalu gunakan helper `formatIDR(amount)` dari `@/lib/format`.
   - Selalu tambahkan `font-mono tabular-nums` (atau gunakan class `.amount-income`, `.amount-expense`, `.amount-neutral`) pada elemen yang menampilkan nominal uang agar angka sejajar rapi.

---

## 3. Referensi Skill UI Styling

Untuk panduan langkah demi langkah dan template kode siap pakai (*copy-paste recipes*), baca skill:
- `.agents/skills/smartbudget-ui-styling/SKILL.md`

