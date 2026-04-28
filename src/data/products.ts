export const productCategories = [
  "Apps Premium",
  "Pulsa",
  "Token Listrik",
  "Topup Game",
] as const;

export type ProductCategory = (typeof productCategories)[number];

export const productVariantTypes = [
  "VARIAN",
] as const;

export type ProductVariantType = (typeof productVariantTypes)[number];

export const productInputTypes = ["TEXT", "NUMBER", "TEL", "SELECT"] as const;

export type ProductInputType = (typeof productInputTypes)[number];

export type ProductVariant = {
  id: string;
  label: string;
  type: ProductVariantType;
  value: string;
  price: number;
  promoPrice?: number | null;
  promoStartAt?: string | null;
  promoEndAt?: string | null;
  isDefault?: boolean;
  isActive?: boolean;
  sortOrder?: number;
};

export type ProductRequirementField = {
  key: string;
  label: string;
  inputType: ProductInputType;
  placeholder: string;
  required: boolean;
  validationRegex?: string;
  helperText?: string;
};

export type ProductItem = {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  description: string;
  variants: ProductVariant[];
  terms: string[];
  requirements: ProductRequirementField[];
  short: string;
  color: string;
};

const commonTerms = [
  "Pesanan diproses setelah pembayaran dikonfirmasi admin.",
  "Data tujuan wajib benar sebelum checkout via WhatsApp.",
  "Garansi mengikuti masa aktif dan ketentuan tiap produk.",
];

const requirementsByCategory: Record<ProductCategory, ProductRequirementField[]> = {
  "Apps Premium": [
    {
      key: "customerWhatsapp",
      label: "Nomor WhatsApp Aktif",
      inputType: "TEL",
      placeholder: "Contoh: 081234567890",
      required: true,
      validationRegex: "^(?:\\+?62|0)[2-9][0-9]{7,12}$",
      helperText: "Nomor aktif untuk proses akun dan konfirmasi order.",
    },
  ],
  Pulsa: [
    {
      key: "targetNumber",
      label: "Nomor HP Tujuan",
      inputType: "TEL",
      placeholder: "Contoh: 081234567890",
      required: true,
      validationRegex: "^(?:\\+?62|0)[2-9][0-9]{7,12}$",
      helperText: "Pastikan nomor benar agar pulsa tidak salah kirim.",
    },
  ],
  "Token Listrik": [
    {
      key: "meterNumber",
      label: "ID Pelanggan / Nomor Meter",
      inputType: "NUMBER",
      placeholder: "Contoh: 12345678901",
      required: true,
      validationRegex: "^[0-9]{11,13}$",
      helperText: "Masukkan nomor pelanggan PLN yang valid.",
    },
  ],
  "Topup Game": [
    {
      key: "gameUserId",
      label: "User ID Game",
      inputType: "TEXT",
      placeholder: "Masukkan user ID game",
      required: true,
      helperText: "User ID wajib benar agar topup masuk ke akun yang tepat.",
    },
    {
      key: "gameServerId",
      label: "Server ID (jika diperlukan game)",
      inputType: "TEXT",
      placeholder: "Contoh: 1234",
      required: false,
      helperText: "Isi untuk game yang membutuhkan server ID.",
    },
  ],
};

function withCategoryRequirements(category: ProductCategory) {
  return requirementsByCategory[category].map((item) => ({ ...item }));
}

export const productCatalog: ProductItem[] = [
  {
    id: "apps-capcut-pro",
    slug: "capcut-pro",
    name: "CapCut Pro",
    category: "Apps Premium",
    description:
      "Akses fitur edit premium, template eksklusif, dan export kualitas tinggi untuk creator.",
    variants: [
      {
        id: "capcut-jenis-private",
        label: "Akun Private",
        type: "VARIAN",
        value: "private",
        price: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "capcut-jenis-sharing",
        label: "Akun Sharing",
        type: "VARIAN",
        value: "sharing",
        price: 0,
        sortOrder: 2,
      },
      {
        id: "capcut-durasi-1m",
        label: "Durasi 1 Bulan",
        type: "VARIAN",
        value: "1_bulan",
        price: 49000,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "capcut-durasi-1y",
        label: "Durasi 1 Tahun",
        type: "VARIAN",
        value: "1_tahun",
        price: 149000,
        promoPrice: 129000,
        promoStartAt: "2026-01-01T00:00:00.000Z",
        promoEndAt: "2026-12-31T23:59:59.000Z",
        sortOrder: 2,
      },
    ],
    terms: [
      ...commonTerms,
      "Akun tidak boleh digunakan untuk aktivitas yang melanggar kebijakan platform.",
    ],
    requirements: withCategoryRequirements("Apps Premium"),
    short: "CC",
    color: "from-zinc-100/95 to-zinc-300/75",
  },
  {
    id: "apps-adobe-creative-cloud",
    slug: "adobe-creative-cloud",
    name: "Adobe Creative Cloud",
    category: "Apps Premium",
    description:
      "Bundle aplikasi Adobe premium untuk desain, video, dan produktivitas kreatif.",
    variants: [
      {
        id: "adobe-jenis-private",
        label: "Akun Private",
        type: "VARIAN",
        value: "private",
        price: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "adobe-jenis-sharing",
        label: "Akun Sharing",
        type: "VARIAN",
        value: "sharing",
        price: 0,
        sortOrder: 2,
      },
      {
        id: "adobe-durasi-1m",
        label: "Durasi 1 Bulan",
        type: "VARIAN",
        value: "1_bulan",
        price: 89000,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "adobe-durasi-1y",
        label: "Durasi 1 Tahun",
        type: "VARIAN",
        value: "1_tahun",
        price: 199000,
        sortOrder: 2,
      },
    ],
    terms: [
      ...commonTerms,
      "Masa aktif mengikuti paket durasi yang dipilih saat checkout.",
    ],
    requirements: withCategoryRequirements("Apps Premium"),
    short: "AD",
    color: "from-fuchsia-500/90 to-orange-500/80",
  },
  {
    id: "pulsa-reguler",
    slug: "pulsa-reguler",
    name: "Pulsa Reguler",
    category: "Pulsa",
    description:
      "Isi pulsa reguler cepat untuk berbagai provider dengan pilihan nominal lengkap.",
    variants: [
      {
        id: "pulsa-reguler-provider-telkomsel",
        label: "Provider Telkomsel",
        type: "VARIAN",
        value: "telkomsel",
        price: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "pulsa-reguler-provider-indosat",
        label: "Provider Indosat",
        type: "VARIAN",
        value: "indosat",
        price: 0,
        sortOrder: 2,
      },
      {
        id: "pulsa-reguler-provider-xl",
        label: "Provider XL",
        type: "VARIAN",
        value: "xl",
        sortOrder: 3,
        price: 0,
      },
      {
        id: "pulsa-reguler-nominal-10k",
        label: "Nominal 10.000",
        type: "VARIAN",
        value: "10000",
        price: 11500,
        isDefault: true,
        sortOrder: 10,
      },
      {
        id: "pulsa-reguler-nominal-25k",
        label: "Nominal 25.000",
        type: "VARIAN",
        value: "25000",
        price: 26800,
        promoPrice: 25500,
        promoStartAt: "2026-01-01T00:00:00.000Z",
        promoEndAt: "2026-12-31T23:59:59.000Z",
        sortOrder: 11,
      },
      {
        id: "pulsa-reguler-nominal-50k",
        label: "Nominal 50.000",
        type: "VARIAN",
        value: "50000",
        price: 51800,
        sortOrder: 12,
      },
    ],
    terms: [
      ...commonTerms,
      "Pulsa yang sudah masuk tidak dapat dibatalkan atau direfund.",
    ],
    requirements: withCategoryRequirements("Pulsa"),
    short: "PU",
    color: "from-red-500/90 to-rose-600/80",
  },
  {
    id: "pulsa-data",
    slug: "pulsa-data",
    name: "Pulsa Data",
    category: "Pulsa",
    description:
      "Pembelian paket data cepat dengan pilihan provider dan nominal kuota fleksibel.",
    variants: [
      {
        id: "pulsa-data-provider-tri",
        label: "Provider Tri",
        type: "VARIAN",
        value: "tri",
        price: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "pulsa-data-provider-axis",
        label: "Provider Axis",
        type: "VARIAN",
        value: "axis",
        price: 0,
        sortOrder: 2,
      },
      {
        id: "pulsa-data-provider-smartfren",
        label: "Provider Smartfren",
        type: "VARIAN",
        value: "smartfren",
        sortOrder: 3,
        price: 0,
      },
      {
        id: "pulsa-data-nominal-5gb",
        label: "Paket 5 GB",
        type: "VARIAN",
        value: "5gb",
        price: 26000,
        isDefault: true,
        sortOrder: 10,
      },
      {
        id: "pulsa-data-nominal-10gb",
        label: "Paket 10 GB",
        type: "VARIAN",
        value: "10gb",
        price: 49000,
        sortOrder: 11,
      },
      {
        id: "pulsa-data-nominal-20gb",
        label: "Paket 20 GB",
        type: "VARIAN",
        value: "20gb",
        price: 89000,
        sortOrder: 12,
      },
    ],
    terms: [
      ...commonTerms,
      "Jenis paket data menyesuaikan ketersediaan provider saat diproses.",
    ],
    requirements: withCategoryRequirements("Pulsa"),
    short: "PD",
    color: "from-sky-500/90 to-blue-600/80",
  },
  {
    id: "token-pln-rumah-tangga",
    slug: "token-pln-rumah-tangga",
    name: "Token Listrik PLN Rumah Tangga",
    category: "Token Listrik",
    description:
      "Pembelian token listrik PLN prabayar untuk kebutuhan rumah tangga dengan proses cepat.",
    variants: [
      {
        id: "token-rumah-20k",
        label: "Nominal 20.000",
        type: "VARIAN",
        value: "20000",
        price: 22000,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "token-rumah-50k",
        label: "Nominal 50.000",
        type: "VARIAN",
        value: "50000",
        price: 52000,
        sortOrder: 2,
      },
      {
        id: "token-rumah-100k",
        label: "Nominal 100.000",
        type: "VARIAN",
        value: "100000",
        price: 102000,
        sortOrder: 3,
      },
    ],
    terms: [
      ...commonTerms,
      "Kode token dikirim setelah transaksi berhasil diverifikasi.",
    ],
    requirements: withCategoryRequirements("Token Listrik"),
    short: "TR",
    color: "from-cyan-500/90 to-blue-500/80",
  },
  {
    id: "token-pln-bisnis",
    slug: "token-pln-bisnis",
    name: "Token Listrik PLN Bisnis",
    category: "Token Listrik",
    description:
      "Token listrik nominal besar untuk kebutuhan bisnis dengan dukungan prioritas.",
    variants: [
      {
        id: "token-bisnis-100k",
        label: "Nominal 100.000",
        type: "VARIAN",
        value: "100000",
        price: 102500,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "token-bisnis-200k",
        label: "Nominal 200.000",
        type: "VARIAN",
        value: "200000",
        price: 203000,
        sortOrder: 2,
      },
      {
        id: "token-bisnis-500k",
        label: "Nominal 500.000",
        type: "VARIAN",
        value: "500000",
        price: 503000,
        sortOrder: 3,
      },
    ],
    terms: [
      ...commonTerms,
      "Pastikan nomor pelanggan sesuai agar token dapat digunakan.",
    ],
    requirements: withCategoryRequirements("Token Listrik"),
    short: "TB",
    color: "from-blue-500/90 to-indigo-600/80",
  },
  {
    id: "topup-game-diamond",
    slug: "topup-game-diamond",
    name: "Topup Game Diamond",
    category: "Topup Game",
    description:
      "Topup diamond instan untuk game populer. Pilih game dan nominal sesuai kebutuhan.",
    variants: [
      {
        id: "topup-diamond-game-ml",
        label: "Mobile Legends",
        type: "VARIAN",
        value: "mobile_legends",
        price: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "topup-diamond-game-ff",
        label: "Free Fire",
        type: "VARIAN",
        value: "free_fire",
        price: 0,
        sortOrder: 2,
      },
      {
        id: "topup-diamond-game-hok",
        label: "Honor of Kings",
        type: "VARIAN",
        value: "honor_of_kings",
        price: 0,
        sortOrder: 3,
      },
      {
        id: "topup-diamond-nominal-86",
        label: "86 Diamond",
        type: "VARIAN",
        value: "86",
        price: 22000,
        isDefault: true,
        sortOrder: 10,
      },
      {
        id: "topup-diamond-nominal-172",
        label: "172 Diamond",
        type: "VARIAN",
        value: "172",
        price: 43000,
        sortOrder: 11,
      },
      {
        id: "topup-diamond-nominal-257",
        label: "257 Diamond",
        type: "VARIAN",
        value: "257",
        price: 64000,
        sortOrder: 12,
      },
    ],
    terms: [
      ...commonTerms,
      "User ID wajib valid. Kesalahan input menjadi tanggung jawab pembeli.",
    ],
    requirements: withCategoryRequirements("Topup Game"),
    short: "TD",
    color: "from-orange-500/90 to-red-500/80",
  },
  {
    id: "topup-game-voucher",
    slug: "topup-game-voucher",
    name: "Topup Game Voucher",
    category: "Topup Game",
    description:
      "Topup voucher dan crystal untuk berbagai game dengan proses manual cepat via WhatsApp.",
    variants: [
      {
        id: "topup-voucher-game-genshin",
        label: "Genshin Impact",
        type: "VARIAN",
        value: "genshin_impact",
        price: 0,
        isDefault: true,
        sortOrder: 1,
      },
      {
        id: "topup-voucher-game-pubg",
        label: "PUBG Mobile",
        type: "VARIAN",
        value: "pubg_mobile",
        price: 0,
        sortOrder: 2,
      },
      {
        id: "topup-voucher-game-valorant",
        label: "Valorant",
        type: "VARIAN",
        value: "valorant",
        price: 0,
        sortOrder: 3,
      },
      {
        id: "topup-voucher-nominal-small",
        label: "Nominal Kecil",
        type: "VARIAN",
        value: "small",
        price: 30000,
        isDefault: true,
        sortOrder: 10,
      },
      {
        id: "topup-voucher-nominal-medium",
        label: "Nominal Sedang",
        type: "VARIAN",
        value: "medium",
        price: 85000,
        promoPrice: 79000,
        promoStartAt: "2026-01-01T00:00:00.000Z",
        promoEndAt: "2026-12-31T23:59:59.000Z",
        sortOrder: 11,
      },
      {
        id: "topup-voucher-nominal-large",
        label: "Nominal Besar",
        type: "VARIAN",
        value: "large",
        price: 175000,
        sortOrder: 12,
      },
    ],
    terms: [
      ...commonTerms,
      "Server ID wajib diisi untuk game yang membutuhkan identifikasi server.",
    ],
    requirements: withCategoryRequirements("Topup Game"),
    short: "TV",
    color: "from-blue-400/90 to-fuchsia-500/80",
  },
];

export function formatRupiah(value: number): string {
  return `Rp ${new Intl.NumberFormat("id-ID").format(Math.max(0, value))}`;
}

function parseDate(value?: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function isVariantPromoActive(variant: ProductVariant, now = new Date()): boolean {
  const promoPrice = variant.promoPrice ?? null;

  if (!promoPrice || promoPrice <= 0 || promoPrice >= variant.price) {
    return false;
  }

  const startAt = parseDate(variant.promoStartAt);
  const endAt = parseDate(variant.promoEndAt);

  if (startAt && now < startAt) {
    return false;
  }

  if (endAt && now > endAt) {
    return false;
  }

  return true;
}

export function getVariantEffectivePrice(variant: ProductVariant, now = new Date()): number {
  if (isVariantPromoActive(variant, now)) {
    return variant.promoPrice as number;
  }

  return variant.price;
}

export function hasActivePromo(product: ProductItem, now = new Date()): boolean {
  return product.variants.some(
    (variant) => (variant.isActive ?? true) && isVariantPromoActive(variant, now),
  );
}

export function getStartingPriceSummary(
  product: ProductItem,
  now = new Date(),
): { price: number; originalPrice: number | null; hasPromo: boolean } {
  const priceVariants = product.variants.filter(
    (variant) => (variant.isActive ?? true) && variant.price > 0,
  );

  if (priceVariants.length === 0) {
    return {
      price: 0,
      originalPrice: null,
      hasPromo: false,
    };
  }

  const candidate = priceVariants
    .map((variant) => {
      const effectivePrice = getVariantEffectivePrice(variant, now);
      const promoActive = effectivePrice < variant.price;

      return {
        effectivePrice,
        originalPrice: promoActive ? variant.price : null,
      };
    })
    .sort((a, b) => a.effectivePrice - b.effectivePrice)[0];

  return {
    price: candidate.effectivePrice,
    originalPrice: candidate.originalPrice,
    hasPromo: candidate.originalPrice !== null,
  };
}

export function getStartingPrice(product: ProductItem): number {
  return getStartingPriceSummary(product).price;
}

export function getProductBySlug(slug: string): ProductItem | undefined {
  return productCatalog.find((product) => product.slug === slug);
}

export function getAllProductSlugs(): string[] {
  return productCatalog.map((product) => product.slug);
}

export const homepagePopularProductSlugs: string[] = [
  "capcut-pro",
  "adobe-creative-cloud",
  "pulsa-reguler",
  "token-pln-rumah-tangga",
  "topup-game-diamond",
];

export function getHomepagePopularProducts(): ProductItem[] {
  const productMap = new Map(productCatalog.map((product) => [product.slug, product]));

  return homepagePopularProductSlugs
    .map((slug) => productMap.get(slug))
    .filter((product): product is ProductItem => Boolean(product));
}

