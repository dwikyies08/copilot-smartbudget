# Service Layer Rules (`services/`)

1. **Kemurnian Database & Logika Bisnis**:
   - File di `services/*.service.ts` hanya berisi query **Drizzle ORM** (`@/lib/db` dan `@/lib/schema`) serta logika kalkulasi bisnis murni.
   - Selalu sertakan filter `eq(table.userId, userId)` pada query data milik user agar data antar-user terisolasi dengan aman.
   - Gunakan `db.transaction(async (tx) => { ... })` untuk operasi multi-tabel (seperti tambah/hapus transaksi yang mengubah `balance` pada `wallets`).
2. **Larangan Keras di Service Layer**:
   - **DILARANG** memanggil `await auth()` di dalam service (terima `userId: string` sebagai parameter dari Server Action).
   - **DILARANG** memanggil `revalidatePath()`, `redirect()`, atau `cookies()` dari `next/*`.

