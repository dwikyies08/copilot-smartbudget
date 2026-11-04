# SmartBudget Component & Layout Recipes

Gunakan potongan kode (*recipes*) di bawah ini sebagai cetakan dasar saat membangun halaman atau komponen baru di **SmartBudget**.

---

## 1. Header Halaman Standar (dengan Icon Box & Tombol Aksi)

```tsx
<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div className="flex items-start gap-3">
    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20">
      <HugeiconsIcon icon={DashboardSquare01Icon} className="size-5" />
    </div>
    <div>
      <h1 className="text-xl font-semibold tracking-tight">
        Judul Halaman
      </h1>
      <p className="text-sm text-muted-foreground">
        Deskripsi singkat fungsi halaman secara jelas dan minimalis
      </p>
    </div>
  </div>

  <div className="flex flex-wrap items-center gap-2">
    <Button>
      <HugeiconsIcon icon={Add01Icon} className="mr-2 size-4" />
      Aksi Utama
    </Button>
  </div>
</div>
```

---

## 2. Kartu KPI / Ringkasan (Colorful Minimalist Glass)

Gunakan `.surface-emerald`, `.surface-rose`, `.surface-indigo`, `.surface-amber`, atau `.surface-sky` pada `<Card>` jika ingin memberikan aksen warna lembut:

```tsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
  <Card className="surface-emerald">
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-xs font-medium text-muted-foreground">
        Pemasukan Bulan Ini
      </CardTitle>
      <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <HugeiconsIcon icon={ArrowDownLeft01Icon} className="size-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-xl font-bold amount-income">
        {formatIDR(incomeAmount)}
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Arus kas masuk periode berjalan
      </p>
    </CardContent>
  </Card>
</div>
```

---

## 3. Item Baris di Dalam Kartu (Gunakan `.glass-subtle`)

Jangan gunakan `.glass-card` di dalam `<Card>`. Gunakan `.glass-subtle`:

```tsx
<div className="glass-subtle flex items-center justify-between p-3 hover:bg-accent/40">
  <div className="flex items-center gap-3">
    <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
      <HugeiconsIcon icon={ArrowDownLeft01Icon} className="size-4" />
    </div>
    <div>
      <div className="text-sm font-medium">Gaji Bulanan</div>
      <div className="mt-0.5 text-xs text-muted-foreground">04 Nov 2026 · BCA</div>
    </div>
  </div>
  <div className="text-right">
    <div className="text-sm amount-income">+ {formatIDR(5000000)}</div>
  </div>
</div>
```

---

## 4. Empty State Minimalis

```tsx
<div className="glass-subtle flex flex-col items-center justify-center py-10 px-4 text-center">
  <p className="text-xs text-muted-foreground max-w-sm">
    Belum ada data yang tercatat. Tambahkan data pertama Anda untuk melihat ringkasan di sini.
  </p>
</div>
```

