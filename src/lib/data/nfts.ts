export type Nft = {
  id: string;
  name: string;
  image: string;
  creator: string;
  creatorAvatar: string;
  priceEth: number;
  collection: string;
  category: "art" | "collectibles" | "photography" | "sports" | "gaming";
};

export type Seller = {
  id: string;
  handle: string;
  avatar: string;
  volumeUsd: number;
};

export type Collection = {
  id: string;
  name: string;
  cover: string;
  itemCount: number;
  floorEth: number;
};

export type Activity = {
  id: string;
  type: "sale" | "listing" | "bid" | "transfer";
  nftId: string;
  nftName: string;
  nftImage: string;
  from: string;
  to: string;
  priceEth: number;
  timeAgo: string;
};

const img = (seed: string, size = 600) =>
  `https://picsum.photos/seed/${seed}/${size}/${size}`;

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/identicon/svg?seed=${seed}&backgroundColor=22c55e,a855f7,06b6d4,f59e0b,ec4899`;

export const NFTS: Nft[] = [
  { id: "1", name: "Doodle #2733", image: img("doodle2733"), creator: "Doodles_LLC", creatorAvatar: avatar("Doodles_LLC"), priceEth: 14.5, collection: "Doodles", category: "art" },
  { id: "2", name: "Desperate ApeWife #516", image: img("apewife516"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 4.0, collection: "ApeWives", category: "collectibles" },
  { id: "3", name: "Goblintown #1881", image: img("goblin1881"), creator: "kingcove", creatorAvatar: avatar("kingcove"), priceEth: 20.0, collection: "Goblintown", category: "art" },
  { id: "4", name: "Bored Ape Kennel #6194", image: img("kennel6194"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 30.0, collection: "BAKC", category: "collectibles" },
  { id: "5", name: "Chimpers #150", image: img("chimper150"), creator: "Fozziebear", creatorAvatar: avatar("Fozziebear"), priceEth: 15.0, collection: "Chimpers", category: "collectibles" },
  { id: "6", name: "Bansky Mutant Ape", image: img("bansky"), creator: "gmoney", creatorAvatar: avatar("gmoney"), priceEth: 0.34, collection: "Mutants", category: "art" },
  { id: "7", name: "CryptoPunk #8952", image: img("punk8952"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 32.0, collection: "CryptoPunks", category: "collectibles" },
  { id: "8", name: "Fidenza #937", image: img("fidenza937"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 31.0, collection: "Art Blocks", category: "art" },
  { id: "9", name: "BoredApe", image: img("bayc134"), creator: "Mutant", creatorAvatar: avatar("Mutant"), priceEth: 38.0, collection: "BAYC", category: "collectibles" },
  { id: "10", name: "Moonbirds", image: img("moon119"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 20.0, collection: "Moonbirds", category: "art" },
  { id: "11", name: "CLONE X #6963", image: img("clonex6963"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 10.0, collection: "CLONE X", category: "gaming" },
  { id: "12", name: "Stoned Ape #2", image: img("stoned2"), creator: "gmoney", creatorAvatar: avatar("gmoney"), priceEth: 0.5, collection: "Stoned Apes", category: "art" },
  { id: "13", name: "Gutter Juice", image: img("gutter74"), creator: "kingcove", creatorAvatar: avatar("kingcove"), priceEth: 0.17, collection: "Gutter", category: "collectibles" },
  { id: "14", name: "BAYC #5088", image: img("bayc5088"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 60.0, collection: "BAYC", category: "collectibles" },
  { id: "15", name: "Doodle #47", image: img("doodle47"), creator: "REMEvault", creatorAvatar: avatar("REMEvault"), priceEth: 30.0, collection: "Doodles", category: "art" },
  { id: "16", name: "CryptoPunk #5108", image: img("punk5108"), creator: "Pbuck", creatorAvatar: avatar("Pbuck"), priceEth: 48.0, collection: "CryptoPunks", category: "collectibles" },
  { id: "17", name: "Rainbow Mutant #665", image: img("rainbow665"), creator: "gmoney", creatorAvatar: avatar("gmoney"), priceEth: 0.57, collection: "Mutants", category: "art" },
  { id: "18", name: "3D Doodle #7018", image: img("doodle7018"), creator: "REMEvault", creatorAvatar: avatar("REMEvault"), priceEth: 1.2, collection: "Doodles", category: "art" },
  { id: "19", name: "Bean #5179", image: img("bean5179"), creator: "tima", creatorAvatar: avatar("tima"), priceEth: 1.43, collection: "Beanz", category: "collectibles" },
  { id: "20", name: "Azuki #3401", image: img("azuki3401"), creator: "VoidRougue", creatorAvatar: avatar("VoidRougue"), priceEth: 12.8, collection: "Azuki", category: "art" },
];

export const SELLERS: Seller[] = [
  { id: "1", handle: "VoidRougue", avatar: avatar("VoidRougue"), volumeUsd: 175322 },
  { id: "2", handle: "kingcove", avatar: avatar("kingcove"), volumeUsd: 295160 },
  { id: "3", handle: "Fozziebear", avatar: avatar("Fozziebear"), volumeUsd: 257549 },
  { id: "4", handle: "Doodles_LLC", avatar: avatar("Doodles_LLC"), volumeUsd: 106905 },
  { id: "5", handle: "gmoney", avatar: avatar("gmoney"), volumeUsd: 158291 },
  { id: "6", handle: "REMEvault", avatar: avatar("REMEvault"), volumeUsd: 369688 },
];

export const COLLECTIONS: Collection[] = [
  { id: "1", name: "Bored Ape Yacht Club", cover: img("bayc-cover", 800), itemCount: 10000, floorEth: 38.5 },
  { id: "2", name: "CryptoPunks", cover: img("punks-cover", 800), itemCount: 10000, floorEth: 65.2 },
  { id: "3", name: "Doodles", cover: img("doodles-cover", 800), itemCount: 10000, floorEth: 8.9 },
  { id: "4", name: "Azuki", cover: img("azuki-cover", 800), itemCount: 10000, floorEth: 12.4 },
  { id: "5", name: "Moonbirds", cover: img("moonbirds-cover", 800), itemCount: 10000, floorEth: 6.7 },
  { id: "6", name: "CloneX", cover: img("clonex-cover", 800), itemCount: 19548, floorEth: 4.2 },
];

export const ACTIVITY: Activity[] = [
  { id: "a1", type: "sale", nftId: "7", nftName: "CryptoPunk #8952", nftImage: img("punk8952"), from: "tima", to: "VoidRougue", priceEth: 32.0, timeAgo: "2 minutes ago" },
  { id: "a2", type: "bid", nftId: "9", nftName: "BoredApe", nftImage: img("bayc134"), from: "kingcove", to: "Mutant", priceEth: 38.0, timeAgo: "12 minutes ago" },
  { id: "a3", type: "listing", nftId: "1", nftName: "Doodle #2733", nftImage: img("doodle2733"), from: "Doodles_LLC", to: "—", priceEth: 14.5, timeAgo: "1 hour ago" },
  { id: "a4", type: "transfer", nftId: "5", nftName: "Chimpers #150", nftImage: img("chimper150"), from: "Fozziebear", to: "gmoney", priceEth: 15.0, timeAgo: "3 hours ago" },
  { id: "a5", type: "sale", nftId: "14", nftName: "BAYC #5088", nftImage: img("bayc5088"), from: "tima", to: "REMEvault", priceEth: 60.0, timeAgo: "5 hours ago" },
  { id: "a6", type: "bid", nftId: "8", nftName: "Fidenza #937", nftImage: img("fidenza937"), from: "VoidRougue", to: "tima", priceEth: 30.5, timeAgo: "8 hours ago" },
  { id: "a7", type: "sale", nftId: "16", nftName: "CryptoPunk #5108", nftImage: img("punk5108"), from: "Pbuck", to: "kingcove", priceEth: 48.0, timeAgo: "1 day ago" },
  { id: "a8", type: "listing", nftId: "20", nftName: "Azuki #3401", nftImage: img("azuki3401"), from: "VoidRougue", to: "—", priceEth: 12.8, timeAgo: "1 day ago" },
];