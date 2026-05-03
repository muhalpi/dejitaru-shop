import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Bolt,
  CircleHelp,
  CodeXml,
  Download,
  Headset,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
} from "lucide-react";
import { formatRupiah, getStartingPriceSummary, hasActivePromo } from "@/data/products";
import { StoreHeader } from "@/components/layout/store-header";
import { getCheckoutWhatsappNumber } from "@/config/contact";
import { getStorePopularProducts } from "@/lib/store-data";
import { getLatestBlogPosts } from "@/lib/blog";

const navLinks = [
  { label: "Beranda", href: "/" },
  { label: "Produk", href: "/produk" },
  { label: "Blog", href: "/blog" },
  { label: "Kontak", href: "#footer" },
];

const benefits = [
  {
    title: "Proses Cepat",
    description: "Langsung diproses setelah pembayaran terverifikasi.",
    icon: Bolt,
  },
  {
    title: "Garansi Aman 100%",
    description: "Transaksi aman dan terpercaya untuk semua pelanggan.",
    icon: ShieldCheck,
  },
  {
    title: "Responsif",
    description: "Bantuan cepat kapan saja saat kamu butuh.",
    icon: Headset,
  },
  {
    title: "Berkualitas",
    description: "Produk premium bergaransi dan selalu up to date.",
    icon: Star,
  },
];

const stats = [
  { value: "1000+", label: "Produk Terjual" },
  { value: "500+", label: "Pelanggan Puas" },
  { value: "24/7", label: "Support Aktif" },
  { value: "100%", label: "Garansi Aman" },
];

const testimonials = [
  {
    text: "Produk original, pengiriman cepat, dan admin sangat responsif.",
    name: "Ricky Maulana",
  },
  {
    text: "Pulsa dan token cepat masuk, proses WA-nya juga jelas.",
    name: "Indah Permata",
  },
  {
    text: "Topup game aman, data dicek dulu sebelum diproses.",
    name: "Dimas Prasetyo",
  },
];

const faqLeft = [
  {
    question: "Apakah produk yang dijual original?",
    answer:
      "Ya, kebanyakan produk yang kami jual original dan berasal dari sumber resmi. Detail produk dijelaskan transparan sebelum checkout.",
  },
  {
    question: "Bagaimana proses pengiriman produk?",
    answer:
      "Setelah pembayaran terverifikasi, pesanan diproses otomatis/manual sesuai jenis produk dan dikirim via WhatsApp atau metode yang tertera di deskripsi produk.",
  },
  {
    question: "Apakah ada garansi jika produk bermasalah?",
    answer:
      "Ada. Jika terjadi kendala valid pada masa garansi, tim kami akan bantu pengecekan dan penggantian sesuai kebijakan produk.",
  },
];

const faqRight = [
  {
    question: "Apakah bisa request produk tertentu?",
    answer:
      "Bisa. Kamu bisa kirim request lewat WhatsApp, dan kami akan informasikan ketersediaan serta estimasi prosesnya.",
  },
  {
    question: "Metode pembayaran apa saja yang tersedia?",
    answer:
      "Kami menyediakan beberapa metode pembayaran populer (transfer bank/e-wallet/QRIS) sesuai opsi yang aktif saat checkout.",
  },
  {
    question: "Bagaimana jika saya butuh bantuan?",
    answer:
      "Hubungi admin melalui WhatsApp pada jam operasional. Tim support akan membantu dari proses order sampai masalah selesai.",
  },
];

const heroImageSrc = "/assets/hero-right-placeholder.svg";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [popularProducts, latestPosts] = await Promise.all([
    getStorePopularProducts(),
    getLatestBlogPosts(4),
  ]);

  const whatsappNumber = await getCheckoutWhatsappNumber();
  const whatsappContactLink = `https://wa.me/${whatsappNumber}`;
  const resolvedNavLinks = navLinks.map((link) =>
    link.label === "Kontak" ? { ...link, href: whatsappContactLink } : link,
  );

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1160px] px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <StoreHeader
          activeLabel="Beranda"
          whatsappContactLink={whatsappContactLink}
          whatsappNumber={whatsappNumber}
        />

        <main className="space-y-8 lg:space-y-10">
          <section className="grid gap-8 rounded-3xl border border-white/10 bg-[#070a2d]/70 p-5 backdrop-blur md:p-8 lg:grid-cols-[1.1fr_1fr] lg:gap-10">
            <div className="space-y-6">
              <span className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-medium text-fuchsia-200">
                Selamat Datang di Dejitaru Shop
              </span>

              <div className="space-y-4">
                <h1 className="text-balance text-4xl font-bold leading-tight tracking-tight md:text-5xl">
                  Solusi Digital Premium untuk{" "}
                  <span className="bg-gradient-to-r from-fuchsia-400 to-blue-400 bg-clip-text text-transparent">
                    Semua Kebutuhanmu
                  </span>
                </h1>
                <p className="max-w-xl text-lg text-blue-100/75">
                  Katalog lengkap Apps Premium, Pulsa, Token Listrik, dan Topup Game.
                  Semua order diproses cepat melalui WhatsApp.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link
                  href="/produk"
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-fuchsia-600 to-blue-500 px-5 py-3 text-sm font-semibold shadow-[0_0_35px_rgba(99,102,241,0.45)] transition hover:brightness-110"
                >
                  Jelajahi Produk <ArrowRight className="size-4" />
                </Link>
                <a
                  href={whatsappContactLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-black/20 px-5 py-3 text-sm font-semibold text-white/90 transition hover:border-fuchsia-400/60 hover:text-white"
                >
                  Hubungi Kami
                </a>
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="absolute bottom-0 h-12 w-64 rounded-full bg-gradient-to-r from-fuchsia-500/45 to-blue-500/45 blur-2xl" />
              <div className="relative w-full max-w-lg rounded-[2rem] border border-fuchsia-400/40 bg-gradient-to-b from-[#121646] to-[#070a2a] p-3 shadow-[0_0_45px_rgba(110,66,255,0.45)]">
                <div className="relative aspect-[4/3] overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#06071c]">
                  <Image
                    src={heroImageSrc}
                    alt="Visual hero Dejitaru Shop"
                    fill
                    priority
                    sizes="(min-width: 1024px) 520px, 100vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050822]/65 via-transparent to-transparent" />
                </div>
              </div>

              <div className="absolute -left-3 top-8 rounded-2xl border border-fuchsia-300/40 bg-[#120f44]/75 p-3 text-fuchsia-200 shadow-[0_0_20px_rgba(181,93,255,0.45)]">
                <ShoppingCart className="size-5" />
              </div>
              <div className="absolute -left-2 bottom-20 rounded-2xl border border-blue-300/40 bg-[#0d1f4d]/75 p-3 text-blue-200 shadow-[0_0_20px_rgba(56,189,248,0.45)]">
                <CodeXml className="size-5" />
              </div>
              <div className="absolute -right-3 top-14 rounded-2xl border border-blue-300/40 bg-[#0d1f4d]/75 p-3 text-cyan-200 shadow-[0_0_20px_rgba(56,189,248,0.45)]">
                <Download className="size-5" />
              </div>
              <div className="absolute -right-2 bottom-24 rounded-2xl border border-fuchsia-300/40 bg-[#120f44]/75 p-3 text-fuchsia-200 shadow-[0_0_20px_rgba(181,93,255,0.45)]">
                <Sparkles className="size-5" />
              </div>
            </div>
          </section>

          <section className="grid gap-3 rounded-3xl border border-white/10 bg-[#060a31]/75 p-4 md:grid-cols-2 md:gap-4 lg:grid-cols-4 lg:p-5">
            {benefits.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
                >
                  <Icon className="mb-3 size-7 text-fuchsia-300" />
                  <h3 className="mb-1 text-lg font-semibold">{benefit.title}</h3>
                  <p className="text-sm text-blue-100/65">{benefit.description}</p>
                </div>
              );
            })}
          </section>

          <section id="produk" className="rounded-3xl border border-white/10 bg-[#05082e]/75 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Produk Populer</h2>
                <p className="text-sm text-blue-100/65">
                  Produk parent yang bisa diatur dari halaman admin.
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {popularProducts.map((product) => {
                  const priceSummary = getStartingPriceSummary(product);
                  const promoActive = hasActivePromo(product);

                  return (
                    <article
                      key={product.slug}
                      className="flex h-full min-h-[328px] flex-col rounded-2xl border border-white/10 bg-[#0a0f3c]/85 p-4"
                    >
                      <div className="mb-3 h-24 overflow-hidden rounded-xl border border-white/10">
                        {product.imageUrl ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </>
                        ) : (
                          <div
                            className={`flex h-full items-center justify-center bg-gradient-to-br ${product.color}`}
                          >
                            <span className="text-3xl font-extrabold tracking-wider text-white/95">
                              {product.short}
                            </span>
                          </div>
                        )}
                      </div>
                      <span className="mb-2 inline-flex w-fit rounded-full border border-fuchsia-400/40 bg-fuchsia-400/10 px-2.5 py-1 text-[11px] text-fuchsia-200">
                        {product.category}
                      </span>
                      {promoActive ? (
                        <span className="mb-2 inline-flex w-fit rounded-full border border-rose-400/50 bg-rose-500/15 px-2.5 py-1 text-[11px] text-rose-200">
                          Promo
                        </span>
                      ) : null}
                      <h3 className="mb-2 text-base font-semibold leading-snug">
                        {product.name}
                      </h3>
                      <p className="text-sm text-blue-100/65">{product.description}</p>
                      <div className="mt-auto space-y-3 pt-4">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wide text-blue-100/55">
                            Mulai dari
                          </p>
                          {priceSummary.hasPromo && priceSummary.originalPrice ? (
                            <p className="text-xs text-blue-100/45 line-through">
                              {formatRupiah(priceSummary.originalPrice)}
                            </p>
                          ) : null}
                          <p className="text-2xl font-bold text-blue-100">
                            {formatRupiah(priceSummary.price)}
                          </p>
                        </div>
                        <Link
                          href={`/produk/${product.slug}`}
                          className="block w-full rounded-lg bg-gradient-to-r from-fuchsia-600 to-blue-500 px-3 py-2 text-center text-sm font-semibold transition hover:brightness-110"
                        >
                          Lihat Detail
                        </Link>
                      </div>
                    </article>
                  );
                })}
            </div>
 
            <Link
              href="/produk"
              className="mt-5 flex items-center justify-center gap-3 rounded-xl bg-gradient-to-r from-fuchsia-700 to-blue-600 px-5 py-3 text-center text-base font-semibold transition hover:brightness-110"
            >
              Lihat Semua Produk <ArrowRight className="size-4" />
            </Link>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            <article className="rounded-3xl border border-white/10 bg-[#05082f]/75 p-5 md:p-6">
              <h2 className="mb-4 text-2xl font-bold">Tentang Kami</h2>
              <p className="mb-6 text-sm leading-7 text-blue-100/70 md:text-base">
                Dejitaru Shop hadir untuk menyediakan berbagai produk digital
                berkualitas dengan harga terjangkau. Kami berkomitmen memberi
                pengalaman belanja yang aman, cepat, dan nyaman untuk setiap pelanggan.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="rounded-xl border border-white/10 bg-white/[0.02] p-3"
                  >
                    <p className="text-xl font-bold text-fuchsia-300">{stat.value}</p>
                    <p className="text-sm text-blue-100/70">{stat.label}</p>
                  </div>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-white/10 bg-[#05082f]/75 p-5 md:p-6">
              <h2 className="mb-4 text-2xl font-bold">Testimoni</h2>
              <div className="grid gap-3 md:grid-cols-3">
                {testimonials.map((testimonial) => (
                  <div
                    key={testimonial.name}
                    className="rounded-2xl border border-white/10 bg-[#090d39]/80 p-4"
                  >
                    <div className="mb-2 flex gap-0.5 text-yellow-300">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={`${testimonial.name}-${idx}`} className="size-3.5 fill-current" />
                      ))}
                    </div>
                    <p className="mb-4 text-sm text-blue-100/70">{testimonial.text}</p>
                    <p className="text-sm font-semibold">{testimonial.name}</p>
                    <p className="text-xs text-blue-100/55">Pelanggan</p>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#05082f]/75 p-4 md:p-6">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-2xl font-bold">Blog Terbaru</h2>
                <p className="text-sm text-blue-100/65">
                  Insight dan tips terbaru seputar produk digital.
                </p>
              </div>
              <Link
                href="/blog"
                className="rounded-lg border border-white/20 px-4 py-2 text-sm transition hover:border-fuchsia-400/60"
              >
                Lihat Semua Blog
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {latestPosts.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-[#090d39]/70 p-6 text-center text-blue-100/75 md:col-span-2 xl:col-span-4">
                  Belum ada artikel terbaru.
                </div>
              ) : (
                latestPosts.map((post) => (
                  <article
                    key={post.slug}
                    className="rounded-2xl border border-white/10 bg-[#0a0f3e]/85 p-4"
                  >
                    <Link
                      href={`/blog/${post.slug}`}
                      className="group relative mb-3 block h-28 overflow-hidden rounded-xl border border-white/10"
                    >
                      <Image
                        src={post.cover}
                        alt={post.title}
                        fill
                        className="object-cover transition duration-300 group-hover:scale-[1.03]"
                        sizes="(min-width: 1280px) 250px, (min-width: 768px) 45vw, 100vw"
                      />
                    </Link>
                    <p className="mb-1 text-xs text-blue-100/55">
                      {new Date(post.date).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                    <h3 className="mb-2 text-sm font-semibold leading-snug md:text-base">
                      <Link
                        href={`/blog/${post.slug}`}
                        className="transition hover:text-fuchsia-200"
                      >
                        {post.title}
                      </Link>
                    </h3>
                    <p className="text-sm text-blue-100/65">{post.excerpt}</p>
                    <Link
                      href={`/blog/${post.slug}`}
                      className="mt-3 inline-flex items-center gap-1 text-sm text-fuchsia-200 transition hover:text-fuchsia-100"
                    >
                      Baca Selengkapnya <ArrowRight className="size-4" />
                    </Link>
                  </article>
                ))
              )}
            </div>
          </section>

          <section className="rounded-3xl border border-white/10 bg-[#05082f]/75 p-4 md:p-6">
            <h2 className="mb-1 text-2xl font-bold">FAQ</h2>
            <p className="mb-4 text-sm text-blue-100/65">Pertanyaan yang sering ditanyakan.</p>

            <div className="grid gap-3 lg:grid-cols-2">
              {[faqLeft, faqRight].map((column, columnIndex) => (
                <div key={`faq-column-${columnIndex}`} className="space-y-3">
                  {column.map((item) => (
                    <details
                      key={item.question}
                      className="group rounded-xl border border-white/10 bg-[#090e3a]/75 px-4 py-3 transition hover:border-fuchsia-400/45"
                    >
                      <summary className="flex cursor-pointer list-none items-center justify-between text-left text-sm text-blue-50/95">
                        <span className="inline-flex items-center gap-2">
                          <CircleHelp className="size-4 text-fuchsia-300" />
                          {item.question}
                        </span>
                        <Plus className="size-4 text-blue-100/70 transition group-open:rotate-45" />
                      </summary>
                      <p className="pt-2 text-sm leading-relaxed text-blue-100/70">
                        {item.answer}
                      </p>
                    </details>
                  ))}
                </div>
              ))}
            </div>
          </section>
        </main>

        <footer id="footer" className="mt-8 rounded-3xl border border-white/10 bg-[#04062a]/85 p-5 md:mt-10 md:p-6">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-5">
            <div className="space-y-3 xl:col-span-2">
              <Image
                src="/assets/logo-dejitaru-shop.png"
                alt="Dejitaru Shop"
                width={250}
                height={82}
                className="h-12 w-auto sm:h-14"
              />
              <p className="max-w-sm text-sm text-blue-100/65">
                Solusi digital premium untuk meningkatkan produktivitas, kreativitas,
                dan hiburan dengan layanan cepat dan terpercaya.
              </p>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Navigasi</h3>
              <ul className="space-y-2 text-sm text-blue-100/65">
                {resolvedNavLinks.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className="transition hover:text-blue-100">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Informasi</h3>
              <ul className="space-y-2 text-sm text-blue-100/65">
                <li>Cara Pembelian</li>
                <li>Kebijakan Refund</li>
                <li>Syarat &amp; Ketentuan</li>
                <li>FAQ</li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-semibold">Hubungi Kami</h3>
              <ul className="space-y-2 text-sm text-blue-100/65">
                <li>
                  <a href={whatsappContactLink} target="_blank" rel="noopener noreferrer">
                    +{whatsappNumber}
                  </a>
                </li>
                <li>halo@dejitarushop.id</li>
                <li>Malang, Jawa Timur, Indonesia</li>
                <li>Setiap hari 09.00 - 21.00 WIB</li>
              </ul>
            </div>
          </div>

          <div className="mt-6 border-t border-white/10 pt-4 text-center text-sm text-blue-100/55">
            2026 Dejitaru Shop. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
