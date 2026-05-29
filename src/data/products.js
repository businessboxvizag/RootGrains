export const allProducts = [
  // NON-BASMATI
  { id: "1", category: "non-basmati", nameKey: "sonaRaw", typeKey: "rawRice", varietyKey: "sonaVariety", weight: "1 kg", price: 60, perKgPrice: 60, img: "/products/raw1kg.png" },
  { id: "2", category: "non-basmati", nameKey: "sonaRaw", typeKey: "rawRice", varietyKey: "sonaVariety", weight: "2 kg", price: 110, perKgPrice: 55, img: "/products/raw2kg.png" },
  { id: "3", category: "non-basmati", nameKey: "sonaSteam", typeKey: "steamRice", varietyKey: "sonaVariety", weight: "2 kg", price: 130, perKgPrice: 65, img: "/products/steam2kg1.png" },
  { id: "4", category: "non-basmati", nameKey: "sonaSteam", typeKey: "steamRice", varietyKey: "sonaVariety", weight: "2 kg", price: 140, perKgPrice: 70, img: "/products/steam2kg2.png" },
  { id: "5", category: "non-basmati", nameKey: "sonaRaw", typeKey: "rawRice", varietyKey: "sonaVariety", weight: "5 kg", price: 260, perKgPrice: 52, img: "/products/raw2kg.png" },
  { id: "6", category: "non-basmati", nameKey: "sonaSteam", typeKey: "steamRice", varietyKey: "sonaVariety", weight: "5 kg", price: 310, perKgPrice: 62, img: "/products/steam2kg1.png" },
  { id: "7", category: "non-basmati", nameKey: "sonaRaw", typeKey: "rawRice", varietyKey: "sonaVariety", weight: "10 kg", price: 490, perKgPrice: 49, img: "/products/raw1kg.png" },
  { id: "8", category: "non-basmati", nameKey: "sonaSteam", typeKey: "steamRice", varietyKey: "sonaVariety", weight: "10 kg", price: 580, perKgPrice: 58, img: "/products/steam2kg2.png" },

  // BASMATI
  { id: "9", category: "basmati", nameKey: "basmatiPremium", typeKey: "basmatiRice", varietyKey: "basmatiVariety", weight: "1 kg", price: 120, perKgPrice: 120, img: "/products/raw1kg.png" },
  { id: "10", category: "basmati", nameKey: "basmatiPremium", typeKey: "basmatiRice", varietyKey: "basmatiVariety", weight: "2 kg", price: 230, perKgPrice: 115, img: "/products/raw2kg.png" },
  { id: "11", category: "basmati", nameKey: "basmatiPremium", typeKey: "basmatiRice", varietyKey: "basmatiVariety", weight: "5 kg", price: 550, perKgPrice: 110, img: "/products/steam2kg1.png" },
  { id: "12", category: "basmati", nameKey: "basmatiAged", typeKey: "basmatiRice", varietyKey: "basmatiAgedVariety", weight: "1 kg", price: 150, perKgPrice: 150, img: "/products/steam2kg2.png" },

  // MILLETS
  { id: "13", category: "millets", nameKey: "foxtailMillet", typeKey: "milletType", varietyKey: "foxtailVariety", weight: "500 g", price: 45, perKgPrice: 90, img: "/categories/millets.png" },
  { id: "14", category: "millets", nameKey: "foxtailMillet", typeKey: "milletType", varietyKey: "foxtailVariety", weight: "1 kg", price: 85, perKgPrice: 85, img: "/categories/millets.png" },
  { id: "15", category: "millets", nameKey: "pearlMillet", typeKey: "milletType", varietyKey: "pearlVariety", weight: "500 g", price: 40, perKgPrice: 80, img: "/categories/millets.png" },
  { id: "16", category: "millets", nameKey: "pearlMillet", typeKey: "milletType", varietyKey: "pearlVariety", weight: "1 kg", price: 75, perKgPrice: 75, img: "/categories/millets.png" },
  { id: "17", category: "millets", nameKey: "fingerMillet", typeKey: "milletType", varietyKey: "fingerVariety", weight: "500 g", price: 50, perKgPrice: 100, img: "/categories/millets.png" },
  { id: "18", category: "millets", nameKey: "fingerMillet", typeKey: "milletType", varietyKey: "fingerVariety", weight: "1 kg", price: 95, perKgPrice: 95, img: "/categories/millets.png" },
  { id: "19", category: "millets", nameKey: "littleMillet", typeKey: "milletType", varietyKey: "littleVariety", weight: "500 g", price: 55, perKgPrice: 110, img: "/categories/millets.png" },
  { id: "20", category: "millets", nameKey: "littleMillet", typeKey: "milletType", varietyKey: "littleVariety", weight: "1 kg", price: 105, perKgPrice: 105, img: "/categories/millets.png" },
];

export const productTranslations = {
  EN: {
    basmatiPremium: "Premium Basmati Rice",
    basmatiAged: "Aged Basmati Rice",
    basmatiRice: "Basmati Rice",
    basmatiVariety: "1121 Basmati",
    basmatiAgedVariety: "Aged 2 Years",
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
    basmatiPremium: "ప్రీమియం బాస్మతి బియ్యం",
    basmatiAged: "పాత బాస్మతి బియ్యం",
    basmatiRice: "బాస్మతి బియ్యం",
    basmatiVariety: "1121 బాస్మతి",
    basmatiAgedVariety: "2 సంవత్సరాల పాత",
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
