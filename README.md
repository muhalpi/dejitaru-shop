# Dejitaru Shop

Dejitaru Shop adalah website katalog full-stack untuk jualan:
- Apps Premium
- Pulsa
- Token Listrik
- Topup Game

Semua transaksi diproses melalui WhatsApp (tanpa payment gateway).

## Tech Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn/ui
- Drizzle ORM
- PostgreSQL Neon
- MDX static blog

## Fitur Utama

- Landing page neon ungu-biru (mobile-first, glassmorphism, glow)
- Halaman produk `/produk`:
  - urut alfabetis A-Z
  - grouped per kategori
  - filter kategori
  - search nama produk
- Halaman detail `/produk/[slug]`:
  - informasi produk + syarat & ketentuan
  - selector varian dinamis (provider/nominal/jenis/durasi)
  - input customer dinamis per kategori
  - validasi Zod
  - Add to cart aktif hanya saat semua input wajib valid
- Cart drawer:
  - simpan snapshot item di `localStorage`
  - checkout WhatsApp dengan pesan terstruktur lengkap
- Blog MDX:
  - list `/blog`
  - detail `/blog/[slug]`
  - sumber konten di `content/blog`
- Admin panel `/admin`:
  - CRUD produk
  - CRUD varian
  - CRUD requirement/input field
  - edit terms & conditions
  - toggle produk populer untuk homepage
  - upload thumbnail produk via Vercel Blob
- Proteksi admin dengan middleware + env auth.

## Struktur Folder

```txt
.
├─ content/blog/                 # Post MDX
├─ drizzle/                      # SQL migration + metadata
├─ public/assets/                # Logo, hero placeholder, cover blog
├─ scripts/
│  └─ seed.ts                    # Seed idempotent
├─ src/
│  ├─ app/
│  │  ├─ admin/
│  │  ├─ api/admin/
│  │  ├─ blog/
│  │  ├─ produk/
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components/
│  │  ├─ admin/
│  │  ├─ cart/
│  │  ├─ product/
│  │  └─ ui/
│  ├─ config/contact.ts
│  ├─ data/products.ts
│  ├─ db/{client.ts,schema.ts}
│  ├─ hooks/use-cart.ts
│  └─ lib/
│     ├─ blog.ts
│     ├─ cart.ts
│     ├─ store-data.ts
│     └─ validators/
├─ .env.example
├─ drizzle.config.ts
└─ middleware.ts
```

## Setup Lokal

1. Clone repository.
2. Install dependency:
   ```bash
   npm install
   ```
3. Copy env:
   ```bash
   cp .env.example .env.local
   # Windows PowerShell:
   # Copy-Item .env.example .env.local
   ```
4. Isi `.env.local` (minimal: `DATABASE_URL`, `NEXT_PUBLIC_WHATSAPP_NUMBER`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `BLOB_READ_WRITE_TOKEN`).
5. Jalankan migration:
   ```bash
   npm run db:migrate
   ```
6. Jalankan seed:
   ```bash
   npm run db:seed
   ```
7. Jalankan dev server:
   ```bash
   npm run dev
   ```
8. Buka:
   - `http://localhost:3000` (storefront)
   - `http://localhost:3000/admin/login` (admin)

## Kualitas Build

Perintah verifikasi:

```bash
npm run lint
npm run typecheck
npm run build
```

## Database (Neon + Drizzle)

- Konfigurasi Drizzle: `drizzle.config.ts`
- Schema utama:
  - `products`
  - `product_variants`
  - `product_requirements`
- Migration SQL: folder `drizzle/`
- Seed idempotent: `scripts/seed.ts`

## Push ke GitHub

1. Inisialisasi repo jika belum:
   ```bash
   git init
   git add .
   git commit -m "feat: initial production-ready Dejitaru Shop"
   ```
2. Tambahkan remote:
   ```bash
   git remote add origin https://github.com/<username>/<repo>.git
   ```
3. Push:
   ```bash
   git branch -M main
   git push -u origin main
   ```

## Deploy ke Vercel

1. Import repository ke Vercel.
2. Tambahkan Environment Variables di Project Settings:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_WHATSAPP_NUMBER`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - `ADMIN_SESSION_SECRET` (recommended)
   - `BLOB_READ_WRITE_TOKEN` (untuk upload thumbnail produk via admin)
3. Deploy.
4. Setelah deploy, jalankan migrate + seed ke DB produksi (via local machine dengan env production, atau CI pipeline).

## Catatan Implementasi

- Tombol di card produk adalah `Lihat Detail`, bukan add to cart.
- Add to cart hanya tersedia di halaman detail produk.
- Checkout WhatsApp mengirim semua informasi item (kategori, varian terpilih, input customer, qty, subtotal, total).
- Jika `NEXT_PUBLIC_WHATSAPP_NUMBER` kosong/tidak valid, sistem memakai fallback aman untuk development.
