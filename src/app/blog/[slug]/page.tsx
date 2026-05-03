import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import { ChevronLeft } from "lucide-react";
import { getBlogPostBySlug } from "@/lib/blog";

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

const mdxComponents = {
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="mt-8 text-2xl font-bold text-white" {...props} />
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="mt-6 text-xl font-semibold text-blue-50" {...props} />
  ),
  p: (props: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="mt-4 whitespace-pre-line leading-8 text-blue-100/80" {...props} />
  ),
  a: (props: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a
      className="font-medium text-fuchsia-200 underline decoration-fuchsia-300/70 underline-offset-4 transition hover:text-fuchsia-100"
      {...props}
    />
  ),
  ul: (props: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="mt-4 list-disc space-y-2 pl-6 text-blue-100/80" {...props} />
  ),
  ol: (props: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="mt-4 list-decimal space-y-2 pl-6 text-blue-100/80" {...props} />
  ),
  li: (props: React.HTMLAttributes<HTMLLIElement>) => <li {...props} />,
  strong: (props: React.HTMLAttributes<HTMLElement>) => (
    <strong className="font-semibold text-white" {...props} />
  ),
};

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: BlogDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    return {
      title: "Artikel Tidak Ditemukan | Dejitaru Shop",
    };
  }

  return {
    title: `${post.title} | Dejitaru Shop`,
    description: post.excerpt,
  };
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-[#03041a] text-white">
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(circle_at_20%_5%,rgba(131,72,255,0.28),transparent_30%),radial-gradient(circle_at_80%_8%,rgba(0,163,255,0.20),transparent_35%),radial-gradient(circle_at_55%_65%,rgba(105,45,255,0.16),transparent_45%),linear-gradient(to_bottom,#040521,#020313)]" />

      <div className="mx-auto max-w-[900px] px-4 pb-12 pt-6 sm:px-6 lg:px-8">
        <Link
          href="/blog"
          className="mb-5 inline-flex items-center gap-2 text-sm text-fuchsia-200 transition hover:text-fuchsia-100"
        >
          <ChevronLeft className="size-4" />
          Kembali ke Blog
        </Link>

        <article className="rounded-3xl border border-white/10 bg-[#070a2d]/75 p-5 md:p-8">
          <div className="relative mb-5 h-52 overflow-hidden rounded-2xl border border-white/10 md:h-72">
            <Image
              src={post.cover}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 900px, 100vw"
              priority
            />
          </div>

          <p className="text-xs text-blue-100/55">
            {new Date(post.date).toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">{post.title}</h1>
          <p className="mt-3 text-blue-100/75">{post.excerpt}</p>

          <div className="mt-6 border-t border-white/10 pt-6">
            <MDXRemote source={post.content} components={mdxComponents} />
          </div>
        </article>
      </div>
    </div>
  );
}
