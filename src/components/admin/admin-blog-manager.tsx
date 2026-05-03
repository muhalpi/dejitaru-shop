"use client";

import { FormEvent, KeyboardEvent, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import type { AdminBlogPost } from "@/lib/admin-blog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type AdminBlogManagerProps = {
  initialPosts: AdminBlogPost[];
};

type BlogForm = {
  title: string;
  slug: string;
  excerpt: string;
  cover: string;
  publishedAt: string;
  content: string;
};

type MarkdownAction = {
  label: string;
  title: string;
  kind: "wrap" | "line-prefix";
  prefix: string;
  suffix: string;
  placeholder: string;
  hotkey?: string;
};

const markdownActions: MarkdownAction[] = [
  {
    label: "Bold",
    title: "Bold",
    kind: "wrap",
    prefix: "**",
    suffix: "**",
    placeholder: "teks tebal",
    hotkey: "Ctrl+B",
  },
  {
    label: "Italic",
    title: "Italic",
    kind: "wrap",
    prefix: "*",
    suffix: "*",
    placeholder: "teks miring",
    hotkey: "Ctrl+I",
  },
  {
    label: "Inline Code",
    title: "Inline Code",
    kind: "wrap",
    prefix: "`",
    suffix: "`",
    placeholder: "kode",
  },
  {
    label: "H2",
    title: "Heading 2",
    kind: "line-prefix",
    prefix: "## ",
    suffix: "",
    placeholder: "Judul Bagian",
  },
  {
    label: "H3",
    title: "Heading 3",
    kind: "line-prefix",
    prefix: "### ",
    suffix: "",
    placeholder: "Subjudul",
  },
  {
    label: "Bullet",
    title: "Bullet List",
    kind: "line-prefix",
    prefix: "- ",
    suffix: "",
    placeholder: "Item daftar",
  },
  {
    label: "Number",
    title: "Numbered List",
    kind: "line-prefix",
    prefix: "1. ",
    suffix: "",
    placeholder: "Item bernomor",
  },
  {
    label: "Link",
    title: "Link",
    kind: "wrap",
    prefix: "[",
    suffix: "](https://example.com)",
    placeholder: "Teks link",
    hotkey: "Ctrl+K",
  },
  {
    label: "Quote",
    title: "Quote",
    kind: "line-prefix",
    prefix: "> ",
    suffix: "",
    placeholder: "Kutipan",
  },
  {
    label: "{ }",
    title: "Code block",
    kind: "wrap",
    prefix: "```md\n",
    suffix: "\n```",
    placeholder: "Tulis kode di sini",
  },
];

function buildFormattedText(
  text: string,
  start: number,
  end: number,
  action: MarkdownAction,
) {
  if (action.kind === "line-prefix") {
    const lineStart = text.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
    const lineEndIndex = text.indexOf("\n", end);
    const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;
    const before = text.slice(0, lineStart);
    const selectedBlock = text.slice(lineStart, lineEnd) || action.placeholder;
    const after = text.slice(lineEnd);
    const lines = selectedBlock.split("\n");
    const transformed = lines
      .map((line) => {
        if (line.trim().length === 0) {
          return action.prefix.trim();
        }

        const escapedPrefix = action.prefix.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
        const normalized = line.replace(new RegExp(`^${escapedPrefix}`), "");
        return `${action.prefix}${normalized}`;
      })
      .join("\n");

    const nextText = `${before}${transformed}${after}`;
    const nextStart = lineStart;
    const nextEnd = lineStart + transformed.length;

    return { nextText, nextStart, nextEnd };
  }

  const before = text.slice(0, start);
  const selected = text.slice(start, end) || action.placeholder;
  const after = text.slice(end);
  const inserted = `${action.prefix}${selected}${action.suffix}`;
  const nextText = `${before}${inserted}${after}`;
  const nextStart = start + action.prefix.length;
  const nextEnd = nextStart + selected.length;

  return { nextText, nextStart, nextEnd };
}

function getLineBounds(text: string, cursor: number) {
  const lineStart = text.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
  const lineEndIndex = text.indexOf("\n", cursor);
  const lineEnd = lineEndIndex === -1 ? text.length : lineEndIndex;

  return { lineStart, lineEnd };
}

function applySmartListEnter(text: string, cursor: number) {
  const { lineStart, lineEnd } = getLineBounds(text, cursor);
  const lineText = text.slice(lineStart, lineEnd);
  const orderedMatch = lineText.match(/^(\s*)(\d+)\.\s?(.*)$/);
  const bulletMatch = lineText.match(/^(\s*)([-*+])\s?(.*)$/);

  if (!orderedMatch && !bulletMatch) {
    return null;
  }

  const before = text.slice(0, lineStart);
  const after = text.slice(lineEnd);

  if (orderedMatch) {
    const indent = orderedMatch[1] ?? "";
    const currentNumber = Number(orderedMatch[2] ?? "1");
    const content = orderedMatch[3] ?? "";

    if (content.trim().length === 0) {
      const nextText = `${before}${after.startsWith("\n") ? after.slice(1) : after}`;
      const nextCursor = lineStart;
      return { nextText, nextCursor };
    }

    const nextMarker = `${indent}${currentNumber + 1}. `;
    const splitAt = cursor;
    const nextText = `${text.slice(0, splitAt)}\n${nextMarker}${text.slice(splitAt)}`;
    const nextCursor = splitAt + 1 + nextMarker.length;
    return { nextText, nextCursor };
  }

  const indent = bulletMatch?.[1] ?? "";
  const marker = bulletMatch?.[2] ?? "-";
  const content = bulletMatch?.[3] ?? "";

  if (content.trim().length === 0) {
    const nextText = `${before}${after.startsWith("\n") ? after.slice(1) : after}`;
    const nextCursor = lineStart;
    return { nextText, nextCursor };
  }

  const nextMarker = `${indent}${marker} `;
  const splitAt = cursor;
  const nextText = `${text.slice(0, splitAt)}\n${nextMarker}${text.slice(splitAt)}`;
  const nextCursor = splitAt + 1 + nextMarker.length;
  return { nextText, nextCursor };
}

function MarkdownToolbar({ onApply }: { onApply: (action: MarkdownAction) => void }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1">
      {markdownActions.map((action) => (
        <Button
          key={action.title}
          type="button"
          size="sm"
          variant="outline"
          className="border-white/25 bg-transparent text-blue-100 hover:border-fuchsia-400/60 hover:bg-white/10 hover:text-white"
          onClick={() => onApply(action)}
          title={action.hotkey ? `${action.title} (${action.hotkey})` : action.title}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}

function toDateTimeLocal(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "";
  }

  const yyyy = parsed.getFullYear();
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const dd = String(parsed.getDate()).padStart(2, "0");
  const hh = String(parsed.getHours()).padStart(2, "0");
  const mi = String(parsed.getMinutes()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

function fromDateTimeLocal(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString();
  }

  return parsed.toISOString();
}

function stringifyError(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  if (value && typeof value === "object") {
    try {
      return JSON.stringify(value);
    } catch {
      return "Request gagal";
    }
  }

  return "Request gagal";
}

async function apiJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload = (await response.json().catch(() => null)) as
    | T
    | { error?: unknown }
    | null;

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "error" in payload
        ? stringifyError(payload.error)
        : "Request gagal";

    throw new Error(message || "Request gagal");
  }

  return payload as T;
}

function emptyForm(): BlogForm {
  return {
    title: "",
    slug: "",
    excerpt: "",
    cover: "",
    publishedAt: toDateTimeLocal(new Date().toISOString()),
    content: "",
  };
}

function mapPostToForm(post: AdminBlogPost): BlogForm {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    cover: post.cover,
    publishedAt: toDateTimeLocal(post.publishedAt),
    content: post.content,
  };
}

export function AdminBlogManager({ initialPosts }: AdminBlogManagerProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(
    initialPosts[0]?.id ?? null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(initialPosts.length === 0);
  const [createForm, setCreateForm] = useState<BlogForm>(() => emptyForm());
  const [editDraftById, setEditDraftById] = useState<Record<string, string>>({});
  const createContentRef = useRef<HTMLTextAreaElement | null>(null);
  const editContentRef = useRef<HTMLTextAreaElement | null>(null);

  const selectedPost = useMemo(
    () => posts.find((item) => item.id === selectedPostId) ?? null,
    [posts, selectedPostId],
  );

  async function refreshPosts(successMessage?: string) {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiJson<{ posts: AdminBlogPost[] }>("/api/admin/blog-posts");
      setPosts(
        (data.posts ?? []).map((post) => ({
          ...post,
          publishedAt: new Date(post.publishedAt).toISOString(),
        })),
      );
      if (data.posts.length === 0) {
        setSelectedPostId(null);
      } else if (!data.posts.some((item) => item.id === selectedPostId)) {
        setSelectedPostId(data.posts[0].id);
      }

      if (successMessage) {
        setFeedback(successMessage);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat blog.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      await apiJson("/api/admin/blog-posts", {
        method: "POST",
        body: JSON.stringify({
          ...createForm,
          publishedAt: fromDateTimeLocal(createForm.publishedAt),
        }),
      });

      setCreateForm(emptyForm());
      setShowCreate(false);
      await refreshPosts("Artikel baru berhasil ditambahkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal membuat artikel.");
      setIsLoading(false);
    }
  }

  async function handleUpdate(postId: string, formData: FormData) {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      await apiJson(`/api/admin/blog-posts/${postId}`, {
        method: "PATCH",
        body: JSON.stringify({
          title: String(formData.get("title") ?? ""),
          slug: String(formData.get("slug") ?? ""),
          excerpt: String(formData.get("excerpt") ?? ""),
          cover: String(formData.get("cover") ?? ""),
          publishedAt: fromDateTimeLocal(String(formData.get("publishedAt") ?? "")),
          content: String(formData.get("content") ?? ""),
        }),
      });

      await refreshPosts("Artikel berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui artikel.");
      setIsLoading(false);
    }
  }

  async function handleDelete(postId: string, title: string) {
    const confirmed = confirm(`Hapus artikel "${title}"?`);

    if (!confirmed) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      await apiJson(`/api/admin/blog-posts/${postId}`, { method: "DELETE" });
      await refreshPosts("Artikel berhasil dihapus.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menghapus artikel.");
      setIsLoading(false);
    }
  }

  function applyCreateFormatting(action: MarkdownAction) {
    const textarea = createContentRef.current;

    if (!textarea) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const { nextText, nextStart, nextEnd } = buildFormattedText(
      textarea.value,
      start,
      end,
      action,
    );

    setCreateForm((current) => ({ ...current, content: nextText }));

    requestAnimationFrame(() => {
      const target = createContentRef.current;
      if (!target) {
        return;
      }

      target.focus();
      target.setSelectionRange(nextStart, nextEnd);
    });
  }

  function applyEditFormatting(action: MarkdownAction) {
    const textarea = editContentRef.current;

    if (!textarea || !selectedPost) {
      return;
    }

    const start = textarea.selectionStart ?? 0;
    const end = textarea.selectionEnd ?? start;
    const { nextText, nextStart, nextEnd } = buildFormattedText(
      textarea.value,
      start,
      end,
      action,
    );

    setEditDraftById((current) => ({
      ...current,
      [selectedPost.id]: nextText,
    }));
    requestAnimationFrame(() => {
      const target = editContentRef.current;
      if (!target) {
        return;
      }

      target.focus();
      target.setSelectionRange(nextStart, nextEnd);
    });
  }

  function handleMarkdownHotkey(
    event: KeyboardEvent<HTMLTextAreaElement>,
    applyAction: (action: MarkdownAction) => void,
  ) {
    if (!(event.ctrlKey || event.metaKey)) {
      return;
    }

    const key = event.key.toLowerCase();
    const matchedAction =
      key === "b"
        ? markdownActions.find((item) => item.title === "Bold")
        : key === "i"
          ? markdownActions.find((item) => item.title === "Italic")
          : key === "k"
            ? markdownActions.find((item) => item.title === "Link")
            : undefined;

    if (!matchedAction) {
      return;
    }

    event.preventDefault();
    applyAction(matchedAction);
  }

  function handleCreateContentKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    handleMarkdownHotkey(event, applyCreateFormatting);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    const textarea = createContentRef.current;
    if (!textarea) {
      return;
    }

    const cursor = textarea.selectionStart ?? 0;
    const result = applySmartListEnter(textarea.value, cursor);

    if (!result) {
      return;
    }

    event.preventDefault();
    setCreateForm((current) => ({ ...current, content: result.nextText }));
    requestAnimationFrame(() => {
      const target = createContentRef.current;
      if (!target) {
        return;
      }
      target.focus();
      target.setSelectionRange(result.nextCursor, result.nextCursor);
    });
  }

  function handleEditContentKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    handleMarkdownHotkey(event, applyEditFormatting);
    if (event.defaultPrevented) {
      return;
    }

    if (event.key !== "Enter" || event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) {
      return;
    }

    if (!selectedPost) {
      return;
    }

    const textarea = editContentRef.current;
    if (!textarea) {
      return;
    }

    const cursor = textarea.selectionStart ?? 0;
    const result = applySmartListEnter(textarea.value, cursor);

    if (!result) {
      return;
    }

    event.preventDefault();
    setEditDraftById((current) => ({
      ...current,
      [selectedPost.id]: result.nextText,
    }));
    requestAnimationFrame(() => {
      const target = editContentRef.current;
      if (!target) {
        return;
      }
      target.focus();
      target.setSelectionRange(result.nextCursor, result.nextCursor);
    });
  }

  return (
    <div className="space-y-4">
      <section className="grid gap-4 md:grid-cols-3">
        <Card className="border-white/10 bg-[#070a2d]/75 text-white md:col-span-1">
          <CardHeader className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="text-lg">Daftar Artikel</CardTitle>
              <Button
                type="button"
                size="icon"
                variant="outline"
                disabled={isLoading}
                onClick={() => refreshPosts("Data blog diperbarui.")}
                className="border-white/20 bg-transparent text-blue-100 hover:border-fuchsia-400/50"
              >
                <RefreshCw className={`size-4 ${isLoading ? "animate-spin" : ""}`} />
              </Button>
            </div>
            <Button
              type="button"
              onClick={() => setShowCreate((current) => !current)}
              className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
            >
              <Plus className="mr-2 size-4" />
              {showCreate ? "Tutup Form Buat" : "Buat Artikel"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-2">
            {posts.length === 0 ? (
              <p className="rounded-lg border border-white/10 bg-[#0b103d]/50 px-3 py-2 text-sm text-blue-100/70">
                Belum ada artikel.
              </p>
            ) : (
              posts.map((post) => (
                <button
                  key={post.id}
                  type="button"
                  onClick={() => setSelectedPostId(post.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                    selectedPostId === post.id
                      ? "border-fuchsia-400/60 bg-fuchsia-500/15"
                      : "border-white/15 bg-[#0b103d]/55 hover:border-fuchsia-400/50"
                  }`}
                >
                  <p className="text-sm font-semibold">{post.title}</p>
                  <p className="mt-0.5 text-xs text-blue-100/65">{post.slug}</p>
                </button>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-[#070a2d]/75 text-white md:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">{showCreate ? "Buat Artikel Baru" : "Edit Artikel"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {feedback ? (
              <p className="rounded-lg border border-emerald-400/45 bg-emerald-500/15 px-3 py-2 text-sm text-emerald-100">
                {feedback}
              </p>
            ) : null}
            {error ? (
              <p className="rounded-lg border border-rose-400/45 bg-rose-500/15 px-3 py-2 text-sm text-rose-100">
                {error}
              </p>
            ) : null}

            {showCreate ? (
              <form onSubmit={handleCreate} className="space-y-3">
                <Input
                  value={createForm.title}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, title: event.target.value }))
                  }
                  placeholder="Judul artikel"
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Input
                  value={createForm.slug}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, slug: event.target.value }))
                  }
                  placeholder="slug-artikel"
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Input
                  value={createForm.cover}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, cover: event.target.value }))
                  }
                  placeholder="/assets/blog-cover.jpg"
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Input
                  type="datetime-local"
                  value={createForm.publishedAt}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, publishedAt: event.target.value }))
                  }
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Textarea
                  value={createForm.excerpt}
                  onChange={(event) =>
                    setCreateForm((current) => ({ ...current, excerpt: event.target.value }))
                  }
                  placeholder="Ringkasan artikel"
                  className="min-h-24 border-white/20 bg-[#0b103d]/80"
                  required
                />
                <div>
                  <p className="mb-1 text-xs text-blue-100/70">Formatting cepat</p>
                  <MarkdownToolbar onApply={applyCreateFormatting} />
                  <p className="mb-1 text-[11px] text-blue-100/55">
                    Shortcut: Ctrl/Cmd + B (bold), I (italic), K (link)
                  </p>
                  <p className="mb-1 text-[11px] text-blue-100/55">
                    Enter sekarang akan tampil sebagai baris baru. Untuk numbered list, cukup satu
                    item per baris.
                  </p>
                  <Textarea
                    ref={createContentRef}
                    value={createForm.content}
                    onChange={(event) =>
                      setCreateForm((current) => ({ ...current, content: event.target.value }))
                    }
                    onKeyDown={handleCreateContentKeyDown}
                    placeholder="Konten markdown/MDX artikel"
                    className="min-h-52 border-white/20 bg-[#0b103d]/80"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
                >
                  Simpan Artikel
                </Button>
              </form>
            ) : selectedPost ? (
              <form
                key={selectedPost.id}
                onSubmit={async (event) => {
                  event.preventDefault();
                  await handleUpdate(selectedPost.id, new FormData(event.currentTarget));
                }}
                className="space-y-3"
              >
                <Input
                  name="title"
                  defaultValue={selectedPost.title}
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Input
                  name="slug"
                  defaultValue={selectedPost.slug}
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Input
                  name="cover"
                  defaultValue={selectedPost.cover}
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Input
                  name="publishedAt"
                  type="datetime-local"
                  defaultValue={mapPostToForm(selectedPost).publishedAt}
                  className="border-white/20 bg-[#0b103d]/80"
                  required
                />
                <Textarea
                  name="excerpt"
                  defaultValue={selectedPost.excerpt}
                  className="min-h-24 border-white/20 bg-[#0b103d]/80"
                  required
                />
                <div>
                  <p className="mb-1 text-xs text-blue-100/70">Formatting cepat</p>
                  <MarkdownToolbar onApply={applyEditFormatting} />
                  <p className="mb-1 text-[11px] text-blue-100/55">
                    Shortcut: Ctrl/Cmd + B (bold), I (italic), K (link)
                  </p>
                  <p className="mb-1 text-[11px] text-blue-100/55">
                    Enter sekarang akan tampil sebagai baris baru. Untuk numbered list, cukup satu
                    item per baris.
                  </p>
                  <Textarea
                    ref={editContentRef}
                    name="content"
                    value={editDraftById[selectedPost.id] ?? selectedPost.content}
                    onChange={(event) =>
                      setEditDraftById((current) => ({
                        ...current,
                        [selectedPost.id]: event.target.value,
                      }))
                    }
                    onKeyDown={handleEditContentKeyDown}
                    className="min-h-52 border-white/20 bg-[#0b103d]/80"
                    required
                  />
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
                  >
                    Simpan Perubahan
                  </Button>
                  <Button
                    type="button"
                    variant="destructive"
                    disabled={isLoading}
                    onClick={() => handleDelete(selectedPost.id, selectedPost.title)}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Hapus Artikel
                  </Button>
                </div>
              </form>
            ) : (
              <p className="rounded-lg border border-white/10 bg-[#0b103d]/50 px-3 py-2 text-sm text-blue-100/70">
                Pilih artikel di panel kiri untuk mulai edit.
              </p>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
