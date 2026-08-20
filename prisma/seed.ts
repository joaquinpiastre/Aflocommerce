import { PrismaClient, OrderStatus, PaymentMethod, Role, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";

type ProductWithVariants = Prisma.ProductGetPayload<{ include: { variants: true } }>;

const prisma = new PrismaClient();

// Placeholder de imagen: servicio público que genera una imagen on-the-fly.
// Se reemplaza por fotos reales subidas desde el panel admin (UploadThing).
function placeholder(label: string, w = 900, h = 1125) {
  const text = encodeURIComponent(label);
  return `https://placehold.co/${w}x${h}/1a1616/e7e1da.png?text=${text}&font=roboto`;
}

type VariantSeed = {
  size: string;
  colorName: string;
  colorHex: string;
  stock: number;
};

type ProductSeed = {
  name: string;
  description: string;
  material: string;
  categorySlug: string;
  basePrice: number;
  salePrice?: number;
  featured?: boolean;
  images: string[];
  variants: VariantSeed[];
};

const CLOTHING_COLORS = [
  { name: "Negro", hex: "#0A0A0C" },
  { name: "Hueso", hex: "#E7E1DA" },
  { name: "Rojo", hex: "#B7262D" },
];

const CLOTHING_SIZES = ["S", "M", "L", "XL"];

function clothingVariants(stockBySize: Partial<Record<string, number>> = {}): VariantSeed[] {
  const variants: VariantSeed[] = [];
  for (const color of CLOTHING_COLORS) {
    for (const size of CLOTHING_SIZES) {
      variants.push({
        size,
        colorName: color.name,
        colorHex: color.hex,
        stock: stockBySize[size] ?? 12,
      });
    }
  }
  return variants;
}

async function main() {
  console.log("Seed: limpiando datos existentes...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.wishlistItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("Seed: creando categorías...");

  const indumentaria = await prisma.category.create({
    data: {
      name: "Indumentaria",
      slug: "indumentaria",
      description: "Remeras, buzos, camperas, joggers, gorras y musculosas Aflo.",
      image: placeholder("Indumentaria", 1200, 800),
    },
  });

  const [remeras, buzos, camperas, joggers, gorras, musculosas] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Remeras",
        slug: "remeras",
        description: "Remeras streetwear Aflo.",
        image: placeholder("Remeras", 1200, 800),
        parentId: indumentaria.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Buzos",
        slug: "buzos",
        description: "Buzos y hoodies Aflo.",
        image: placeholder("Buzos", 1200, 800),
        parentId: indumentaria.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Camperas",
        slug: "camperas",
        description: "Camperas urbanas Aflo.",
        image: placeholder("Camperas", 1200, 800),
        parentId: indumentaria.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Joggers",
        slug: "joggers",
        description: "Pantalones jogger Aflo.",
        image: placeholder("Joggers", 1200, 800),
        parentId: indumentaria.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Gorras",
        slug: "gorras",
        description: "Gorras Aflo.",
        image: placeholder("Gorras", 1200, 800),
        parentId: indumentaria.id,
      },
    }),
    prisma.category.create({
      data: {
        name: "Musculosas",
        slug: "musculosas",
        description: "Musculosas de entrenamiento Aflo.",
        image: placeholder("Musculosas", 1200, 800),
        parentId: indumentaria.id,
      },
    }),
  ]);

  const [termos, vasos, mates, accesorios] = await Promise.all([
    prisma.category.create({
      data: {
        name: "Termos",
        slug: "termos",
        description: "Termos de acero inoxidable Aflo.",
        image: placeholder("Termos", 1200, 800),
      },
    }),
    prisma.category.create({
      data: {
        name: "Vasos",
        slug: "vasos",
        description: "Vasos térmicos Aflo.",
        image: placeholder("Vasos", 1200, 800),
      },
    }),
    prisma.category.create({
      data: {
        name: "Mates",
        slug: "mates",
        description: "Mates de acero y calabaza Aflo.",
        image: placeholder("Mates", 1200, 800),
      },
    }),
    prisma.category.create({
      data: {
        name: "Accesorios",
        slug: "accesorios",
        description: "Riñoneras, gorros y accesorios Aflo.",
        image: placeholder("Accesorios", 1200, 800),
      },
    }),
  ]);

  console.log("Seed: creando productos y variantes...");

  const products: ProductSeed[] = [
    {
      name: "Remera Aflo Wolf Pack",
      description:
        "Remera oversize de algodón peinado 24/1 con estampa Wolf Pack en el pecho. Corte streetwear, caída relajada.",
      material: "100% algodón peinado 24/1, 220gsm",
      categorySlug: "remeras",
      basePrice: 24999,
      featured: true,
      images: [placeholder("Remera Wolf Pack 1"), placeholder("Remera Wolf Pack 2")],
      variants: clothingVariants(),
    },
    {
      name: "Remera Aflo Oversize Gold Wing",
      description:
        "Remera oversize con estampa dorada del ala del lobo Aflo en la espalda. Ideal para uso diario.",
      material: "100% algodón peinado 24/1, 220gsm",
      categorySlug: "remeras",
      basePrice: 26999,
      images: [placeholder("Remera Gold Wing 1"), placeholder("Remera Gold Wing 2")],
      variants: clothingVariants(),
    },
    {
      name: "Remera Aflo Basic Logo",
      description: "Remera básica de algodón con logo bordado Aflo en el pecho.",
      material: "100% algodón peinado, 180gsm",
      categorySlug: "remeras",
      basePrice: 19999,
      salePrice: 15999,
      images: [placeholder("Remera Basic Logo 1")],
      variants: clothingVariants({ S: 3, M: 4 }),
    },
    {
      name: "Musculosa Aflo Training",
      description: "Musculosa técnica de secado rápido para entrenamiento, con logo reflectivo.",
      material: "Poliéster dry-fit",
      categorySlug: "musculosas",
      basePrice: 17999,
      images: [placeholder("Musculosa Training 1")],
      variants: clothingVariants(),
    },
    {
      name: "Buzo Aflo Canguro Wolf",
      description:
        "Buzo canguro con capucha, bolsillo frontal y estampa Wolf Head en el pecho. Frisa interior.",
      material: "80% algodón, 20% poliéster, frisa 320gsm",
      categorySlug: "buzos",
      basePrice: 44999,
      featured: true,
      images: [placeholder("Buzo Canguro Wolf 1"), placeholder("Buzo Canguro Wolf 2")],
      variants: clothingVariants(),
    },
    {
      name: "Buzo Aflo Half Zip Premium",
      description: "Buzo half-zip premium con cuello alto y detalles dorados. Línea premium Aflo.",
      material: "Algodón peruano 340gsm",
      categorySlug: "buzos",
      basePrice: 52999,
      featured: true,
      images: [placeholder("Buzo Half Zip 1"), placeholder("Buzo Half Zip 2")],
      variants: clothingVariants({ XL: 2 }),
    },
    {
      name: "Campera Aflo Windbreaker",
      description: "Campera rompeviento con forro de red, bolsillos con cierre y capucha plegable.",
      material: "Nylon ripstop impermeable",
      categorySlug: "camperas",
      basePrice: 64999,
      images: [placeholder("Campera Windbreaker 1"), placeholder("Campera Windbreaker 2")],
      variants: clothingVariants(),
    },
    {
      name: "Campera Aflo Bomber Urban",
      description: "Campera bomber urbana con detalles en dorado y cabeza de lobo bordada.",
      material: "Poliéster acolchado",
      categorySlug: "camperas",
      basePrice: 74999,
      salePrice: 61999,
      featured: true,
      images: [placeholder("Campera Bomber 1"), placeholder("Campera Bomber 2")],
      variants: clothingVariants({ S: 2, XL: 1 }),
    },
    {
      name: "Jogger Aflo Cargo Street",
      description: "Jogger cargo con bolsillos laterales, puño elastizado y cintura ajustable.",
      material: "Algodón sarga 260gsm",
      categorySlug: "joggers",
      basePrice: 39999,
      images: [placeholder("Jogger Cargo 1"), placeholder("Jogger Cargo 2")],
      variants: clothingVariants(),
    },
    {
      name: "Jogger Aflo Basic Fit",
      description: "Jogger básico slim fit, tela de frisa liviana ideal para entretiempo.",
      material: "Algodón frisa 240gsm",
      categorySlug: "joggers",
      basePrice: 34999,
      images: [placeholder("Jogger Basic 1")],
      variants: clothingVariants(),
    },
    {
      name: "Gorra Aflo Snapback Wolf",
      description: "Gorra snapback con bordado 3D de la cabeza de lobo Aflo. Visera plana.",
      material: "Algodón / poliéster, cierre snapback ajustable",
      categorySlug: "gorras",
      basePrice: 18999,
      featured: true,
      images: [placeholder("Gorra Snapback 1"), placeholder("Gorra Snapback 2")],
      variants: [
        { size: "Única", colorName: "Negro", colorHex: "#0A0A0C", stock: 20 },
        { size: "Única", colorName: "Rojo", colorHex: "#B7262D", stock: 15 },
        { size: "Única", colorName: "Hueso", colorHex: "#E7E1DA", stock: 10 },
      ],
    },
    {
      name: "Termo Aflo Acero 1L",
      description:
        "Termo de acero inoxidable de doble capa, mantiene la temperatura hasta 12 horas. Pico cebador y cierre hermético.",
      material: "Acero inoxidable 18/8",
      categorySlug: "termos",
      basePrice: 45999,
      featured: true,
      images: [placeholder("Termo Acero 1L", 900, 1200), placeholder("Termo Acero 1L detalle", 900, 1200)],
      variants: [
        { size: "1L", colorName: "Negro", colorHex: "#0A0A0C", stock: 25 },
        { size: "1L", colorName: "Dorado", colorHex: "#C3966A", stock: 12 },
        { size: "1L", colorName: "Rojo", colorHex: "#B7262D", stock: 8 },
      ],
    },
    {
      name: "Termo Aflo Mini 500ml",
      description: "Termo compacto de 500ml ideal para el día a día, acero inoxidable de doble capa.",
      material: "Acero inoxidable 18/8",
      categorySlug: "termos",
      basePrice: 32999,
      images: [placeholder("Termo Mini 500ml", 900, 1200)],
      variants: [
        { size: "500ml", colorName: "Negro", colorHex: "#0A0A0C", stock: 18 },
        { size: "500ml", colorName: "Hueso", colorHex: "#E7E1DA", stock: 14 },
      ],
    },
    {
      name: "Vaso Aflo Térmico 473ml",
      description: "Vaso térmico de acero inoxidable con tapa deslizable, mantiene frío o caliente por horas.",
      material: "Acero inoxidable 18/8",
      categorySlug: "vasos",
      basePrice: 27999,
      images: [placeholder("Vaso Térmico", 900, 1200)],
      variants: [
        { size: "473ml", colorName: "Negro", colorHex: "#0A0A0C", stock: 22 },
        { size: "473ml", colorName: "Dorado", colorHex: "#C3966A", stock: 9 },
        { size: "473ml", colorName: "Rojo", colorHex: "#B7262D", stock: 4 },
      ],
    },
    {
      name: "Mate Aflo Imperial Acero",
      description: "Mate imperial de acero inoxidable con grabado láser del logo Aflo. Incluye bombilla.",
      material: "Acero inoxidable",
      categorySlug: "mates",
      basePrice: 29999,
      images: [placeholder("Mate Imperial", 900, 1200)],
      variants: [
        { size: "Único", colorName: "Negro", colorHex: "#0A0A0C", stock: 16 },
        { size: "Único", colorName: "Dorado", colorHex: "#C3966A", stock: 6 },
      ],
    },
    {
      name: "Riñonera Aflo Pack",
      description: "Riñonera urbana con compartimentos, correa ajustable y detalle reflectivo Aflo.",
      material: "Poliéster resistente al agua",
      categorySlug: "accesorios",
      basePrice: 22999,
      images: [placeholder("Riñonera Pack", 900, 1200)],
      variants: [
        { size: "Única", colorName: "Negro", colorHex: "#0A0A0C", stock: 3 },
        { size: "Única", colorName: "Rojo", colorHex: "#B7262D", stock: 10 },
      ],
    },
  ];

  function slugify(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  const categoryBySlug: Record<string, string> = {
    remeras: remeras.id,
    buzos: buzos.id,
    camperas: camperas.id,
    joggers: joggers.id,
    gorras: gorras.id,
    musculosas: musculosas.id,
    termos: termos.id,
    vasos: vasos.id,
    mates: mates.id,
    accesorios: accesorios.id,
  };

  const createdProducts: ProductWithVariants[] = [];
  for (const p of products) {
    const slug = slugify(p.name);
    const created = await prisma.product.create({
      data: {
        name: p.name,
        slug,
        description: p.description,
        material: p.material,
        categoryId: categoryBySlug[p.categorySlug],
        basePrice: p.basePrice,
        salePrice: p.salePrice,
        featured: p.featured ?? false,
        active: true,
        images: p.images,
        variants: {
          create: p.variants.map((v, idx) => ({
            size: v.size,
            colorName: v.colorName,
            colorHex: v.colorHex,
            stock: v.stock,
            sku: `${slug.toUpperCase()}-${v.size.replace(/[^A-Za-z0-9]/g, "")}-${v.colorName
              .slice(0, 3)
              .toUpperCase()}-${idx}`,
          })),
        },
      },
      include: { variants: true },
    });
    createdProducts.push(created);
  }

  console.log(`Seed: ${createdProducts.length} productos creados.`);

  console.log("Seed: creando usuarios...");

  const adminPasswordHash = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.user.create({
    data: {
      name: "Admin Aflo",
      email: "admin@aflo.com",
      passwordHash: adminPasswordHash,
      role: Role.ADMIN,
      phone: "+54 9 11 5555-0001",
      emailVerified: new Date(),
    },
  });

  const customerPasswordHash = await bcrypt.hash("Cliente123!", 10);
  const customer = await prisma.user.create({
    data: {
      name: "Juan Pérez",
      email: "cliente@aflo.com",
      passwordHash: customerPasswordHash,
      role: Role.CUSTOMER,
      phone: "+54 9 11 5555-0002",
      emailVerified: new Date(),
    },
  });

  const address = await prisma.address.create({
    data: {
      userId: customer.id,
      label: "Casa",
      street: "Av. Corrientes 1234, 5° B",
      city: "Ciudad Autónoma de Buenos Aires",
      province: "Buenos Aires",
      postalCode: "C1043",
      phone: "+54 9 11 5555-0002",
      isDefault: true,
    },
  });

  console.log("Seed: creando órdenes de ejemplo...");

  function pickVariant(product: (typeof createdProducts)[number], index = 0) {
    return product.variants[index % product.variants.length];
  }

  const orderSeeds = [
    {
      status: OrderStatus.ENTREGADO,
      items: [
        { product: createdProducts[0], variantIdx: 1, qty: 1 },
        { product: createdProducts[11], variantIdx: 0, qty: 1 },
      ],
      daysAgo: 20,
    },
    {
      status: OrderStatus.ENVIADO,
      items: [{ product: createdProducts[4], variantIdx: 2, qty: 1 }],
      daysAgo: 6,
    },
    {
      status: OrderStatus.PAGADO,
      items: [
        { product: createdProducts[7], variantIdx: 0, qty: 1 },
        { product: createdProducts[9], variantIdx: 0, qty: 2 },
      ],
      daysAgo: 2,
    },
    {
      status: OrderStatus.PENDIENTE,
      items: [{ product: createdProducts[12], variantIdx: 1, qty: 1 }],
      daysAgo: 0,
    },
  ];

  let orderCounter = 1000;
  for (const seed of orderSeeds) {
    const createdAt = new Date(Date.now() - seed.daysAgo * 24 * 60 * 60 * 1000);
    const items = seed.items.map(({ product, variantIdx, qty }) => {
      const variant = pickVariant(product, variantIdx);
      const unitPrice = Number(variant.price ?? product.salePrice ?? product.basePrice);
      return {
        productId: product.id,
        variantId: variant.id,
        quantity: qty,
        unitPrice,
        subtotal: unitPrice * qty,
        productName: product.name,
        size: variant.size,
        colorName: variant.colorName,
      };
    });
    const subtotal = items.reduce((acc, it) => acc + it.subtotal, 0);
    const shippingCost = subtotal >= 80000 ? 0 : 4500;
    const total = subtotal + shippingCost;
    orderCounter += 1;

    await prisma.order.create({
      data: {
        orderNumber: `AFLO-${orderCounter}`,
        userId: customer.id,
        status: seed.status,
        paymentMethod: PaymentMethod.MERCADO_PAGO,
        subtotal,
        shippingCost,
        total,
        addressId: address.id,
        shippingStreet: address.street,
        shippingCity: address.city,
        shippingProvince: address.province,
        shippingPostalCode: address.postalCode,
        shippingPhone: address.phone,
        createdAt,
        updatedAt: createdAt,
        items: { create: items },
      },
    });
  }

  console.log("Seed completado ✔");
  console.log("----------------------------------------");
  console.log("Admin:    admin@aflo.com / Admin123!");
  console.log("Cliente:  cliente@aflo.com / Cliente123!");
  console.log("----------------------------------------");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
