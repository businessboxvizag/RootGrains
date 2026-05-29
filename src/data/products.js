export const allProducts = [
  // ── NON-BASMATI → SONA MASOORIE ─────────────────────────────────────────
  { id: "1",  category: "non-basmati", subCategory: "sona-masoorie", nameKey: "sonaRaw",   weight: "1 kg",  price: 60,  perKgPrice: 60,  img: "/products/raw1kg.png" },
  { id: "2",  category: "non-basmati", subCategory: "sona-masoorie", nameKey: "sonaRaw",   weight: "2 kg",  price: 110, perKgPrice: 55,  img: "/products/raw2kg.png" },
  { id: "5",  category: "non-basmati", subCategory: "sona-masoorie", nameKey: "sonaRaw",   weight: "5 kg",  price: 260, perKgPrice: 52,  img: "/products/raw2kg.png" },
  { id: "7",  category: "non-basmati", subCategory: "sona-masoorie", nameKey: "sonaRaw",   weight: "10 kg", price: 490, perKgPrice: 49,  img: "/products/raw1kg.png" },
  { id: "7b", category: "non-basmati", subCategory: "sona-masoorie", nameKey: "sonaRaw",   weight: "25 kg", price: 1150, perKgPrice: 46, img: "/products/raw1kg.png" },

  // ── NON-BASMATI → STEAM RICE ─────────────────────────────────────────────
  { id: "3",  category: "non-basmati", subCategory: "steam-rice", nameKey: "sonaSteam",  weight: "2 kg",  price: 130, perKgPrice: 65,  img: "/products/steam2kg1.png" },
  { id: "4",  category: "non-basmati", subCategory: "steam-rice", nameKey: "sonaSteam",  weight: "2 kg",  price: 140, perKgPrice: 70,  img: "/products/steam2kg2.png" },
  { id: "6",  category: "non-basmati", subCategory: "steam-rice", nameKey: "sonaSteam",  weight: "5 kg",  price: 310, perKgPrice: 62,  img: "/products/steam2kg1.png" },
  { id: "8",  category: "non-basmati", subCategory: "steam-rice", nameKey: "sonaSteam",  weight: "10 kg", price: 580, perKgPrice: 58,  img: "/products/steam2kg2.png" },
  { id: "8b", category: "non-basmati", subCategory: "steam-rice", nameKey: "sonaSteam",  weight: "25 kg", price: 1350, perKgPrice: 54, img: "/products/steam2kg1.png" },

  // ── NON-BASMATI → RAW RICE ───────────────────────────────────────────────
  { id: "r1", category: "non-basmati", subCategory: "raw-rice", nameKey: "rawRiceShort",  weight: "1 kg",  price: 52,  perKgPrice: 52,  img: "/products/raw1kg.png" },
  { id: "r2", category: "non-basmati", subCategory: "raw-rice", nameKey: "rawRiceShort",  weight: "2 kg",  price: 98,  perKgPrice: 49,  img: "/products/raw2kg.png" },
  { id: "r3", category: "non-basmati", subCategory: "raw-rice", nameKey: "rawRiceShort",  weight: "5 kg",  price: 235, perKgPrice: 47,  img: "/products/raw2kg.png" },
  { id: "r4", category: "non-basmati", subCategory: "raw-rice", nameKey: "rawRiceShort",  weight: "10 kg", price: 450, perKgPrice: 45,  img: "/products/raw1kg.png" },
  { id: "r5", category: "non-basmati", subCategory: "raw-rice", nameKey: "rawRiceShort",  weight: "25 kg", price: 1050, perKgPrice: 42, img: "/products/raw1kg.png" },

  // ── NON-BASMATI → HALF BOILED ────────────────────────────────────────────
  { id: "h1", category: "non-basmati", subCategory: "half-boiled", nameKey: "halfBoiledRice", weight: "1 kg",  price: 58,  perKgPrice: 58,  img: "/products/steam2kg2.png" },
  { id: "h2", category: "non-basmati", subCategory: "half-boiled", nameKey: "halfBoiledRice", weight: "2 kg",  price: 110, perKgPrice: 55,  img: "/products/steam2kg2.png" },
  { id: "h3", category: "non-basmati", subCategory: "half-boiled", nameKey: "halfBoiledRice", weight: "5 kg",  price: 265, perKgPrice: 53,  img: "/products/steam2kg1.png" },
  { id: "h4", category: "non-basmati", subCategory: "half-boiled", nameKey: "halfBoiledRice", weight: "10 kg", price: 510, perKgPrice: 51,  img: "/products/steam2kg2.png" },
  { id: "h5", category: "non-basmati", subCategory: "half-boiled", nameKey: "halfBoiledRice", weight: "25 kg", price: 1200, perKgPrice: 48, img: "/products/steam2kg1.png" },

  // ── BASMATI ──────────────────────────────────────────────────────────────
  { id: "9",  category: "basmati", nameKey: "basmatiPremium", weight: "1 kg",  price: 120, perKgPrice: 120, img: "/products/raw1kg.png" },
  { id: "10", category: "basmati", nameKey: "basmatiPremium", weight: "2 kg",  price: 230, perKgPrice: 115, img: "/products/raw2kg.png" },
  { id: "11", category: "basmati", nameKey: "basmatiPremium", weight: "5 kg",  price: 550, perKgPrice: 110, img: "/products/steam2kg1.png" },
  { id: "12", category: "basmati", nameKey: "basmatiAged",    weight: "1 kg",  price: 150, perKgPrice: 150, img: "/products/steam2kg2.png" },
  { id: "13b",category: "basmati", nameKey: "basmatiAged",    weight: "5 kg",  price: 700, perKgPrice: 140, img: "/products/steam2kg2.png" },

  // ── MILLETS ──────────────────────────────────────────────────────────────
  { id: "13", category: "millets", nameKey: "foxtailMillet", weight: "500 g", price: 45,  perKgPrice: 90,  img: "/categories/millets.png" },
  { id: "14", category: "millets", nameKey: "foxtailMillet", weight: "1 kg",  price: 85,  perKgPrice: 85,  img: "/categories/millets.png" },
  { id: "15", category: "millets", nameKey: "pearlMillet",   weight: "500 g", price: 40,  perKgPrice: 80,  img: "/categories/millets.png" },
  { id: "16", category: "millets", nameKey: "pearlMillet",   weight: "1 kg",  price: 75,  perKgPrice: 75,  img: "/categories/millets.png" },
  { id: "17", category: "millets", nameKey: "fingerMillet",  weight: "500 g", price: 50,  perKgPrice: 100, img: "/categories/millets.png" },
  { id: "18", category: "millets", nameKey: "fingerMillet",  weight: "1 kg",  price: 95,  perKgPrice: 95,  img: "/categories/millets.png" },
  { id: "19", category: "millets", nameKey: "littleMillet",  weight: "500 g", price: 55,  perKgPrice: 110, img: "/categories/millets.png" },
  { id: "20", category: "millets", nameKey: "littleMillet",  weight: "1 kg",  price: 105, perKgPrice: 105, img: "/categories/millets.png" },
];

export const productTranslations = {
  EN: {
    // Non-basmati
    sonaRaw: "Sona Masoorie Raw Rice",
    sonaSteam: "Sona Masoorie Steam Rice",
    rawRiceShort: "Raw Rice",
    halfBoiledRice: "Half Boiled Rice",
    rawRice: "Raw Rice",
    steamRice: "Steam Rice",
    sonaVariety: "Sona Masoorie",
    // Sub-category labels
    subCatSonaMasoorie: "Sona Masoorie",
    subCatSteamRice: "Steam Rice",
    subCatRawRice: "Raw Rice",
    subCatHalfBoiled: "Half Boiled",
    // Basmati
    basmatiPremium: "Premium Basmati Rice",
    basmatiAged: "Aged Basmati Rice",
    basmatiRice: "Basmati Rice",
    basmatiVariety: "1121 Basmati",
    basmatiAgedVariety: "Aged 2 Years",
    // Millets
    foxtailMillet: "Foxtail Millet (Korra)",
    pearlMillet: "Pearl Millet (Sajja)",
    fingerMillet: "Finger Millet (Ragi)",
    littleMillet: "Little Millet (Samalu)",
    milletType: "Millet",
    foxtailVariety: "Native Variety",
    pearlVariety: "Native Variety",
    fingerVariety: "Ragi Variety",
    littleVariety: "Native Variety",
  },
  TE: {
    // Non-basmati
    sonaRaw: "సోనా మసూరి రా రైస్",
    sonaSteam: "సోనా మసూరి స్టీమ్ రైస్",
    rawRiceShort: "రా రైస్",
    halfBoiledRice: "హాఫ్ బాయిల్డ్ రైస్",
    rawRice: "రా రైస్",
    steamRice: "స్టీమ్ రైస్",
    sonaVariety: "సోనా మసూరి",
    subCatSonaMasoorie: "సోనా మసూరి",
    subCatSteamRice: "స్టీమ్ రైస్",
    subCatRawRice: "రా రైస్",
    subCatHalfBoiled: "హాఫ్ బాయిల్డ్",
    // Basmati
    basmatiPremium: "ప్రీమియం బాస్మతి బియ్యం",
    basmatiAged: "పాత బాస్మతి బియ్యం",
    basmatiRice: "బాస్మతి బియ్యం",
    basmatiVariety: "1121 బాస్మతి",
    basmatiAgedVariety: "2 సంవత్సరాల పాత",
    // Millets
    foxtailMillet: "కొర్రలు",
    pearlMillet: "సజ్జలు",
    fingerMillet: "రాగులు",
    littleMillet: "సామలు",
    milletType: "చిరుధాన్యం",
    foxtailVariety: "స్థానిక రకం",
    pearlVariety: "స్థానిక రకం",
    fingerVariety: "రాగి రకం",
    littleVariety: "స్థానిక రకం",
  },
};
