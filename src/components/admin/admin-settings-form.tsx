"use client";

import { FormEvent, useState } from "react";
import { Save } from "lucide-react";
import { sanitizeWhatsappNumber } from "@/lib/whatsapp";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type AdminSettingsFormProps = {
  initialWhatsappNumber: string;
};

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

export function AdminSettingsForm({ initialWhatsappNumber }: AdminSettingsFormProps) {
  const [whatsappNumber, setWhatsappNumber] = useState(initialWhatsappNumber);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const payload = await apiJson<{ whatsappNumber: string }>("/api/admin/settings", {
        method: "PATCH",
        body: JSON.stringify({ whatsappNumber }),
      });

      setWhatsappNumber(payload.whatsappNumber);
      setFeedback("Nomor WhatsApp berhasil diperbarui.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan pengaturan.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="border-white/10 bg-[#070a2d]/75 text-white">
      <CardHeader>
        <CardTitle>Pengaturan Kontak</CardTitle>
        <CardDescription className="text-blue-100/70">
          Nomor ini dipakai untuk tombol kontak dan checkout WhatsApp.
        </CardDescription>
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

        <form onSubmit={handleSubmit} className="space-y-3">
          <label className="block space-y-1">
            <span className="text-sm text-blue-100/80">Nomor WhatsApp (format internasional)</span>
            <Input
              value={whatsappNumber}
              onChange={(event) => setWhatsappNumber(event.target.value)}
              placeholder="6281234567890"
              className="border-white/20 bg-[#0b103d]/80"
              required
            />
            <span className="text-xs text-blue-100/60">
              Preview tersanitasi: +{sanitizeWhatsappNumber(whatsappNumber || "")}
            </span>
          </label>

          <Button
            type="submit"
            disabled={isLoading}
            className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
          >
            <Save className="mr-2 size-4" />
            Simpan Pengaturan
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
