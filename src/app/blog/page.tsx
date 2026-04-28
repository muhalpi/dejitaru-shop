import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { CartControl } from "@/components/cart/cart-control";
import { getAllBlogPosts } from "@/lib/blog";

export const dynamic = "force-static";

export default async function BlogPage() {
  const posts = await getAllBlogPosts();

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[1160px] px-4 pb-12 pt-4 sm:px-6 lg:px-8 lg:pt-6">
        <header className="mb-8 flex items-center justify-between rounded-2xl border border-white/10 bg-[#080a2f]/80 px-4 py-3 backdrop-blur md:mb-10 md:px-6">
          <Link href="/" className="inline-flex">
            <Image
              src="/assets/logo-dejitaru-shop.png"
              alt="Dejitaru Shop"
              width={250}
              height={82}
              priority
              className="h-12 w-auto sm:h-14"
            />
          </Link>

          <nav className="hidden items-center gap-10 text-sm text-white/80 md:flex">
            <Link href="/" className="transition hover:text-white">
              Beranda
            </Link>
            <Link href="/produk" className="transition hover:text-white">
              Produk
            </Link>
            <Link
              href="/blog"
              className="border-b-2 border-fuchsia-400 pb-1 text-fuchsia-300 transition hover:text-white"
            >
              Blog
            </Link>
            <a href="#footer" className="transition hover:text-white">
              Kontak
            </a>
          </nav>

          <CartControl />
        </header>

        <main className="space-y-6">
          <section className="rounded-3xl border border-white/10 bg-[#070a2d]/70 p-5 backdrop-blur md:p-8">
            <span className="inline-flex rounded-full border border-fuchsia-400/40 bg-fuchsia-500/15 px-4 py-2 text-sm font-medium text-fuchsia-200">
              Blog Dejitaru Shop
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Insight Produk Digital
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-blue-100/70 md:text-base">
              Artikel tips pembelian, panduan penggunaan produk, dan update promo terbaru.
            </p>
          </section>

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {posts.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#090d39]/70 p-6 text-center text-blue-100/75 md:col-span-2 xl:col-span-3">
                Belum ada artikel tersedia.
              </div>
            ) : (
              posts.map((post) => (
                <article
                  key={post.slug}
                  className="flex flex-col rounded-2xl border border-white/10 bg-[#0a0f3e]/85 p-4"
                >
                  <div className="relative mb-3 h-36 overflow-hidden rounded-xl border border-white/10">
                    <Image
                      src={post.cover}
                      alt={post.title}
                      fill
                      className="object-cover"
                      sizes="(min-width: 1280px) 350px, (min-width: 768px) 45vw, 100vw"
                    />
                  </div>
                  <p className="mb-1 text-xs text-blue-100/55">
                    {new Date(post.date).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <h2 className="mb-2 text-base font-semibold leading-snug md:text-lg">
                    {post.title}
                  </h2>
                  <p className="text-sm text-blue-100/65">{post.excerpt}</p>

                  <Link
                    href={`/blog/${post.slug}`}
                    className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-semibold text-fuchsia-200 transition hover:text-fuchsia-100"
                  >
                    Baca Selengkapnya <ArrowRight className="size-4" />
                  </Link>
                </article>
              ))
            )}
          </section>
        </main>

        <footer id="footer" className="mt-8 rounded-3xl border border-white/10 bg-[#04062a]/85 p-5 text-center text-sm text-blue-100/60 md:mt-10 md:p-6">
          2026 Dejitaru Shop. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
