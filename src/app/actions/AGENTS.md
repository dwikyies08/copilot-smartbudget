# Server Actions Layer Rules (`app/actions/`)

1. **Struktur Wajib Server Action**:
   - Baris pertama **WAJIB** `"use server"`.
   - Setiap fungsi publik wajib mengembalikan `Promise<ActionResponse<T>>` dari `@/types`.
2. **Alur Eksekusi 4 Langkah**:
   - **Langkah 1 (Auth)**: Periksa sesi `const session = await auth()`. Jika `!session?.user?.id`, kembalikan `{ success: false, error: "Sesi berakhir, silakan login kembali." }`.
   - **Langkah 2 (Validasi Zod)**: Validasi input menggunakan `schema.safeParse(rawInput)` dari `@/validations` dan `formatZodErrors(parsed.error)`.
   - **Langkah 3 (Panggil Service)**: Panggil fungsi dari `@/services/<feature>.service`. **DILARANG** menulis query `db.*` langsung di dalam file action.
   - **Langkah 4 (Revalidate)**: Panggil `revalidatePath(...)` setelah mutasi berhasil, lalu kembalikan `{ success: true, data }`.

