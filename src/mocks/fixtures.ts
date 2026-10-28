import type { Nft } from "../types";

const asset = (file: string) =>
  `${import.meta.env.BASE_URL}assets/nfts/${file}`;

const featuredNfts: Nft[] = [
  {
    id: "emerald-ape-042",
    tokenId: "#0042",
    name: "Emerald Ape #042",
    price: "1.19",
    image: asset("emerald-ape-042.webp"),
    rarity: "RARO",
    category: "Arte digital",
    network: "Ethereum",
    stock: 50,
    version: 1,
  },
  {
    id: "sage-nomad-009",
    tokenId: "#0009",
    name: "Sage Nomad #009",
    price: "1.69",
    image: asset("sage-nomad-009.webp"),
    category: "Colecionáveis",
    network: "Polygon",
    stock: 10,
    version: 1,
  },
  {
    id: "neon-vessel-552",
    tokenId: "#0552",
    name: "Neon Vessel #552",
    price: "1.99",
    oldPrice: "2.29",
    image: asset("neon-vessel-552.webp"),
    category: "Arte digital",
    network: "Ethereum",
    stock: 8,
    version: 1,
  },
  {
    id: "cosmic-bloom-118",
    tokenId: "#0118",
    name: "Cosmic Bloom #118",
    price: "1.29",
    image: asset("cosmic-bloom-118.webp"),
    category: "Generativa",
    network: "Solana",
    stock: 12,
    version: 1,
  },
  {
    id: "violet-nomad-314",
    tokenId: "#0314",
    name: "Violet Nomad #314",
    price: "1.39",
    image: asset("violet-nomad-314.webp"),
    category: "Colecionáveis",
    network: "Polygon",
    stock: 10,
    version: 1,
  },
  {
    id: "ivory-baron-088",
    tokenId: "#0088",
    name: "Ivory Baron #088",
    price: "1.79",
    image: asset("ivory-baron-088.webp"),
    category: "Arte digital",
    network: "Ethereum",
    stock: 10,
    version: 1,
  },
  {
    id: "golden-beat-207",
    tokenId: "#0207",
    name: "Golden Beat #207",
    price: "0.99",
    image: asset("golden-beat-207.webp"),
    category: "Música",
    network: "Solana",
    stock: 50,
    version: 1,
  },
  {
    id: "golden-signal-160",
    tokenId: "#0160",
    name: "Golden Signal #160",
    price: "0.39",
    image: asset("golden-signal-160.webp"),
    category: "Música",
    network: "Polygon",
    stock: 25,
    version: 1,
  },
];

const names = [
  "Amber Genesis", "Lunar Frame", "Pixel Jaguar", "Prism Echo",
  "Velvet Orbit", "Chrome Spirit", "Solar Rhythm", "Mystic Lens",
  "Neon Totem", "Digital Flora", "Quantum Mask", "Aurora Pulse",
  "Jungle Cipher", "Crystal Nomad", "Electric Muse", "Obsidian Wave",
  "Meta Horizon", "Rare Signal", "Cyber Bloom", "Golden Habitat",
  "Violet Frequency", "Emerald Dream", "Ivory Circuit", "Cosmic Archive",
  "Sonic Relic", "Polygon Ritual", "Solana Vision", "Ether Canvas",
];
const categories = [
  "Arte digital", "Fotografia", "Música", "Arte 3D", "Colecionáveis",
  "Generativa", "Jogos", "Assinaturas", "Utilidade",
];
const networks = ["Ethereum", "Polygon", "Solana"] as const;
const images = [
  "emerald-ape-042.webp", "sage-nomad-009.webp", "neon-vessel-552.webp",
  "cosmic-bloom-118.webp", "violet-nomad-314.webp", "ivory-baron-088.webp",
  "golden-beat-207.webp", "golden-signal-160.webp",
];
const generatedNfts: Nft[] = names.map((name, index) => {
  const number = 401 + index;
  const category = categories[index % categories.length]!;
  const network = networks[index % networks.length]!;
  return {
    id: `${name.toLowerCase().replaceAll(" ", "-")}-${number}`,
    slug: `${name.toLowerCase().replaceAll(" ", "-")}-${number}`,
    tokenId: `#${String(number).padStart(4, "0")}`,
    name: `${name} #${number}`,
    creator: ["Lia Nakamura", "Caio Luz", "Maya Torres", "Noah Silva"][index % 4]!,
    collection: ["Jungle Genesis", "Kurio Signals", "Digital Rituals"][index % 3]!,
    description: `Obra da coleção Kurio inspirada em ${category.toLowerCase()}.`,
    price: (0.35 + (index % 12) * 0.21).toFixed(2),
    oldPrice: index % 4 === 0 ? (0.65 + (index % 12) * 0.21).toFixed(2) : undefined,
    image: asset(images[index % images.length]!),
    alt: `${name}, NFT da coleção Kurio`,
    rarity: index % 7 === 0 ? "RARO" : index % 11 === 0 ? "ÉPICO" : undefined,
    category,
    network,
    stock: 2 + (index * 7) % 49,
    createdAt: new Date(Date.UTC(2026, 9, 28 - index)).toISOString(),
    featured: index % 8 === 0,
    launch: index < 9,
    trending: index % 3 === 0,
    likes: 18 + index * 13,
    version: 1,
  };
});

export const nfts: Nft[] = [...featuredNfts, ...generatedNfts].map(
  (nft, index) => ({
    slug: nft.id,
    creator: "Kurio Collective",
    collection: "Jungle Genesis",
    description: "Arte digital selecionada para a coleção KURIO.",
    alt: `${nft.name}, NFT da coleção KURIO`,
    createdAt: new Date(Date.UTC(2026, 9, 28 - index)).toISOString(),
    featured: index < 4,
    launch: index < 12,
    trending: index % 3 === 0,
    likes: 42 + index * 9,
    ...nft,
  }),
);

export const demoUser = {
  id: "collector-1",
  name: "Colecionador Kurio",
  email: "contato@email.com",
  ens: "nova.kurio.eth",
};

export const secondDemoUser = {
  id: "collector-2",
  name: "Curadora Jungle",
  email: "curadora@email.com",
  ens: "jungle.kurio.eth",
};
