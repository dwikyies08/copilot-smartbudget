# UI Layer Rules (`components/`)

1. **Shadcn Base UI (`@base-ui/react`, style `base-mira`)**:
   - **WAJIB** gunakan prop `render={<Component />}` untuk menggabungkan trigger/item dengan elemen lain (contoh: `<DialogTrigger render={<Button />}>Tambah</DialogTrigger>`).
   - **DILARANG KERAS** menggunakan prop `asChild`.
2. **Icons & Formatting**:
   - Gunakan `@hugeicons/react` dan `@hugeicons/core-free-icons` untuk ikon.
   - Gunakan helper `formatIDR`, `formatCompactIDR`, `formatDateID`, dan `calculateBudgetUsage` dari `@/lib/format` untuk menampilkan mata uang Rupiah, tanggal, dan persentase budget.
3. **Data & Mutasi**:
   - Panggil Server Actions dari `@/app/actions/<feature>.actions` menggunakan `useTransition` + `toast` dari `sonner`.
   - Dilarang mengimpor `@/lib/db` atau `@/services/*` di dalam Client Component (`"use client"`).

