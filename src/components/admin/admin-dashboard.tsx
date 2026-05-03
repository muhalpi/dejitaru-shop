"use client";

import { FormEvent, useMemo, useRef, useState } from "react";
import { Plus, RefreshCw, Trash2 } from "lucide-react";
import type { AdminCatalogProduct } from "@/lib/admin-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type AdminDashboardProps = {
  initialProducts: AdminCatalogProduct[];
};

type CategoryOption = "APPS_PREMIUM" | "PULSA" | "TOKEN_LISTRIK" | "TOPUP_GAME" | "LAINNYA";
type CategoryFilterOption = "SEMUA" | CategoryOption;
type InputTypeOption = "TEXT" | "NUMBER" | "TEL" | "SELECT";
type AdminTab = "produk" | "varian" | "requirement";
type ProductFormSnapshot = {
  name: string;
  slug: string;
  category: string;
  description: string;
  imageUrl: string;
  termsAndConditions: string;
  isActive: string;
  isPopular: string;
};

const categoryOptions: CategoryOption[] = [
  "APPS_PREMIUM",
  "PULSA",
  "TOKEN_LISTRIK",
  "TOPUP_GAME",
  "LAINNYA",
];

const categoryLabelMap: Record<CategoryOption, string> = {
  APPS_PREMIUM: "Apps Premium",
  PULSA: "Pulsa",
  TOKEN_LISTRIK: "Token Listrik",
  TOPUP_GAME: "Topup Game",
  LAINNYA: "Lainnya",
};

const inputTypeOptions: InputTypeOption[] = ["TEXT", "NUMBER", "TEL", "SELECT"];

function parseIntSafe(value: string, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

function parseNullableInt(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const parsed = Number.parseInt(trimmed, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function pad2(value: number) {
  return String(value).padStart(2, "0");
}

function formatDateTimeLocal(value: string | Date | null | undefined) {
  if (!value) {
    return "";
  }

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  const hour = pad2(date.getHours());
  const minute = pad2(date.getMinutes());

  return `${year}-${month}-${day}T${hour}:${minute}`;
}

function formatRupiah(value: number) {
  return `Rp ${new Intl.NumberFormat("id-ID").format(value)}`;
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

function isPromoActive(variant: AdminCatalogProduct["variants"][number]) {
  if (variant.promoPrice === null || variant.promoPrice >= variant.price) {
    return false;
  }

  if (!variant.promoStartAt && !variant.promoEndAt) {
    return true;
  }

  if (!variant.promoStartAt || !variant.promoEndAt) {
    return false;
  }

  const start = new Date(variant.promoStartAt).getTime();
  const end = new Date(variant.promoEndAt).getTime();
  const now = Date.now();

  if (Number.isNaN(start) || Number.isNaN(end)) {
    return false;
  }

  return now >= start && now <= end;
}

function getEffectivePrice(variant: AdminCatalogProduct["variants"][number]) {
  return isPromoActive(variant) && variant.promoPrice !== null
    ? variant.promoPrice
    : variant.price;
}

function toSnapshotString(snapshot: ProductFormSnapshot) {
  return JSON.stringify(snapshot);
}

function getProductSnapshotFromProduct(product: AdminCatalogProduct): ProductFormSnapshot {
  return {
    name: product.name,
    slug: product.slug,
    category: product.category,
    description: product.description,
    imageUrl: product.imageUrl ?? "",
    termsAndConditions: product.termsAndConditions,
    isActive: product.isActive ? "true" : "false",
    isPopular: product.isPopular ? "true" : "false",
  };
}

function getProductSnapshotFromFormData(formData: FormData): ProductFormSnapshot {
  return {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    category: String(formData.get("category") ?? ""),
    description: String(formData.get("description") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    termsAndConditions: String(formData.get("termsAndConditions") ?? ""),
    isActive: String(formData.get("isActive") ?? "true"),
    isPopular: String(formData.get("isPopular") ?? "false"),
  };
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

async function apiFormData<T>(url: string, formData: FormData, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    body: formData,
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

function ProductBadges({ product }: { product: AdminCatalogProduct }) {
  return (
    <div className="flex flex-wrap gap-1">
      <Badge variant="secondary" className="text-[10px]">
        {product.category}
      </Badge>
      {product.isPopular ? <Badge className="text-[10px]">Popular</Badge> : null}
      {!product.isActive ? (
        <Badge variant="destructive" className="text-[10px]">
          Nonaktif
        </Badge>
      ) : null}
    </div>
  );
}

export function AdminDashboard({ initialProducts }: AdminDashboardProps) {
  const [products, setProducts] = useState(initialProducts);
  const [activeProductId, setActiveProductId] = useState<string | null>(
    initialProducts[0]?.id ?? null,
  );
  const [productFilter, setProductFilter] = useState("");
  const [productCategoryFilter, setProductCategoryFilter] =
    useState<CategoryFilterOption>("SEMUA");
  const [activeTab, setActiveTab] = useState<AdminTab>("produk");

  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [showCreateProduct, setShowCreateProduct] = useState(initialProducts.length === 0);
  const [showCreateVariant, setShowCreateVariant] = useState(false);
  const [showCreateRequirement, setShowCreateRequirement] = useState(false);
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);
  const [editingRequirementId, setEditingRequirementId] = useState<string | null>(null);
  const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
  const [productDirtyById, setProductDirtyById] = useState<Record<string, boolean>>({});

  const [newProduct, setNewProduct] = useState({
    name: "",
    slug: "",
    category: "APPS_PREMIUM" as CategoryOption,
    description: "",
    imageUrl: "",
    termsAndConditions: "",
    isActive: true,
    isPopular: false,
  });
  const [xlsxInputKey, setXlsxInputKey] = useState(0);
  const [createImageInputKey, setCreateImageInputKey] = useState(0);
  const [editImageInputKey, setEditImageInputKey] = useState(0);
  const [createImageFile, setCreateImageFile] = useState<File | null>(null);
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const imageUrlInputRef = useRef<HTMLInputElement | null>(null);
  const productEditFormRef = useRef<HTMLFormElement | null>(null);

  const resolvedActiveProductId = useMemo(() => {
    if (products.length === 0) {
      return null;
    }

    if (activeProductId && products.some((item) => item.id === activeProductId)) {
      return activeProductId;
    }

    return products[0].id;
  }, [activeProductId, products]);

  const activeProduct = useMemo(
    () => products.find((item) => item.id === resolvedActiveProductId) ?? null,
    [resolvedActiveProductId, products],
  );

  const filteredProducts = useMemo(() => {
    const query = productFilter.trim().toLocaleLowerCase("id-ID");

    return products.filter(
      (item) => {
        const passCategory =
          productCategoryFilter === "SEMUA" || item.category === productCategoryFilter;
        const passQuery =
          query.length === 0 ||
          item.name.toLocaleLowerCase("id-ID").includes(query) ||
          item.slug.toLocaleLowerCase("id-ID").includes(query);

        return passCategory && passQuery;
      },
    );
  }, [productCategoryFilter, productFilter, products]);

  const stats = useMemo(() => {
    const totalProducts = products.length;
    const activeProducts = products.filter((item) => item.isActive).length;
    const popularProducts = products.filter((item) => item.isPopular).length;
    const totalVariants = products.reduce((sum, item) => sum + item.variants.length, 0);
    const totalRequirements = products.reduce(
      (sum, item) => sum + item.requirements.length,
      0,
    );

    return {
      totalProducts,
      activeProducts,
      popularProducts,
      totalVariants,
      totalRequirements,
    };
  }, [products]);

  const productFormResetKey = useMemo(() => {
    if (!activeProduct) {
      return "no-product";
    }

    return [
      activeProduct.id,
      activeProduct.name,
      activeProduct.slug,
      activeProduct.category,
      activeProduct.description,
      activeProduct.imageUrl ?? "",
      activeProduct.termsAndConditions,
      activeProduct.isActive ? "1" : "0",
      activeProduct.isPopular ? "1" : "0",
    ].join("|");
  }, [activeProduct]);

  const initialProductSnapshot = useMemo(() => {
    if (!activeProduct) {
      return null;
    }

    return getProductSnapshotFromProduct(activeProduct);
  }, [activeProduct]);

  const isProductDirty = useMemo(() => {
    if (!resolvedActiveProductId) {
      return false;
    }

    return Boolean(productDirtyById[resolvedActiveProductId]);
  }, [productDirtyById, resolvedActiveProductId]);

  const selectedVariantCount = selectedVariantIds.length;

  const isAllVariantsSelected = useMemo(() => {
    if (!activeProduct || activeProduct.variants.length === 0) {
      return false;
    }

    return activeProduct.variants.every((variant) =>
      selectedVariantIds.includes(variant.id),
    );
  }, [activeProduct, selectedVariantIds]);

  async function refreshCatalog(customFeedback?: string) {
    setIsLoading(true);
    setError(null);

    try {
      const data = await apiJson<{ products: AdminCatalogProduct[] }>("/api/admin/catalog");
      setProducts(data.products ?? []);
      setProductDirtyById({});
      setSelectedVariantIds([]);
      setCreateImageFile(null);
      setEditImageFile(null);
      setCreateImageInputKey((current) => current + 1);
      setEditImageInputKey((current) => current + 1);

      if (customFeedback) {
        setFeedback(customFeedback);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data admin.");
    } finally {
      setIsLoading(false);
    }
  }

  async function runMutation(
    action: () => Promise<void>,
    successMessage: string,
    fallbackError: string,
  ) {
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      await action();
      const data = await apiJson<{ products: AdminCatalogProduct[] }>("/api/admin/catalog");
      setProducts(data.products ?? []);
      setSelectedVariantIds([]);
      setCreateImageFile(null);
      setEditImageFile(null);
      setCreateImageInputKey((current) => current + 1);
      setEditImageInputKey((current) => current + 1);
      setFeedback(successMessage);
    } catch (err) {
      setError(err instanceof Error ? err.message : fallbackError);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await runMutation(
      async () => {
        await apiJson("/api/admin/products", {
          method: "POST",
          body: JSON.stringify(newProduct),
        });

        setNewProduct({
          name: "",
          slug: "",
          category: "APPS_PREMIUM",
          description: "",
          imageUrl: "",
          termsAndConditions: "",
          isActive: true,
          isPopular: false,
        });

        setShowCreateProduct(false);
      },
      "Produk baru berhasil ditambahkan.",
      "Gagal menambah produk.",
    );
  }

  async function handleUpdateProduct(product: AdminCatalogProduct, formData: FormData) {
    await runMutation(
      async () => {
        await apiJson(`/api/admin/products/${product.id}`, {
          method: "PATCH",
          body: JSON.stringify({
            name: String(formData.get("name") ?? product.name),
            slug: String(formData.get("slug") ?? product.slug),
            category: String(formData.get("category") ?? product.category),
            description: String(formData.get("description") ?? product.description),
            imageUrl: String(formData.get("imageUrl") ?? product.imageUrl ?? ""),
            termsAndConditions: String(
              formData.get("termsAndConditions") ?? product.termsAndConditions,
            ),
            isActive: String(formData.get("isActive") ?? "true") === "true",
            isPopular: String(formData.get("isPopular") ?? "false") === "true",
          }),
        });
        setProductDirtyById((current) => {
          const next = { ...current };
          delete next[product.id];
          return next;
        });
      },
      `Perubahan produk ${product.name} tersimpan.`,
      "Gagal memperbarui produk.",
    );
  }

  async function handleDeleteProduct(product: AdminCatalogProduct) {
    const confirmed = confirm(
      `Hapus produk ${product.name} beserta varian dan requirement terkait?`,
    );

    if (!confirmed) {
      return;
    }

    await runMutation(
      async () => {
        await apiJson(`/api/admin/products/${product.id}`, { method: "DELETE" });
      },
      "Produk berhasil dihapus.",
      "Gagal menghapus produk.",
    );
  }

  async function handleCreateVariant(productId: string, formData: FormData) {
    await runMutation(
      async () => {
        await apiJson("/api/admin/variants", {
          method: "POST",
          body: JSON.stringify({
            productId,
            label: String(formData.get("label") ?? ""),
            type: "VARIAN",
            value: String(formData.get("value") ?? ""),
            price: parseIntSafe(String(formData.get("price") ?? "0"), 0),
            promoPrice: parseNullableInt(String(formData.get("promoPrice") ?? "")),
            promoStartAt: String(formData.get("promoStartAt") ?? "").trim() || null,
            promoEndAt: String(formData.get("promoEndAt") ?? "").trim() || null,
            isDefault: String(formData.get("isDefault") ?? "false") === "true",
            isActive: true,
            sortOrder: parseIntSafe(String(formData.get("sortOrder") ?? "0"), 0),
          }),
        });

        setShowCreateVariant(false);
      },
      "Varian baru berhasil ditambahkan.",
      "Gagal menambah varian.",
    );
  }

  async function handleUpdateVariant(variantId: string, formData: FormData) {
    await runMutation(
      async () => {
        await apiJson(`/api/admin/variants/${variantId}`, {
          method: "PATCH",
          body: JSON.stringify({
            label: String(formData.get("label") ?? ""),
            type: "VARIAN",
            value: String(formData.get("value") ?? ""),
            price: parseIntSafe(String(formData.get("price") ?? "0"), 0),
            promoPrice: parseNullableInt(String(formData.get("promoPrice") ?? "")),
            promoStartAt: String(formData.get("promoStartAt") ?? "").trim() || null,
            promoEndAt: String(formData.get("promoEndAt") ?? "").trim() || null,
            isDefault: String(formData.get("isDefault") ?? "false") === "true",
            isActive: String(formData.get("isActive") ?? "true") === "true",
            sortOrder: parseIntSafe(String(formData.get("sortOrder") ?? "0"), 0),
          }),
        });

        setEditingVariantId(null);
      },
      "Varian berhasil diperbarui.",
      "Gagal memperbarui varian.",
    );
  }

  async function handleDeleteVariant(variantId: string) {
    const confirmed = confirm("Hapus varian ini?");
    if (!confirmed) {
      return;
    }

    await runMutation(
      async () => {
        await apiJson(`/api/admin/variants/${variantId}`, { method: "DELETE" });
        setEditingVariantId((current) => (current === variantId ? null : current));
        setSelectedVariantIds((current) => current.filter((item) => item !== variantId));
      },
      "Varian berhasil dihapus.",
      "Gagal menghapus varian.",
    );
  }

  function toggleVariantSelection(variantId: string) {
    setSelectedVariantIds((current) =>
      current.includes(variantId)
        ? current.filter((item) => item !== variantId)
        : [...current, variantId],
    );
  }

  function toggleSelectAllVariants() {
    if (!activeProduct) {
      return;
    }

    if (isAllVariantsSelected) {
      setSelectedVariantIds([]);
      return;
    }

    setSelectedVariantIds(activeProduct.variants.map((variant) => variant.id));
  }

  async function handleBulkSetVariantStatus(isActive: boolean) {
    if (selectedVariantIds.length === 0) {
      return;
    }

    await runMutation(
      async () => {
        await Promise.all(
          selectedVariantIds.map((variantId) =>
            apiJson(`/api/admin/variants/${variantId}`, {
              method: "PATCH",
              body: JSON.stringify({ isActive }),
            }),
          ),
        );
        setSelectedVariantIds([]);
      },
      `Status ${selectedVariantIds.length} varian berhasil diperbarui.`,
      "Gagal memperbarui status varian terpilih.",
    );
  }

  async function handleBulkDeleteVariants() {
    if (selectedVariantIds.length === 0) {
      return;
    }

    const confirmed = confirm(`Hapus ${selectedVariantIds.length} varian terpilih?`);
    if (!confirmed) {
      return;
    }

    await runMutation(
      async () => {
        await Promise.all(
          selectedVariantIds.map((variantId) =>
            apiJson(`/api/admin/variants/${variantId}`, { method: "DELETE" }),
          ),
        );
        setEditingVariantId((current) =>
          current && selectedVariantIds.includes(current) ? null : current,
        );
        setSelectedVariantIds([]);
      },
      `${selectedVariantIds.length} varian berhasil dihapus.`,
      "Gagal menghapus varian terpilih.",
    );
  }

  async function handleCreateRequirement(productId: string, formData: FormData) {
    await runMutation(
      async () => {
        await apiJson("/api/admin/requirements", {
          method: "POST",
          body: JSON.stringify({
            productId,
            fieldKey: String(formData.get("fieldKey") ?? ""),
            fieldLabel: String(formData.get("fieldLabel") ?? ""),
            inputType: String(formData.get("inputType") ?? "TEXT"),
            placeholder: String(formData.get("placeholder") ?? ""),
            isRequired: String(formData.get("isRequired") ?? "true") === "true",
            validationRegex: String(formData.get("validationRegex") ?? ""),
            helpText: String(formData.get("helpText") ?? ""),
            sortOrder: parseIntSafe(String(formData.get("sortOrder") ?? "0"), 0),
          }),
        });

        setShowCreateRequirement(false);
      },
      "Requirement baru berhasil ditambahkan.",
      "Gagal menambah requirement.",
    );
  }

  async function handleUpdateRequirement(requirementId: string, formData: FormData) {
    await runMutation(
      async () => {
        await apiJson(`/api/admin/requirements/${requirementId}`, {
          method: "PATCH",
          body: JSON.stringify({
            fieldKey: String(formData.get("fieldKey") ?? ""),
            fieldLabel: String(formData.get("fieldLabel") ?? ""),
            inputType: String(formData.get("inputType") ?? "TEXT"),
            placeholder: String(formData.get("placeholder") ?? ""),
            isRequired: String(formData.get("isRequired") ?? "true") === "true",
            validationRegex: String(formData.get("validationRegex") ?? ""),
            helpText: String(formData.get("helpText") ?? ""),
            sortOrder: parseIntSafe(String(formData.get("sortOrder") ?? "0"), 0),
          }),
        });

        setEditingRequirementId(null);
      },
      "Requirement berhasil diperbarui.",
      "Gagal memperbarui requirement.",
    );
  }

  async function handleDeleteRequirement(requirementId: string) {
    const confirmed = confirm("Hapus requirement ini?");
    if (!confirmed) {
      return;
    }

    await runMutation(
      async () => {
        await apiJson(`/api/admin/requirements/${requirementId}`, { method: "DELETE" });
        setEditingRequirementId((current) =>
          current === requirementId ? null : current,
        );
      },
      "Requirement berhasil dihapus.",
      "Gagal menghapus requirement.",
    );
  }

  async function handleImportProducts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const selectedFile = formData.get("file");

    if (!(selectedFile instanceof File) || selectedFile.size === 0) {
      setError("Pilih file .xlsx terlebih dahulu.");
      setFeedback(null);
      return;
    }

    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const result = await apiFormData<{
        updatedRows: number;
        skippedRows: number;
        totalRows: number;
      }>("/api/admin/products/import", formData, { method: "POST" });

      const data = await apiJson<{ products: AdminCatalogProduct[] }>("/api/admin/catalog");
      setProducts(data.products ?? []);
      setProductDirtyById({});
      setXlsxInputKey((current) => current + 1);
      setFeedback(
        `Import XLSX selesai. ${result.updatedRows} produk diperbarui, ${result.skippedRows} baris dilewati dari ${result.totalRows} baris data.`,
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal import XLSX.");
    } finally {
      setIsLoading(false);
    }
  }

  function applyImagePathToEditForm(nextImageUrl: string) {
    const input = imageUrlInputRef.current;

    if (!input) {
      return;
    }

    input.value = nextImageUrl;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function uploadProductImage(file: File, slugHint: string) {
    const formData = new FormData();
    formData.set("file", file);
    formData.set("slug", slugHint);

    const response = await apiFormData<{ imageUrl: string }>(
      "/api/admin/products/upload",
      formData,
      { method: "POST" },
    );

    return response.imageUrl;
  }

  async function handleUploadCreateProductImage() {
    if (!createImageFile) {
      setError("Pilih file gambar untuk produk baru.");
      setFeedback(null);
      return;
    }

    setIsUploadingImage(true);
    setError(null);
    setFeedback(null);

    try {
      const imageUrl = await uploadProductImage(createImageFile, newProduct.slug);

      setNewProduct((current) => ({ ...current, imageUrl }));
      setCreateImageFile(null);
      setCreateImageInputKey((current) => current + 1);
      setFeedback("Upload gambar produk baru berhasil.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  async function handleUploadEditProductImage() {
    if (!activeProduct) {
      return;
    }

    if (!editImageFile) {
      setError("Pilih file gambar untuk produk yang sedang diedit.");
      setFeedback(null);
      return;
    }

    const slugField = productEditFormRef.current?.elements.namedItem("slug");
    const slugHint =
      slugField instanceof HTMLInputElement
        ? slugField.value
        : activeProduct.slug;

    setIsUploadingImage(true);
    setError(null);
    setFeedback(null);

    try {
      const imageUrl = await uploadProductImage(editImageFile, slugHint);
      applyImagePathToEditForm(imageUrl);
      setProductDirtyById((current) => ({
        ...current,
        [activeProduct.id]: true,
      }));
      setEditImageFile(null);
      setEditImageInputKey((current) => current + 1);
      setFeedback("Upload gambar produk berhasil. Simpan perubahan produk untuk menerapkan.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal upload gambar.");
    } finally {
      setIsUploadingImage(false);
    }
  }

  return (
    <div className="space-y-5">
      <Card className="border-white/10 bg-[#070a2d]/85 text-white">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <CardTitle className="text-xl">Dashboard Admin</CardTitle>
            <p className="mt-1 text-sm text-blue-100/75">
              Kelola katalog dengan alur sederhana: pilih produk, edit produk, lalu atur varian dan requirement.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => refreshCatalog("Data admin diperbarui.")}
            disabled={isLoading}
            className="border-white/30 bg-transparent text-blue-100 hover:border-fuchsia-300/50 hover:bg-white/10 hover:text-white"
          >
            <RefreshCw className="mr-2 size-4" />
            Refresh Data
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
            <div className="rounded-lg border border-white/10 bg-[#0b103d]/70 p-3 text-sm">
              <p className="text-blue-100/60">Total Produk</p>
              <p className="mt-1 text-lg font-semibold">{stats.totalProducts}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0b103d]/70 p-3 text-sm">
              <p className="text-blue-100/60">Produk Aktif</p>
              <p className="mt-1 text-lg font-semibold">{stats.activeProducts}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0b103d]/70 p-3 text-sm">
              <p className="text-blue-100/60">Produk Popular</p>
              <p className="mt-1 text-lg font-semibold">{stats.popularProducts}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0b103d]/70 p-3 text-sm">
              <p className="text-blue-100/60">Total Varian</p>
              <p className="mt-1 text-lg font-semibold">{stats.totalVariants}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-[#0b103d]/70 p-3 text-sm">
              <p className="text-blue-100/60">Total Requirement</p>
              <p className="mt-1 text-lg font-semibold">{stats.totalRequirements}</p>
            </div>
          </div>

          <form
            onSubmit={handleImportProducts}
            className="space-y-2 rounded-lg border border-dashed border-white/20 bg-[#0b103d]/40 p-3"
          >
            <p className="text-sm font-medium text-blue-100">Update item via upload XLSX</p>
            <p className="text-xs text-blue-100/65">
              Kolom identitas wajib: <code>slug</code>. Kolom update:
              <code> name</code>, <code> slug_update</code>, <code> category</code>,
              <code> description</code>, <code> image_url</code>,
              <code> terms_and_conditions</code>, <code> is_active</code>,{" "}
              <code>is_popular</code>. Isi <code>NULL</code> di <code>image_url</code> untuk
              mengosongkan gambar.
            </p>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                key={xlsxInputKey}
                name="file"
                type="file"
                accept=".xlsx"
                className="border-white/20 bg-[#0b103d]/80 file:mr-4 file:rounded-md file:border-0 file:bg-fuchsia-500/20 file:px-3 file:py-1 file:text-sm file:text-fuchsia-100"
                disabled={isLoading}
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
              >
                Upload &amp; Update
              </Button>
            </div>
          </form>

          {feedback ? (
            <p className="rounded-lg border border-emerald-400/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200">
              {feedback}
            </p>
          ) : null}

          {error ? (
            <p className="rounded-lg border border-rose-400/25 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-5 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside>
          <Card className="border-white/10 bg-[#05082f]/75 text-white">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">Daftar Produk</CardTitle>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-100 hover:border-fuchsia-300/70 hover:bg-fuchsia-500/25 hover:text-white"
                  onClick={() => setShowCreateProduct((current) => !current)}
                >
                  <Plus className="mr-1 size-4" />
                  {showCreateProduct ? "Tutup" : "Tambah"}
                </Button>
              </div>

              <Input
                value={productFilter}
                onChange={(event) => setProductFilter(event.target.value)}
                placeholder="Cari nama atau slug..."
                className="border-white/20 bg-[#0b103d]/80"
              />

              <select
                value={productCategoryFilter}
                onChange={(event) =>
                  setProductCategoryFilter(event.target.value as CategoryFilterOption)
                }
                className="h-10 w-full rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
              >
                <option value="SEMUA">Semua Kategori</option>
                {categoryOptions.map((option) => (
                  <option key={option} value={option}>
                    {categoryLabelMap[option]}
                  </option>
                ))}
              </select>
            </CardHeader>

            <CardContent className="space-y-3">
              {showCreateProduct ? (
                <form
                  onSubmit={handleCreateProduct}
                  className="space-y-2 rounded-lg border border-dashed border-white/20 bg-[#0b103d]/50 p-3"
                >
                  <Input
                    value={newProduct.name}
                    onChange={(event) =>
                      setNewProduct((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Nama produk"
                    className="border-white/20 bg-[#0b103d]/80"
                    required
                  />
                  <Input
                    value={newProduct.slug}
                    onChange={(event) =>
                      setNewProduct((current) => ({ ...current, slug: event.target.value }))
                    }
                    placeholder="Slug, contoh: capcut-pro"
                    className="border-white/20 bg-[#0b103d]/80"
                    required
                  />
                  <select
                    value={newProduct.category}
                    onChange={(event) =>
                      setNewProduct((current) => ({
                        ...current,
                        category: event.target.value as CategoryOption,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                  >
                    {categoryOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <Textarea
                    value={newProduct.description}
                    onChange={(event) =>
                      setNewProduct((current) => ({
                        ...current,
                        description: event.target.value,
                      }))
                    }
                    placeholder="Deskripsi produk"
                    className="min-h-20 border-white/20 bg-[#0b103d]/80"
                    required
                  />
                  <div className="space-y-2 rounded-lg border border-white/15 bg-[#0b103d]/45 p-3">
                    <p className="text-xs text-blue-100/70">
                      Thumbnail produk (JPG/PNG/WebP/AVIF, max 2MB)
                    </p>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                      <Input
                        key={createImageInputKey}
                        type="file"
                        accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                        onChange={(event) => {
                          const file = event.target.files?.[0] ?? null;
                          setCreateImageFile(file);
                        }}
                        className="border-white/20 bg-[#0b103d]/80 file:mr-4 file:rounded-md file:border-0 file:bg-fuchsia-500/20 file:px-3 file:py-1 file:text-sm file:text-fuchsia-100"
                        disabled={isLoading || isUploadingImage}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadCreateProductImage}
                        disabled={isLoading || isUploadingImage || !createImageFile}
                        className="border-white/25 bg-transparent text-blue-100 hover:border-fuchsia-300/60 hover:bg-white/10 hover:text-white"
                      >
                        Upload Gambar
                      </Button>
                    </div>
                    <Input
                      value={newProduct.imageUrl}
                      onChange={(event) =>
                        setNewProduct((current) => ({
                          ...current,
                          imageUrl: event.target.value,
                        }))
                      }
                      placeholder="https://... atau /uploads/..."
                      className="border-white/20 bg-[#0b103d]/80"
                    />
                    {newProduct.imageUrl ? (
                      <div className="space-y-2">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={newProduct.imageUrl}
                          alt="Preview produk baru"
                          className="h-24 w-24 rounded-lg border border-white/15 object-cover"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            setNewProduct((current) => ({ ...current, imageUrl: "" }))
                          }
                          className="border-white/25 bg-transparent text-blue-100 hover:bg-white/10 hover:text-white"
                        >
                          Hapus Gambar
                        </Button>
                      </div>
                    ) : null}
                  </div>
                  <Textarea
                    value={newProduct.termsAndConditions}
                    onChange={(event) =>
                      setNewProduct((current) => ({
                        ...current,
                        termsAndConditions: event.target.value,
                      }))
                    }
                    placeholder="Syarat dan ketentuan"
                    className="min-h-20 border-white/20 bg-[#0b103d]/80"
                    required
                  />

                  <div className="grid grid-cols-2 gap-2 text-sm text-blue-100/80">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.isActive}
                        onChange={(event) =>
                          setNewProduct((current) => ({
                            ...current,
                            isActive: event.target.checked,
                          }))
                        }
                      />
                      Aktif
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newProduct.isPopular}
                        onChange={(event) =>
                          setNewProduct((current) => ({
                            ...current,
                            isPopular: event.target.checked,
                          }))
                        }
                      />
                      Popular
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white"
                    disabled={isLoading || isUploadingImage}
                  >
                    Simpan Produk Baru
                  </Button>
                </form>
              ) : null}

              <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
                {filteredProducts.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-[#0b103d]/40 px-3 py-2 text-sm text-blue-100/60">
                    Produk tidak ditemukan.
                  </p>
                ) : (
                  filteredProducts.map((product) => {
                    const isSelected = product.id === resolvedActiveProductId;

                    return (
                      <button
                        key={product.id}
                        type="button"
                        onClick={() => {
                          setActiveProductId(product.id);
                          setActiveTab("produk");
                          setEditingVariantId(null);
                          setEditingRequirementId(null);
                          setSelectedVariantIds([]);
                          setEditImageFile(null);
                          setEditImageInputKey((current) => current + 1);
                          setProductDirtyById({});
                        }}
                        className={`w-full rounded-lg border p-3 text-left transition ${
                          isSelected
                            ? "border-fuchsia-400/60 bg-fuchsia-500/15"
                            : "border-white/10 bg-[#0b103d]/45 hover:border-fuchsia-400/40"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {product.imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={product.imageUrl}
                                alt={`Thumbnail ${product.name}`}
                                className="h-12 w-12 shrink-0 rounded-md border border-white/15 object-cover"
                              />
                            </>
                          ) : (
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/15 bg-[#11174d] text-[10px] font-semibold text-blue-100/70">
                              IMG
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold">{product.name}</p>
                            <p className="mt-0.5 truncate text-xs text-blue-100/60">/{product.slug}</p>
                          </div>
                        </div>
                        <div className="mt-2">
                          <ProductBadges product={product} />
                        </div>
                        <p className="mt-2 text-[11px] text-blue-100/55">
                          {product.variants.length} varian | {product.requirements.length} requirement
                        </p>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </aside>

        <section>
          {!activeProduct ? (
            <Card className="border-white/10 bg-[#05082f]/75 text-white">
              <CardContent className="py-16 text-center text-blue-100/65">
                Pilih produk di panel kiri untuk mulai mengelola detail katalog.
              </CardContent>
            </Card>
          ) : (
            <Card className="border-white/10 bg-[#05082f]/75 text-white">
              <CardHeader className="space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <CardTitle className="text-xl">{activeProduct.name}</CardTitle>
                    <p className="mt-1 text-sm text-blue-100/65">/{activeProduct.slug}</p>
                  </div>
                  <ProductBadges product={activeProduct} />
                </div>

                <Tabs
                  value={activeTab}
                  onValueChange={(value) => setActiveTab(value as AdminTab)}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-3 bg-[#0b103d]/70">
                    <TabsTrigger
                      value="produk"
                      className="text-blue-100/80 hover:text-white data-active:bg-[#17225f] data-active:text-white"
                    >
                      Produk
                    </TabsTrigger>
                    <TabsTrigger
                      value="varian"
                      className="text-blue-100/80 hover:text-white data-active:bg-[#17225f] data-active:text-white"
                    >
                      Varian
                    </TabsTrigger>
                    <TabsTrigger
                      value="requirement"
                      className="text-blue-100/80 hover:text-white data-active:bg-[#17225f] data-active:text-white"
                    >
                      Requirement
                    </TabsTrigger>
                  </TabsList>

                  <div className="mt-3 rounded-lg border border-white/10 bg-[#0b103d]/45 px-3 py-2 text-sm text-blue-100/80">
                    {activeTab === "produk" ? (
                      <p>
                        Perubahan data produk disimpan lewat tombol <span className="font-semibold">Simpan Perubahan Produk</span>. Tombol akan aktif hanya jika ada perubahan.
                      </p>
                    ) : activeTab === "varian" ? (
                      <p>
                        Di tab Varian, simpan dilakukan <span className="font-semibold">per item</span> lewat tombol <span className="font-semibold">Simpan Varian</span> saat mode edit dibuka.
                      </p>
                    ) : (
                      <p>
                        Di tab Requirement, simpan dilakukan <span className="font-semibold">per item</span> lewat tombol <span className="font-semibold">Simpan Requirement</span> saat mode edit dibuka.
                      </p>
                    )}
                  </div>

                  <TabsContent value="produk" className="mt-4">
                    <form
                      id={`product-edit-form-${activeProduct.id}`}
                      ref={productEditFormRef}
                      key={productFormResetKey}
                      onChange={(event) => {
                        if (!activeProduct || !initialProductSnapshot) {
                          return;
                        }

                        const nextSnapshot = getProductSnapshotFromFormData(
                          new FormData(event.currentTarget),
                        );
                        const dirty =
                          toSnapshotString(nextSnapshot) !==
                          toSnapshotString(initialProductSnapshot);

                        setProductDirtyById((current) => {
                          const next = { ...current };

                          if (dirty) {
                            next[activeProduct.id] = true;
                          } else {
                            delete next[activeProduct.id];
                          }

                          return next;
                        });
                      }}
                      onSubmit={async (event) => {
                        event.preventDefault();
                        await handleUpdateProduct(
                          activeProduct,
                          new FormData(event.currentTarget),
                        );
                      }}
                      className="space-y-4"
                    >
                      <div className="grid gap-3 md:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs text-blue-100/65">Nama Produk</p>
                          <Input
                            name="name"
                            defaultValue={activeProduct.name}
                            className="border-white/20 bg-[#0b103d]/80"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-100/65">Slug</p>
                          <Input
                            name="slug"
                            defaultValue={activeProduct.slug}
                            className="border-white/20 bg-[#0b103d]/80"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-100/65">Kategori</p>
                          <select
                            name="category"
                            defaultValue={activeProduct.category}
                            className="h-10 w-full rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                          >
                            {categoryOptions.map((option) => (
                              <option key={option} value={option}>
                                {option}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-100/65">Thumbnail Produk</p>
                          <Input
                            ref={imageUrlInputRef}
                            name="imageUrl"
                            defaultValue={activeProduct.imageUrl ?? ""}
                            placeholder="https://... atau /uploads/..."
                            className="border-white/20 bg-[#0b103d]/80"
                          />
                          <div className="mt-2 space-y-2 rounded-lg border border-white/15 bg-[#0b103d]/45 p-3">
                            <p className="text-xs text-blue-100/70">
                              Upload file gambar (JPG/PNG/WebP/AVIF, max 2MB)
                            </p>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                              <Input
                                key={editImageInputKey}
                                type="file"
                                accept=".jpg,.jpeg,.png,.webp,.avif,image/jpeg,image/png,image/webp,image/avif"
                                onChange={(event) => {
                                  const file = event.target.files?.[0] ?? null;
                                  setEditImageFile(file);
                                }}
                                className="border-white/20 bg-[#0b103d]/80 file:mr-4 file:rounded-md file:border-0 file:bg-fuchsia-500/20 file:px-3 file:py-1 file:text-sm file:text-fuchsia-100"
                                disabled={isLoading || isUploadingImage}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                onClick={handleUploadEditProductImage}
                                disabled={isLoading || isUploadingImage || !editImageFile}
                                className="border-white/25 bg-transparent text-blue-100 hover:border-fuchsia-300/60 hover:bg-white/10 hover:text-white"
                              >
                                Upload Gambar
                              </Button>
                            </div>
                            {activeProduct.imageUrl ? (
                              <>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={activeProduct.imageUrl}
                                  alt={`Preview ${activeProduct.name}`}
                                  className="h-24 w-24 rounded-lg border border-white/15 object-cover"
                                />
                              </>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-blue-100/65">Deskripsi</p>
                        <Textarea
                          name="description"
                          defaultValue={activeProduct.description}
                          className="min-h-24 border-white/20 bg-[#0b103d]/80"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <p className="text-xs text-blue-100/65">Syarat dan Ketentuan</p>
                        <Textarea
                          name="termsAndConditions"
                          defaultValue={activeProduct.termsAndConditions}
                          className="min-h-28 border-white/20 bg-[#0b103d]/80"
                          required
                        />
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1">
                          <p className="text-xs text-blue-100/65">Status Produk</p>
                          <select
                            name="isActive"
                            defaultValue={activeProduct.isActive ? "true" : "false"}
                            className="h-10 w-full rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                          >
                            <option value="true">Aktif</option>
                            <option value="false">Nonaktif</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <p className="text-xs text-blue-100/65">Badge Popular</p>
                          <select
                            name="isPopular"
                            defaultValue={activeProduct.isPopular ? "true" : "false"}
                            className="h-10 w-full rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                          >
                            <option value="false">Tidak</option>
                            <option value="true">Ya</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="submit"
                          disabled={isLoading || isUploadingImage || !isProductDirty}
                          className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white"
                        >
                          Simpan Perubahan Produk
                        </Button>
                        <Button
                          type="button"
                          variant="destructive"
                          disabled={isLoading}
                          onClick={() => handleDeleteProduct(activeProduct)}
                        >
                          <Trash2 className="mr-2 size-4" />
                          Hapus Produk
                        </Button>
                      </div>
                    </form>
                  </TabsContent>

                  <TabsContent value="varian" className="mt-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-blue-100/75">
                        Total varian: <span className="font-semibold">{activeProduct.variants.length}</span>
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-100 hover:border-fuchsia-300/70 hover:bg-fuchsia-500/25 hover:text-white"
                        onClick={() => setShowCreateVariant((current) => !current)}
                      >
                        <Plus className="mr-1 size-4" />
                        {showCreateVariant ? "Tutup Form" : "Tambah Varian"}
                      </Button>
                    </div>

                    {activeProduct.variants.length > 0 ? (
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/10 bg-[#0b103d]/35 px-3 py-2">
                        <label className="inline-flex items-center gap-2 text-xs text-blue-100/80">
                          <input
                            type="checkbox"
                            checked={isAllVariantsSelected}
                            onChange={toggleSelectAllVariants}
                            className="size-4 accent-fuchsia-500"
                          />
                          Pilih semua varian
                        </label>
                        <span className="text-xs text-blue-100/65">
                          {selectedVariantCount} terpilih
                        </span>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isLoading || selectedVariantCount === 0}
                          className="border-white/25 bg-transparent text-blue-100 hover:border-emerald-300/60 hover:bg-white/10 hover:text-white"
                          onClick={() => handleBulkSetVariantStatus(true)}
                        >
                          Aktifkan Terpilih
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={isLoading || selectedVariantCount === 0}
                          className="border-white/25 bg-transparent text-blue-100 hover:border-amber-300/60 hover:bg-white/10 hover:text-white"
                          onClick={() => handleBulkSetVariantStatus(false)}
                        >
                          Nonaktifkan Terpilih
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="destructive"
                          disabled={isLoading || selectedVariantCount === 0}
                          onClick={handleBulkDeleteVariants}
                        >
                          Hapus Terpilih
                        </Button>
                      </div>
                    ) : null}

                    {showCreateVariant ? (
                      <form
                        onSubmit={async (event) => {
                          event.preventDefault();
                          await handleCreateVariant(
                            activeProduct.id,
                            new FormData(event.currentTarget),
                          );
                        }}
                        className="grid gap-2 rounded-lg border border-dashed border-white/20 bg-[#0b103d]/40 p-3 md:grid-cols-3"
                      >
                        <Input
                          name="label"
                          placeholder="Label varian"
                          className="border-white/20 bg-[#0b103d]/80"
                          required
                        />
                        <input type="hidden" name="type" value="VARIAN" />
                        <Input
                          value="VARIAN"
                          readOnly
                          className="border-white/20 bg-[#0b103d]/55 text-blue-100/85"
                        />
                        <Input
                          name="value"
                          placeholder="Value"
                          className="border-white/20 bg-[#0b103d]/80"
                          required
                        />
                        <Input
                          name="price"
                          type="number"
                          placeholder="Harga normal"
                          className="border-white/20 bg-[#0b103d]/80"
                          required
                        />
                        <Input
                          name="promoPrice"
                          type="number"
                          placeholder="Harga promo (opsional)"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <Input
                          name="sortOrder"
                          type="number"
                          placeholder="Urutan"
                          defaultValue="0"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <Input
                          name="promoStartAt"
                          type="datetime-local"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <Input
                          name="promoEndAt"
                          type="datetime-local"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <select
                          name="isDefault"
                          defaultValue="false"
                          className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                        >
                          <option value="false">Bukan Default</option>
                          <option value="true">Default</option>
                        </select>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="md:col-span-3 bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
                        >
                          Simpan Varian Baru
                        </Button>
                      </form>
                    ) : null}

                    <Separator className="bg-white/10" />

                    <div className="space-y-2">
                      {activeProduct.variants.length === 0 ? (
                        <p className="rounded-lg border border-white/10 bg-[#0b103d]/40 px-3 py-2 text-sm text-blue-100/60">
                          Belum ada varian untuk produk ini.
                        </p>
                      ) : (
                        activeProduct.variants.map((variant) => {
                          const isEditing = editingVariantId === variant.id;
                          const promoOn = isPromoActive(variant);
                          const effectivePrice = getEffectivePrice(variant);
                          const isSelected = selectedVariantIds.includes(variant.id);

                          return (
                            <div
                              key={variant.id}
                              className={`rounded-lg border bg-[#0b103d]/45 p-3 ${
                                isSelected
                                  ? "border-fuchsia-400/70 ring-1 ring-fuchsia-300/30"
                                  : "border-white/10"
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="space-y-1">
                                  <label className="inline-flex items-center gap-2 text-xs text-blue-100/80">
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleVariantSelection(variant.id)}
                                      className="size-4 accent-fuchsia-500"
                                    />
                                    Pilih varian ini
                                  </label>
                                  <p className="text-sm font-semibold">{variant.label}</p>
                                  <p className="text-xs text-blue-100/60">
                                    {variant.type} | {variant.value}
                                  </p>
                                  <p className="mt-1 text-xs text-blue-100/60">
                                    Sort: {variant.sortOrder} | {variant.isDefault ? "Default" : "Non-default"} | {variant.isActive ? "Aktif" : "Nonaktif"}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">{formatRupiah(effectivePrice)}</p>
                                  {promoOn && variant.promoPrice !== null ? (
                                    <p className="text-xs text-rose-200 line-through">
                                      {formatRupiah(variant.price)}
                                    </p>
                                  ) : null}
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    className="mt-2 border-white/25 bg-transparent text-blue-100 hover:border-fuchsia-300/60 hover:bg-white/10 hover:text-white"
                                    onClick={() =>
                                      setEditingVariantId((current) =>
                                        current === variant.id ? null : variant.id,
                                      )
                                    }
                                  >
                                    {isEditing ? "Tutup" : "Edit"}
                                  </Button>
                                </div>
                              </div>

                              {isEditing ? (
                                <form
                                  key={[
                                    variant.id,
                                    variant.label,
                                    variant.type,
                                    variant.value,
                                    String(variant.price),
                                    String(variant.promoPrice ?? ""),
                                    formatDateTimeLocal(variant.promoStartAt),
                                    formatDateTimeLocal(variant.promoEndAt),
                                    variant.isDefault ? "1" : "0",
                                    variant.isActive ? "1" : "0",
                                    String(variant.sortOrder),
                                  ].join("|")}
                                  onSubmit={async (event) => {
                                    event.preventDefault();
                                    await handleUpdateVariant(
                                      variant.id,
                                      new FormData(event.currentTarget),
                                    );
                                  }}
                                  className="mt-3 grid gap-2 md:grid-cols-3"
                                >
                                  <Input
                                    name="label"
                                    defaultValue={variant.label}
                                    className="border-white/20 bg-[#0b103d]/80"
                                    required
                                  />
                                  <input type="hidden" name="type" value="VARIAN" />
                                  <Input
                                    value="VARIAN"
                                    readOnly
                                    className="border-white/20 bg-[#0b103d]/55 text-blue-100/85"
                                  />
                                  <Input
                                    name="value"
                                    defaultValue={variant.value}
                                    className="border-white/20 bg-[#0b103d]/80"
                                    required
                                  />
                                  <Input
                                    name="price"
                                    type="number"
                                    defaultValue={String(variant.price)}
                                    className="border-white/20 bg-[#0b103d]/80"
                                    required
                                  />
                                  <Input
                                    name="promoPrice"
                                    type="number"
                                    defaultValue={
                                      variant.promoPrice === null ? "" : String(variant.promoPrice)
                                    }
                                    placeholder="Harga promo"
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <Input
                                    name="sortOrder"
                                    type="number"
                                    defaultValue={String(variant.sortOrder)}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <Input
                                    name="promoStartAt"
                                    type="datetime-local"
                                    defaultValue={formatDateTimeLocal(variant.promoStartAt)}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <Input
                                    name="promoEndAt"
                                    type="datetime-local"
                                    defaultValue={formatDateTimeLocal(variant.promoEndAt)}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <select
                                    name="isDefault"
                                    defaultValue={variant.isDefault ? "true" : "false"}
                                    className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                                  >
                                    <option value="false">Bukan Default</option>
                                    <option value="true">Default</option>
                                  </select>
                                  <select
                                    name="isActive"
                                    defaultValue={variant.isActive ? "true" : "false"}
                                    className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                                  >
                                    <option value="true">Aktif</option>
                                    <option value="false">Nonaktif</option>
                                  </select>
                                  <div className="flex gap-2 md:col-span-3">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      disabled={isLoading}
                                      className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white hover:brightness-110"
                                    >
                                      Simpan Varian
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      disabled={isLoading}
                                      onClick={() => handleDeleteVariant(variant.id)}
                                    >
                                      Hapus
                                    </Button>
                                  </div>
                                </form>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="requirement" className="mt-4 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm text-blue-100/75">
                        Total requirement: <span className="font-semibold">{activeProduct.requirements.length}</span>
                      </p>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="border-fuchsia-400/50 bg-fuchsia-500/10 text-fuchsia-100 hover:bg-fuchsia-500/20 hover:text-white"
                        onClick={() => setShowCreateRequirement((current) => !current)}
                      >
                        <Plus className="mr-1 size-4" />
                        {showCreateRequirement ? "Tutup Form" : "Tambah Requirement"}
                      </Button>
                    </div>

                    {showCreateRequirement ? (
                      <form
                        onSubmit={async (event) => {
                          event.preventDefault();
                          await handleCreateRequirement(
                            activeProduct.id,
                            new FormData(event.currentTarget),
                          );
                        }}
                        className="grid gap-2 rounded-lg border border-dashed border-white/20 bg-[#0b103d]/40 p-3 md:grid-cols-3"
                      >
                        <Input
                          name="fieldKey"
                          placeholder="field_key"
                          className="border-white/20 bg-[#0b103d]/80"
                          required
                        />
                        <Input
                          name="fieldLabel"
                          placeholder="Label field"
                          className="border-white/20 bg-[#0b103d]/80"
                          required
                        />
                        <select
                          name="inputType"
                          className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                        >
                          {inputTypeOptions.map((option) => (
                            <option key={option} value={option}>
                              {option}
                            </option>
                          ))}
                        </select>
                        <Input
                          name="placeholder"
                          placeholder="Placeholder"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <Input
                          name="validationRegex"
                          placeholder="Regex validasi (opsional)"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <Input
                          name="helpText"
                          placeholder="Bantuan singkat"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <Input
                          name="sortOrder"
                          type="number"
                          defaultValue="0"
                          className="border-white/20 bg-[#0b103d]/80"
                        />
                        <select
                          name="isRequired"
                          defaultValue="true"
                          className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                        >
                          <option value="true">Wajib</option>
                          <option value="false">Opsional</option>
                        </select>
                        <Button
                          type="submit"
                          disabled={isLoading}
                          className="md:col-span-3 bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white"
                        >
                          Simpan Requirement Baru
                        </Button>
                      </form>
                    ) : null}

                    <Separator className="bg-white/10" />

                    <div className="space-y-2">
                      {activeProduct.requirements.length === 0 ? (
                        <p className="rounded-lg border border-white/10 bg-[#0b103d]/40 px-3 py-2 text-sm text-blue-100/60">
                          Belum ada requirement untuk produk ini.
                        </p>
                      ) : (
                        activeProduct.requirements.map((requirement) => {
                          const isEditing = editingRequirementId === requirement.id;

                          return (
                            <div
                              key={requirement.id}
                              className="rounded-lg border border-white/10 bg-[#0b103d]/45 p-3"
                            >
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div>
                                  <p className="text-sm font-semibold">{requirement.fieldLabel}</p>
                                  <p className="text-xs text-blue-100/60">
                                    {requirement.fieldKey} | {requirement.inputType} | {requirement.isRequired ? "Wajib" : "Opsional"}
                                  </p>
                                </div>
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="outline"
                                  className="border-white/25 bg-transparent text-blue-100 hover:bg-white/10 hover:text-white"
                                  onClick={() =>
                                    setEditingRequirementId((current) =>
                                      current === requirement.id ? null : requirement.id,
                                    )
                                  }
                                >
                                  {isEditing ? "Tutup" : "Edit"}
                                </Button>
                              </div>

                              {isEditing ? (
                                <form
                                  key={[
                                    requirement.id,
                                    requirement.fieldKey,
                                    requirement.fieldLabel,
                                    requirement.inputType,
                                    requirement.placeholder ?? "",
                                    requirement.validationRegex ?? "",
                                    requirement.helpText ?? "",
                                    requirement.isRequired ? "1" : "0",
                                    String(requirement.sortOrder),
                                  ].join("|")}
                                  onSubmit={async (event) => {
                                    event.preventDefault();
                                    await handleUpdateRequirement(
                                      requirement.id,
                                      new FormData(event.currentTarget),
                                    );
                                  }}
                                  className="mt-3 grid gap-2 md:grid-cols-3"
                                >
                                  <Input
                                    name="fieldKey"
                                    defaultValue={requirement.fieldKey}
                                    className="border-white/20 bg-[#0b103d]/80"
                                    required
                                  />
                                  <Input
                                    name="fieldLabel"
                                    defaultValue={requirement.fieldLabel}
                                    className="border-white/20 bg-[#0b103d]/80"
                                    required
                                  />
                                  <select
                                    name="inputType"
                                    defaultValue={requirement.inputType}
                                    className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                                  >
                                    {inputTypeOptions.map((option) => (
                                      <option key={option} value={option}>
                                        {option}
                                      </option>
                                    ))}
                                  </select>
                                  <Input
                                    name="placeholder"
                                    defaultValue={requirement.placeholder ?? ""}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <Input
                                    name="validationRegex"
                                    defaultValue={requirement.validationRegex ?? ""}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <Input
                                    name="helpText"
                                    defaultValue={requirement.helpText ?? ""}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <Input
                                    name="sortOrder"
                                    type="number"
                                    defaultValue={String(requirement.sortOrder)}
                                    className="border-white/20 bg-[#0b103d]/80"
                                  />
                                  <select
                                    name="isRequired"
                                    defaultValue={requirement.isRequired ? "true" : "false"}
                                    className="h-10 rounded-md border border-white/20 bg-[#0b103d]/80 px-3 text-sm"
                                  >
                                    <option value="true">Wajib</option>
                                    <option value="false">Opsional</option>
                                  </select>
                                  <div className="flex gap-2 md:col-span-3">
                                    <Button
                                      type="submit"
                                      size="sm"
                                      disabled={isLoading}
                                      className="bg-gradient-to-r from-fuchsia-600 to-blue-500 text-white"
                                    >
                                      Simpan Requirement
                                    </Button>
                                    <Button
                                      type="button"
                                      variant="destructive"
                                      size="sm"
                                      disabled={isLoading}
                                      onClick={() => handleDeleteRequirement(requirement.id)}
                                    >
                                      Hapus
                                    </Button>
                                  </div>
                                </form>
                              ) : null}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardHeader>
            </Card>
          )}
        </section>
      </div>
    </div>
  );
}
