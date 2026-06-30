import { PrismaClient, CouponType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── CATEGORIES ──────────────────────────────────────────────────

  const crystals = await prisma.category.upsert({
    where: { slug: "crystals" },
    update: {},
    create: {
      slug: "crystals",
      name: "Crystals",
      description: "Natural crystals and gemstones in all forms",
      imageUrl: "https://res.cloudinary.com/demo/image/upload/crystals.jpg",
    },
  });

  const [rawCrystals, tumbledStones, clusters, jewelry, sets] =
    await Promise.all([
      prisma.category.upsert({
        where: { slug: "raw-crystals" },
        update: {},
        create: {
          slug: "raw-crystals",
          name: "Raw Crystals",
          description: "Unpolished natural crystal specimens",
          parentId: crystals.id,
        },
      }),
      prisma.category.upsert({
        where: { slug: "tumbled-stones" },
        update: {},
        create: {
          slug: "tumbled-stones",
          name: "Tumbled Stones",
          description: "Smooth, polished tumbled gemstones",
          parentId: crystals.id,
        },
      }),
      prisma.category.upsert({
        where: { slug: "crystal-clusters" },
        update: {},
        create: {
          slug: "crystal-clusters",
          name: "Crystal Clusters",
          description: "Beautiful natural crystal clusters and geodes",
          parentId: crystals.id,
        },
      }),
      prisma.category.upsert({
        where: { slug: "crystal-jewelry" },
        update: {},
        create: {
          slug: "crystal-jewelry",
          name: "Crystal Jewelry",
          description: "Handcrafted jewelry with natural crystals",
        },
      }),
      prisma.category.upsert({
        where: { slug: "crystal-sets" },
        update: {},
        create: {
          slug: "crystal-sets",
          name: "Crystal Sets & Kits",
          description: "Curated crystal collections for specific intentions",
        },
      }),
    ]);

  console.log("✅ Categories seeded");

  // ─── PRODUCTS ────────────────────────────────────────────────────

  const productData = [
    {
      slug: "amethyst-cluster-large",
      name: "Amethyst Cluster — Large",
      description:
        "A stunning deep-purple amethyst cluster from Uruguay. Known for its calming and protective energy, this natural specimen makes a powerful centrepiece for any space. Each cluster is unique in shape, size, and colour depth.",
      price: "89.99",
      compareAtPrice: "119.99",
      sku: "AME-CLU-LG-001",
      stock: 12,
      weight: 800,
      origin: "Uruguay",
      chakras: ["Crown", "Third Eye"],
      properties: ["Calming", "Protection", "Intuition", "Spiritual Growth"],
      isFeatured: true,
      categoryId: clusters.id,
      images: [
        { url: "https://images.unsplash.com/photo-1567225477277-c8162eb4b8c2?w=800", altText: "Amethyst cluster front view", position: 0 },
        { url: "https://images.unsplash.com/photo-1518977956812-cd3dbadaaf31?w=800", altText: "Amethyst cluster side view", position: 1 },
      ],
    },
    {
      slug: "rose-quartz-tower",
      name: "Rose Quartz Tower Point",
      description:
        "A beautifully polished rose quartz tower radiating gentle, loving energy. Rose quartz is the ultimate stone of love and compassion, promoting self-love, emotional healing, and attracting harmonious relationships.",
      price: "34.99",
      sku: "RQZ-TWR-001",
      stock: 25,
      weight: 250,
      origin: "Brazil",
      chakras: ["Heart"],
      properties: ["Love", "Compassion", "Emotional Healing", "Self-Care"],
      isFeatured: true,
      categoryId: rawCrystals.id,
      images: [
        { url: "https://images.unsplash.com/photo-1615486511484-92e172cc4fe0?w=800", altText: "Rose quartz tower", position: 0 },
      ],
    },
    {
      slug: "black-tourmaline-raw",
      name: "Black Tourmaline Raw Chunk",
      description:
        "A powerful raw black tourmaline specimen — one of the most effective protective crystals available. Shields against negative energy, EMF radiation, and psychic attacks. Perfect for placing near electronics or doorways.",
      price: "18.99",
      sku: "BLK-TRM-RAW-001",
      stock: 40,
      weight: 150,
      origin: "Brazil",
      chakras: ["Root"],
      properties: ["Protection", "Grounding", "EMF Shield", "Negative Energy Cleansing"],
      isFeatured: false,
      categoryId: rawCrystals.id,
      images: [
        { url: "https://images.unsplash.com/photo-1609862943032-00a9cce71cd4?w=800", altText: "Black tourmaline raw", position: 0 },
      ],
    },
    {
      slug: "clear-quartz-tumbled",
      name: "Clear Quartz Tumbled Stone",
      description:
        "The 'Master Healer' — a high-clarity tumbled clear quartz stone. Clear quartz amplifies energy, intentions, and the effects of other crystals. An essential addition to any crystal collection.",
      price: "8.99",
      sku: "CLR-QTZ-TUM-001",
      stock: 100,
      weight: 40,
      origin: "Brazil",
      chakras: ["All Chakras", "Crown"],
      properties: ["Amplification", "Clarity", "Healing", "Manifestation"],
      isFeatured: false,
      categoryId: tumbledStones.id,
      images: [
        { url: "https://images.unsplash.com/photo-1617218741048-6c21ed16c7a2?w=800", altText: "Clear quartz tumbled stone", position: 0 },
      ],
    },
    {
      slug: "citrine-cluster-natural",
      name: "Natural Citrine Cluster",
      description:
        "A rare natural citrine cluster from Congo — not heat-treated like most commercial citrine. Known as the 'Merchant Stone', it attracts abundance, success, and positive energy. The golden hues are breathtaking.",
      price: "64.99",
      compareAtPrice: "79.99",
      sku: "CTR-CLU-NAT-001",
      stock: 8,
      weight: 350,
      origin: "Democratic Republic of Congo",
      chakras: ["Solar Plexus", "Sacral"],
      properties: ["Abundance", "Manifestation", "Positivity", "Success"],
      isFeatured: true,
      categoryId: clusters.id,
      images: [
        { url: "https://images.unsplash.com/photo-1604607898792-73fcbfcd5b49?w=800", altText: "Natural citrine cluster", position: 0 },
      ],
    },
    {
      slug: "selenite-wand",
      name: "Selenite Charging Wand",
      description:
        "A silky-smooth selenite wand for cleansing, charging, and directing energy. Selenite never needs cleansing itself and can cleanse and recharge other crystals. Ideal for energy work, meditation, and crystal grids.",
      price: "14.99",
      sku: "SEL-WND-001",
      stock: 35,
      weight: 120,
      origin: "Morocco",
      chakras: ["Crown", "Higher Crown"],
      properties: ["Cleansing", "Charging", "Clarity", "Angelic Connection"],
      isFeatured: false,
      categoryId: rawCrystals.id,
      images: [
        { url: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?w=800", altText: "Selenite wand", position: 0 },
      ],
    },
    {
      slug: "lapis-lazuli-sphere",
      name: "Lapis Lazuli Sphere",
      description:
        "A deep royal-blue lapis lazuli sphere with golden pyrite flecks, polished to perfection. One of the oldest spiritual stones, associated with wisdom, truth, and inner power. A treasured collector's piece.",
      price: "54.99",
      sku: "LAP-LAZ-SPH-001",
      stock: 15,
      weight: 300,
      origin: "Afghanistan",
      chakras: ["Third Eye", "Throat"],
      properties: ["Wisdom", "Truth", "Communication", "Inner Power"],
      isFeatured: true,
      categoryId: tumbledStones.id,
      images: [
        { url: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=800", altText: "Lapis lazuli sphere", position: 0 },
      ],
    },
    {
      slug: "tigers-eye-tumbled-set",
      name: "Tiger's Eye Tumbled Set (5 pieces)",
      description:
        "A set of five beautifully matched golden tiger's eye tumbled stones. Tiger's eye combines earth energy with sun energy, promoting courage, confidence, and willpower. Perfect for manifesting goals.",
      price: "22.99",
      sku: "TGR-EYE-SET-5-001",
      stock: 30,
      weight: 200,
      origin: "South Africa",
      chakras: ["Solar Plexus", "Sacral", "Root"],
      properties: ["Courage", "Confidence", "Willpower", "Focus"],
      isFeatured: false,
      categoryId: tumbledStones.id,
      images: [
        { url: "https://images.unsplash.com/photo-1515688594390-b649af70d282?w=800", altText: "Tiger eye tumbled stones", position: 0 },
      ],
    },
    {
      slug: "chakra-crystal-kit",
      name: "7-Chakra Crystal Healing Kit",
      description:
        "A complete 7-chakra crystal set featuring one stone for each energy centre: Red Jasper (Root), Carnelian (Sacral), Yellow Citrine (Solar Plexus), Green Aventurine (Heart), Blue Lace Agate (Throat), Lapis Lazuli (Third Eye), and Amethyst (Crown). Comes in a velvet pouch with a guide card.",
      price: "39.99",
      compareAtPrice: "55.00",
      sku: "CHK-KIT-7-001",
      stock: 20,
      weight: 280,
      origin: "Various",
      chakras: ["Root", "Sacral", "Solar Plexus", "Heart", "Throat", "Third Eye", "Crown"],
      properties: ["Balance", "Healing", "Energy Alignment", "Beginners"],
      isFeatured: true,
      categoryId: sets.id,
      images: [
        { url: "https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=800", altText: "7 chakra crystal kit", position: 0 },
      ],
    },
    {
      slug: "labradorite-palm-stone",
      name: "Labradorite Palm Stone",
      description:
        "A mesmerising labradorite palm stone showcasing vivid labradorescence — flashes of blue, green, and gold within a dark grey base. Known as the stone of magic and transformation, it strengthens intuition and psychic abilities.",
      price: "28.99",
      sku: "LAB-PLM-001",
      stock: 22,
      weight: 180,
      origin: "Madagascar",
      chakras: ["Third Eye", "Crown", "All"],
      properties: ["Magic", "Transformation", "Intuition", "Psychic Protection"],
      isFeatured: false,
      categoryId: tumbledStones.id,
      images: [
        { url: "https://images.unsplash.com/photo-1567225477277-c8162eb4b8c2?w=800", altText: "Labradorite palm stone", position: 0 },
      ],
    },
    {
      slug: "moldavite-raw-fragment",
      name: "Moldavite Raw Fragment",
      description:
        "An authentic raw moldavite fragment — a rare tektite formed by a meteorite impact 15 million years ago. One of the most powerful transformation stones available, known for rapid change and spiritual awakening. Not for the faint-hearted.",
      price: "149.99",
      compareAtPrice: "189.99",
      sku: "MOL-RAW-001",
      stock: 5,
      weight: 5,
      origin: "Czech Republic",
      chakras: ["Heart", "Third Eye", "Crown"],
      properties: ["Transformation", "Spiritual Awakening", "Manifestation", "Rare"],
      isFeatured: true,
      categoryId: rawCrystals.id,
      images: [
        { url: "https://images.unsplash.com/photo-1604607898792-73fcbfcd5b49?w=800", altText: "Moldavite raw fragment", position: 0 },
      ],
    },
    {
      slug: "obsidian-arrowhead",
      name: "Black Obsidian Arrowhead",
      description:
        "A hand-knapped black obsidian arrowhead — a powerful symbol of protection and truth. Obsidian acts as a psychic vacuum cleaner, absorbing and dissolving negative energies, making it an excellent protective talisman.",
      price: "12.99",
      sku: "OBS-ARW-001",
      stock: 50,
      weight: 30,
      origin: "Mexico",
      chakras: ["Root"],
      properties: ["Protection", "Truth", "Grounding", "Psychic Cleansing"],
      isFeatured: false,
      categoryId: rawCrystals.id,
      images: [
        { url: "https://images.unsplash.com/photo-1609862943032-00a9cce71cd4?w=800", altText: "Black obsidian arrowhead", position: 0 },
      ],
    },
  ];

  for (const { images, ...product } of productData) {
    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {},
      create: {
        ...product,
        price: product.price as any,
        compareAtPrice: product.compareAtPrice as any,
        images: {
          create: images,
        },
      },
    });
  }

  console.log(`✅ ${productData.length} products seeded`);

  // ─── COLLECTIONS ─────────────────────────────────────────────────

  const featuredCollection = await prisma.collection.upsert({
    where: { slug: "staff-picks" },
    update: {},
    create: {
      slug: "staff-picks",
      name: "Staff Picks",
      description: "Hand-selected by our crystal experts",
      isActive: true,
    },
  });

  const newArrivalsCollection = await prisma.collection.upsert({
    where: { slug: "new-arrivals" },
    update: {},
    create: {
      slug: "new-arrivals",
      name: "New Arrivals",
      description: "The latest crystals to arrive in our shop",
      isActive: true,
    },
  });

  // Link featured products to Staff Picks collection
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    select: { id: true },
  });

  for (let i = 0; i < featuredProducts.length; i++) {
    await prisma.collectionProduct.upsert({
      where: {
        collectionId_productId: {
          collectionId: featuredCollection.id,
          productId: featuredProducts[i].id,
        },
      },
      update: {},
      create: {
        collectionId: featuredCollection.id,
        productId: featuredProducts[i].id,
        position: i,
      },
    });
  }

  // Link all products to New Arrivals
  const allProducts = await prisma.product.findMany({ select: { id: true } });
  for (let i = 0; i < allProducts.length; i++) {
    await prisma.collectionProduct.upsert({
      where: {
        collectionId_productId: {
          collectionId: newArrivalsCollection.id,
          productId: allProducts[i].id,
        },
      },
      update: {},
      create: {
        collectionId: newArrivalsCollection.id,
        productId: allProducts[i].id,
        position: i,
      },
    });
  }

  console.log("✅ Collections seeded");

  // ─── COUPONS ─────────────────────────────────────────────────────

  await Promise.all([
    prisma.coupon.upsert({
      where: { code: "WELCOME10" },
      update: {},
      create: {
        code: "WELCOME10",
        type: CouponType.PERCENT,
        value: "10",
        minOrderAmount: "20.00",
        usageLimit: 1000,
        isActive: true,
      },
    }),
    prisma.coupon.upsert({
      where: { code: "CRYSTAL20" },
      update: {},
      create: {
        code: "CRYSTAL20",
        type: CouponType.PERCENT,
        value: "20",
        minOrderAmount: "50.00",
        usageLimit: 500,
        isActive: true,
      },
    }),
    prisma.coupon.upsert({
      where: { code: "FREESHIP" },
      update: {},
      create: {
        code: "FREESHIP",
        type: CouponType.FREE_SHIPPING,
        value: "0",
        minOrderAmount: "30.00",
        usageLimit: 200,
        isActive: true,
      },
    }),
    prisma.coupon.upsert({
      where: { code: "SAVE5" },
      update: {},
      create: {
        code: "SAVE5",
        type: CouponType.FIXED,
        value: "5",
        minOrderAmount: "25.00",
        isActive: true,
      },
    }),
  ]);

  console.log("✅ Coupons seeded");
  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
