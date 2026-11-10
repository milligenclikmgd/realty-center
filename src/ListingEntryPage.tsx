import { useEffect, useRef, useState } from "react";
import { Building2, Home, LandPlot, Search, Store, UserRound, X } from "lucide-react";
import { supabase } from "./lib/supabase";
import { TURKEY_PROVINCES, getTurkeyDistricts } from "./turkeyLocations";

type ProfileLike = {
  id: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
};
type NeighborhoodRow = {
  city: string;
  district: string;
  neighborhoods: string[];
};
type DetailField = {
  key: string;
  label: string;
  type?: "text" | "number";
  options?: string[];
  placeholder?: string;
};

const PROPERTY_TYPES: Record<string, string[]> = {
  Konut: [
    "Daire",
    "Rezidans",
    "Residence",
    "Villa",
    "Müstakil Ev",
    "Ev",
    "Yazlık",
    "Dubleks",
    "Tripleks",
    "Çiftlik Evi",
    "Prefabrik Ev",
    "Diğer",
  ],
  Arsa: ["Arsa", "Tarla", "Bağ", "Bahçe", "Zeytinlik", "Çiftlik", "Arazi"],
  İşyeri: [
    "Ofis",
    "Dükkan",
    "Mağaza",
    "Market",
    "AVM",
    "Plaza",
    "Depo",
    "Antrepo",
    "Fabrika",
    "Atölye",
    "İmalathane",
    "Akaryakıt İstasyonu",
    "Restoran",
    "Kafe",
    "Pastane",
    "Eğlence Merkezi",
    "Sağlık Tesisi",
    "Okul",
    "Kreş",
    "Dershane",
    "Otopark",
  ],
  "Turistik Tesis": [
    "Otel",
    "Motel",
    "Pansiyon",
    "Apart Otel",
    "Butik Otel",
    "Tatil Köyü",
  ],
};

const DETAIL_FIELDS: Record<string, DetailField[]> = {
  Daire: [
    {
      key: "roomCount",
      label: "Oda sayısı",
      options: [
        "1+0",
        "1+1",
        "2+1",
        "3+1",
        "4+1",
        "5+1",
        "5+2",
        "6+1 ve üzeri",
      ],
    },
    {
      key: "bathroomCount",
      label: "Banyo sayısı",
      options: ["1", "2", "3", "4 ve üzeri"],
    },
    {
      key: "floor",
      label: "Bulunduğu kat",
      options: [
        "Bodrum",
        "Zemin",
        "Yüksek giriş",
        ...Array.from({ length: 30 }, (_, i) => String(i + 1)),
      ],
    },
    {
      key: "buildingAge",
      label: "Bina yaşı",
      options: [
        "0",
        "1-5",
        "6-10",
        "11-15",
        "16-20",
        "21-25",
        "26-30",
        "31 ve üzeri",
      ],
    },
    {
      key: "heating",
      label: "Isıtma",
      options: [
        "Kombi (Doğalgaz)",
        "Merkezi",
        "Yerden Isıtma",
        "Klima",
        "Soba",
        "Elektrikli",
        "Yok",
      ],
    },
    {
      key: "parking",
      label: "Otopark",
      options: ["Açık", "Kapalı", "Açık ve kapalı", "Yok"],
    },
    {
      key: "credit",
      label: "Kredi durumu",
      options: ["Krediye Uygun", "Krediye Uygun Değil"],
    },
  ],
  Villa: [
    {
      key: "roomCount",
      label: "Oda sayısı",
      options: ["2+1", "3+1", "4+1", "5+1", "5+2", "6+1 ve üzeri"],
    },
    {
      key: "bathroomCount",
      label: "Banyo sayısı",
      options: ["1", "2", "3", "4 ve üzeri"],
    },
    { key: "floorCount", label: "Kat sayısı", type: "number" },
    { key: "gardenArea", label: "Bahçe alanı (m²)", type: "number" },
    {
      key: "heating",
      label: "Isıtma",
      options: ["Kombi (Doğalgaz)", "Yerden Isıtma", "Klima", "Yok"],
    },
    {
      key: "parking",
      label: "Otopark",
      options: ["Açık", "Kapalı", "Açık ve kapalı", "Yok"],
    },
  ],
  "Müstakil Ev": [
    {
      key: "roomCount",
      label: "Oda sayısı",
      options: ["2+1", "3+1", "4+1", "5+1", "5+2", "6+1 ve üzeri"],
    },
    {
      key: "bathroomCount",
      label: "Banyo sayısı",
      options: ["1", "2", "3", "4 ve üzeri"],
    },
    { key: "floorCount", label: "Kat sayısı", type: "number" },
    { key: "gardenArea", label: "Bahçe alanı (m²)", type: "number" },
  ],
  Residence: [
    {
      key: "roomCount",
      label: "Oda sayısı",
      options: ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"],
    },
    { key: "floor", label: "Bulunduğu kat", type: "number" },
    {
      key: "siteFeatures",
      label: "Site özellikleri",
      placeholder: "Güvenlik, havuz, otopark",
    },
    { key: "parking", label: "Otopark", options: ["Açık", "Kapalı", "Yok"] },
  ],
  Ev: [
    {
      key: "roomCount",
      label: "Oda sayısı",
      options: ["1+0", "1+1", "2+1", "3+1", "4+1", "5+1"],
    },
    { key: "bathroomCount", label: "Banyo sayısı", type: "number" },
    { key: "floor", label: "Bulunduğu kat", type: "number" },
  ],
  Yazlık: [
    {
      key: "roomCount",
      label: "Oda sayısı",
      options: ["1+1", "2+1", "3+1", "4+1", "5+1"],
    },
    { key: "gardenArea", label: "Bahçe alanı (m²)", type: "number" },
    { key: "seaDistance", label: "Denize mesafe", placeholder: "Örn. 300 m" },
  ],
  Arsa: [
    {
      key: "zoningStatus",
      label: "İmar durumu",
      options: ["Konut", "Ticari", "Sanayi", "Turizm", "İmarsız"],
    },
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    { key: "frontage", label: "Cephe (m)", type: "number" },
    {
      key: "titleDeed",
      label: "Tapu durumu",
      options: ["Müstakil Tapu", "Hisseli Tapu", "Kat İrtifakı"],
    },
    {
      key: "roadAccess",
      label: "Yol durumu",
      options: ["Kadastro yolu", "Asfalt", "Stabilize", "Yok"],
    },
    {
      key: "infrastructure",
      label: "Altyapı",
      options: ["Elektrik", "Su", "Doğalgaz", "Kanalizasyon", "Yok"],
    },
  ],
  Tarla: [
    {
      key: "zoningStatus",
      label: "İmar durumu",
      options: ["Tarla", "İmarsız", "Konut", "Ticari"],
    },
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    {
      key: "waterSource",
      label: "Su kaynağı",
      options: ["Kuyu", "Sulama kanalı", "Dere", "Yok"],
    },
    {
      key: "roadAccess",
      label: "Yol durumu",
      options: ["Kadastro yolu", "Asfalt", "Stabilize", "Yok"],
    },
    {
      key: "titleDeed",
      label: "Tapu durumu",
      options: ["Müstakil Tapu", "Hisseli Tapu"],
    },
  ],
  Bağ: [
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    {
      key: "vineCount",
      label: "Bağ / kök bilgisi",
      placeholder: "Örn. 500 kök",
    },
    {
      key: "waterSource",
      label: "Su kaynağı",
      options: ["Kuyu", "Sulama kanalı", "Yok"],
    },
    {
      key: "roadAccess",
      label: "Yol durumu",
      options: ["Kadastro yolu", "Asfalt", "Stabilize", "Yok"],
    },
  ],
  Bahçe: [
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    {
      key: "treeCount",
      label: "Ağaç sayısı / türü",
      placeholder: "Örn. 40 meyve ağacı",
    },
    {
      key: "waterSource",
      label: "Su kaynağı",
      options: ["Kuyu", "Sulama kanalı", "Yok"],
    },
    {
      key: "roadAccess",
      label: "Yol durumu",
      options: ["Kadastro yolu", "Asfalt", "Stabilize", "Yok"],
    },
  ],
  Zeytinlik: [
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    { key: "treeCount", label: "Zeytin ağacı sayısı", type: "number" },
    {
      key: "waterSource",
      label: "Su kaynağı",
      options: ["Kuyu", "Sulama kanalı", "Yok"],
    },
  ],
  Çiftlik: [
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    { key: "closedArea", label: "Kapalı alan (m²)", type: "number" },
    { key: "animalCapacity", label: "Hayvan kapasitesi", type: "number" },
    {
      key: "waterSource",
      label: "Su kaynağı",
      options: ["Kuyu", "Şebeke", "Yok"],
    },
  ],
  Arazi: [
    {
      key: "zoningStatus",
      label: "İmar durumu",
      options: ["Konut", "Ticari", "Sanayi", "Tarım", "İmarsız"],
    },
    { key: "parcelNo", label: "Ada / parsel no", placeholder: "123 / 45" },
    { key: "frontage", label: "Cephe (m)", type: "number" },
    {
      key: "roadAccess",
      label: "Yol durumu",
      options: ["Kadastro yolu", "Asfalt", "Stabilize", "Yok"],
    },
  ],
  Ofis: [
    { key: "sectionCount", label: "Bölüm / oda sayısı", type: "number" },
    { key: "floor", label: "Bulunduğu kat", type: "number" },
    { key: "meetingRooms", label: "Toplantı odası sayısı", type: "number" },
    { key: "parking", label: "Otopark", options: ["Açık", "Kapalı", "Yok"] },
  ],
  Dükkan: [
    { key: "frontage", label: "Cephe (m)", type: "number" },
    { key: "floor", label: "Kat", type: "number" },
    { key: "warehouseArea", label: "Depo alanı (m²)", type: "number" },
    {
      key: "usageStatus",
      label: "Kullanım durumu",
      options: ["Boş", "Kiracılı", "Devren"],
    },
  ],
  Mağaza: [
    { key: "frontage", label: "Cephe (m)", type: "number" },
    { key: "floor", label: "Kat", type: "number" },
    {
      key: "usageStatus",
      label: "Kullanım durumu",
      options: ["Boş", "Kiracılı", "Devren"],
    },
  ],
  Depo: [
    { key: "closedArea", label: "Kapalı alan (m²)", type: "number" },
    { key: "ceilingHeight", label: "Tavan yüksekliği (m)", type: "number" },
    { key: "loadingDocks", label: "Yükleme rampası", options: ["Var", "Yok"] },
    { key: "security", label: "Güvenlik", options: ["7/24", "Var", "Yok"] },
  ],
  Antrepo: [
    { key: "closedArea", label: "Kapalı alan (m²)", type: "number" },
    { key: "ceilingHeight", label: "Tavan yüksekliği (m)", type: "number" },
    { key: "loadingDocks", label: "Yükleme rampası", options: ["Var", "Yok"] },
  ],
  Fabrika: [
    { key: "closedArea", label: "Kapalı alan (m²)", type: "number" },
    { key: "ceilingHeight", label: "Tavan yüksekliği (m)", type: "number" },
    { key: "powerCapacity", label: "Elektrik gücü (kVA)", type: "number" },
    { key: "loadingDocks", label: "Yükleme rampası", options: ["Var", "Yok"] },
  ],
  Atölye: [
    { key: "closedArea", label: "Kapalı alan (m²)", type: "number" },
    { key: "powerCapacity", label: "Elektrik gücü (kVA)", type: "number" },
    {
      key: "usageStatus",
      label: "Kullanım durumu",
      options: ["Boş", "Kiracılı", "Devren"],
    },
  ],
  İmalathane: [
    { key: "closedArea", label: "Kapalı alan (m²)", type: "number" },
    { key: "powerCapacity", label: "Elektrik gücü (kVA)", type: "number" },
    { key: "loadingDocks", label: "Yükleme rampası", options: ["Var", "Yok"] },
  ],
  Plaza: [
    { key: "floor", label: "Bulunduğu kat", type: "number" },
    { key: "floorCount", label: "Toplam kat sayısı", type: "number" },
    { key: "elevatorCount", label: "Asansör sayısı", type: "number" },
    { key: "parking", label: "Otopark", options: ["Açık", "Kapalı", "Yok"] },
  ],
  Otel: [
    { key: "hotelRoomCount", label: "Otel oda sayısı", type: "number" },
    { key: "bedCapacity", label: "Yatak kapasitesi", type: "number" },
    {
      key: "starRating",
      label: "Yıldız sayısı",
      options: ["Butik", "2", "3", "4", "5"],
    },
    { key: "restaurantCount", label: "Restoran sayısı", type: "number" },
    { key: "pool", label: "Havuz", options: ["Var", "Yok"] },
  ],
};

const genericFields: DetailField[] = [
  { key: "gross_sqm", label: "Brüt m²", type: "number" },
  { key: "net_sqm", label: "Net m²", type: "number" },
  {
    key: "credit",
    label: "Kredi durumu",
    options: ["Krediye Uygun", "Krediye Uygun Değil", "Bilinmiyor"],
  },
];
const inputClass =
  "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-900 outline-none transition focus:border-[#cd011e] focus:ring-2 focus:ring-[#cd011e]/10";

export default function ListingEntryPage({
  profiles,
  alert,
  close,
}: {
  profiles: ProfileLike[];
  alert: (text: string) => void;
  close: () => void;
}) {
  const advisors = profiles.filter(
    (profile) => profile.role === "advisor" || profile.role === "manager",
  );
  const [viewerRole, setViewerRole] = useState("admin");
  const [viewerId, setViewerId] = useState("");
  const [viewerName, setViewerName] = useState("");
  const [locationRows, setLocationRows] = useState<NeighborhoodRow[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<{ url: string; type: string }[]>([]);
  const [coverUrl, setCoverUrl] = useState("");
  const [listingNumber] = useState(() => {
    const stamp = Date.now().toString(36).toUpperCase().slice(-6);
    const entropy = typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().replaceAll("-", "").slice(0, 4).toUpperCase()
      : Math.floor(1000 + Math.random() * 9000).toString();
    return `RC-${new Date().getFullYear()}-${stamp}${entropy}`;
  });
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [saving, setSaving] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [ownerPickerOpen, setOwnerPickerOpen] = useState(false);
  const [ownerSearch, setOwnerSearch] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [preview, setPreview] = useState(false);
  const [publishMode, setPublishMode] = useState("publish");
  const [featured, setFeatured] = useState(false);
  const [newLabel, setNewLabel] = useState(false);
  const [dealLabel, setDealLabel] = useState(false);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [form, setForm] = useState({
    title: "",
    advisor: "",
    transaction_type: "Satılık",
    category: "Konut",
    property_type: "Daire",
    price: "",
    currency: "₺",
    city: "",
    district: "",
    neighborhood: "",
    dues: "",
    description: "",
    advisorNotes: "",
    address: "",
    postalCode: "",
    latitude: "",
    longitude: "",
    officeId: "",
    secondAdvisor: "",
    whatsapp: "",
    details: {} as Record<string, string>,
  });
  const propertyTypes = PROPERTY_TYPES[form.category] || [];
  const detailFields = [
    ...genericFields,
    ...(DETAIL_FIELDS[form.property_type] || []),
  ];
  const neighborhoods =
    locationRows.find(
      (row) => row.city === form.city && row.district === form.district,
    )?.neighborhoods || [];
  const directPublish = viewerRole === "admin" || viewerRole === "manager";
  const selectedOwner = advisors.find((advisor) => advisor.id === form.advisor);
  const ownerResults = advisors.filter((advisor) => `${advisor.first_name} ${advisor.last_name}`.toLocaleLowerCase("tr-TR").includes(ownerSearch.toLocaleLowerCase("tr-TR")));

  useEffect(() => {
    void supabase.auth.getUser().then(async ({ data: auth }) => {
      if (!auth.user) return;
      setViewerId(auth.user.id);
      const { data } = await supabase
        .from("profiles")
        .select("role,first_name,last_name")
        .eq("id", auth.user.id)
        .maybeSingle();
      if (data?.role) {
        setViewerRole(data.role);
        setViewerName(
          `${data.first_name || ""} ${data.last_name || ""}`.trim() ||
            auth.user.email ||
            "Oturum sahibi",
        );
        if (data.role === "advisor" || data.role === "manager")
          setForm((current) => ({ ...current, advisor: auth.user.id }));
      }
    });
  }, []);
  useEffect(() => {
    if ((viewerRole === "advisor" || viewerRole === "manager") && viewerId)
      setForm((current) =>
        current.advisor === viewerId
          ? current
          : { ...current, advisor: viewerId },
      );
  }, [viewerRole, viewerId]);
  useEffect(() => {
    const saved = localStorage.getItem("rc-listing-draft");
    if (saved)
      try {
        const d = JSON.parse(saved);
        setForm((x) => ({ ...x, ...d.form }));
        setFeatured(!!d.featured);
        setNewLabel(!!d.newLabel);
        setDealLabel(!!d.dealLabel);
      } catch {
        /* ignore invalid draft */
      }
  }, []);
  useEffect(() => {
    const timer = window.setTimeout(
      () =>
        localStorage.setItem(
          "rc-listing-draft",
          JSON.stringify({ form, featured, newLabel, dealLabel }),
        ),
      700,
    );
    return () => window.clearTimeout(timer);
  }, [form, featured, newLabel, dealLabel]);
  const saveDraft = () => {
    localStorage.setItem(
      "rc-listing-draft",
      JSON.stringify({ form, featured, newLabel, dealLabel }),
    );
    alert("Taslak kaydedildi.");
  };
  useEffect(() => {
    void fetch("/data/turkey-neighborhoods.json")
      .then((response) => (response.ok ? response.json() : []))
      .then((rows) => setLocationRows(Array.isArray(rows) ? rows : []))
      .catch(() => setLocationRows([]));
  }, []);

  const updateDetail = (key: string, value: string) =>
    setForm((current) => ({
      ...current,
      details: { ...current.details, [key]: value },
    }));
  const uploadFiles = async (fileList: FileList | null) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    if (uploading) return;
    if (files.length > 16) {
      alert("Bir seferde en fazla 16 fotoğraf veya video seçebilirsiniz.");
      return;
    }
    const allowedTypes = new Set([
      "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
      "video/mp4", "video/webm", "video/quicktime",
    ]);
    const invalid = files.find((file) => !allowedTypes.has(file.type));
    if (invalid) {
      alert("${invalid.name}: JPG, PNG, WEBP, GIF, AVIF, MP4, WEBM veya MOV dosyası seçin.");
      return;
    }
    const oversized = files.find((file) => file.size > (file.type.startsWith("video/") ? 50 : 15) * 1024 * 1024);
    if (oversized) {
      alert("${oversized.name}: Fotoğraflar en fazla 15 MB, videolar en fazla 50 MB olabilir.");
      return;
    }
    setUploading(true);
    try {
      const additions: { url: string; type: string }[] = [];
      for (const file of files) {
        setUploadProgress((current) => ({ ...current, [file.name]: 0 }));
        const uploadedMedia = await new Promise<{ url: string; type: string }>((resolve, reject) => {
          const request = new XMLHttpRequest();
          const body = new FormData();
          body.append("file", file);
          request.open("POST", "/api/media.php");
          request.withCredentials = true;
          request.timeout = 300000;
          request.upload.onprogress = (event) => {
            if (!event.lengthComputable) return;
            const progress = Math.min(99, Math.round((event.loaded / event.total) * 100));
            setUploadProgress((current) => ({ ...current, [file.name]: progress }));
          };
          request.onload = () => {
            let payload: any = {};
            try { payload = JSON.parse(request.responseText || "{}"); } catch { /* server may return an HTML/PHP error */ }
            if (request.status < 200 || request.status >= 300 || !payload.url) {
              const message = payload.error || (request.status === 413
                ? "Dosya cPanel yükleme sınırını aşıyor. MultiPHP INI Editor değerlerini kontrol edin."
                : `Sunucu yanıtı alınamadı (HTTP ${request.status || 0}). cPanel PHP API ve oturum bağlantısını kontrol edin.`);
              reject(new Error(message));
              return;
            }
            resolve({ url: payload.url, type: payload.type || file.type });
          };
          request.onerror = () => reject(new Error("cPanel medya servisine bağlanılamadı. İnternet ve /api/media.php adresini kontrol edin."));
          request.ontimeout = () => reject(new Error("Yükleme zaman aşımına uğradı. Dosya boyutunu ve cPanel bağlantısını kontrol edin."));
          request.send(body);
        });
        setUploadProgress((current) => ({ ...current, [file.name]: 100 }));
        additions.push(uploadedMedia);
      }
      setUploaded((current) => [...current, ...additions]);
      setSelectedFiles([]);
    } catch (error: any) {
      setUploadProgress({});
      alert(`Dosyalar eklenemedi: ${error.message || "Tekrar deneyin."}`);
    } finally {
      setUploading(false);
    }
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setValidationMessage("");
    const missing = [
      [form.title.trim(), "İlan başlığı"],
      [form.advisor, "İlan sahibi"],
      [form.price, "Fiyat"],
      [form.city, "İl"],
      [form.district, "İlçe"],
      [form.neighborhood, "Mahalle"],
    ]
      .filter(([value]) => !value)
      .map(([, label]) => label);
    if (missing.length) {
      const message = `Eksik zorunlu alanlar: ${missing.join(", ")}.`;
      setValidationMessage(message);
      return alert(message);
    }
    setSaving(true);
    try {
      const { error } = await supabase.from("listings").insert({
        owner_id: form.advisor,
        title: form.title.trim(),
        category: form.category,
        property_type: form.property_type,
        transaction_type: form.transaction_type,
        price: Number(form.price.replaceAll(".", "")),
        currency: form.currency,
        city: form.city,
        district: form.district,
        neighborhood: form.neighborhood,
        rooms: form.details.roomCount || null,
        area: Number(form.details.gross_sqm || form.details.net_sqm || 0),
        description: form.description || null,
        images: uploaded
          .filter((item) => item.type.startsWith("image/"))
          .map((item) => item.url),
        video_url:
          uploaded.find((item) => item.type.startsWith("video/"))?.url || null,
        details: {
          ...form.details,
          listing_number: listingNumber,
          second_advisor: form.secondAdvisor || null,
          office_id: form.officeId || null,
          dues: form.dues,
          cover_url: coverUrl || null,
          whatsapp: form.whatsapp || null,
          advisor_notes: form.advisorNotes,
          address: form.address,
          postal_code: form.postalCode,
          latitude: form.latitude,
          longitude: form.longitude,
          new_label: newLabel,
          deal_label: dealLabel,
        },
        // "İlanı Yayınla" submits the listing directly to the public feed for
        // every authenticated listing role. Drafts can still be saved with
        // the separate Taslak Kaydet action above.
        approval_status: "Yayında",
        is_featured: featured,
      });
      if (error) throw error;
      window.dispatchEvent(new Event("realty-center-listings-updated"));
      alert(
        directPublish
          ? "İlan doğrudan yayına alındı."
          : "İlan onay merkezine gönderildi.",
      );
      close();
    } catch (error: any) {
      alert(`İlan kaydedilemedi: ${error.message || "Tekrar deneyin."}`);
    } finally {
      setSaving(false);
    }
  };
  const renderField = (field: DetailField) => (
    <label key={field.key} className="text-xs">
      <span>{field.label}</span>
      {field.options ? (
        <select
          className={inputClass}
          value={form.details[field.key] || ""}
          onChange={(e) => updateDetail(field.key, e.target.value)}
        >
          <option value="">Seçiniz</option>
          {field.options.map((option) => (
            <option key={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          className={inputClass}
          type={field.type || "text"}
          inputMode={field.type === "number" ? "numeric" : undefined}
          value={form.details[field.key] || ""}
          onChange={(e) => updateDetail(field.key, e.target.value)}
          placeholder={field.placeholder}
        />
      )}
    </label>
  );

  return (
    <form
      onSubmit={submit}
      data-step={activeStep}
      className="listing-entry-form mx-auto max-w-6xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <style>{`.listing-entry-form label{font-weight:600}.listing-entry-form label>span{color:#cd011e}.listing-entry-form h2,.listing-entry-form h3{color:#101828;font-weight:600}.listing-entry-form input,.listing-entry-form select,.listing-entry-form textarea,.listing-entry-form [contenteditable="true"]{font-weight:400;color:#101828}.listing-entry-form button{font-weight:600}.wizard-content>section{display:none}.listing-entry-form[data-step="1"] .wizard-content>section:nth-of-type(1),.listing-entry-form[data-step="2"] .wizard-content>section:nth-of-type(2),.listing-entry-form[data-step="3"] .wizard-content>section:nth-of-type(3),.listing-entry-form[data-step="3"] .wizard-content>section:nth-of-type(4),.listing-entry-form[data-step="4"] .wizard-content>section:nth-of-type(5),.listing-entry-form[data-step="5"] .wizard-content>section:nth-of-type(6){display:block}`}</style>
      <header className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
            İLAN YÖNETİMİ / YENİ İLAN
          </p>
          <h2 className="mt-1 text-2xl">Yeni İlan Ekle</h2>
          <p className="mt-1 text-sm text-slate-500">
            "Bu form ile eklenen ilanlar doğrudan yayınlanır."
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={saveDraft} className="rc-secondary">
            Taslak Kaydet
          </button>
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="rc-secondary"
          >
            Önizleme
          </button>
          <button type="button" onClick={close} className="rc-secondary">
            Listeye dön
          </button>
        </div>
      </header>
      <div className="grid grid-cols-5 border-b border-slate-100 bg-white px-6 py-5 text-center text-[11px] text-slate-500">
        {["Temel Bilgiler", "Konum", "Özellikler", "Medya", "Önizleme"].map((label, index) => { const step = index + 1; return <button key={label} type="button" onClick={() => setActiveStep(step)} className={`relative flex flex-col items-center gap-2 ${activeStep === step ? "text-[#cd011e]" : step < activeStep ? "text-slate-700" : "text-slate-400"}`}><span className={`grid h-9 w-9 place-items-center rounded-full border text-sm font-semibold ${activeStep === step ? "border-[#cd011e] bg-[#cd011e] text-white" : step < activeStep ? "border-[#cd011e] text-[#cd011e]" : "border-slate-300 bg-white"}`}>{step}</span><span>{label}</span>{step < 5 && <i className={`absolute left-[62%] top-[18px] h-px w-[76%] ${step < activeStep ? "bg-[#cd011e]" : "bg-slate-200"}`} />}</button>; })}
      </div>
      {validationMessage && (
        <div className="mx-6 mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {validationMessage}
        </div>
      )}
      <div className="wizard-content space-y-8 p-6">
        <section>
          <h3>Temel bilgiler</h3>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs">
              <span>İlan başlığı *</span>
              <input
                required
                className={inputClass}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
              />
            </label>
            <label className="text-xs">
              <span>İlan numarası</span>
              <input
                readOnly
                disabled
                className={inputClass + " bg-slate-50"}
                value={listingNumber}
              />
            </label>
            {viewerRole === "advisor" || viewerRole === "manager" ? (
              <label className="text-xs">
                <span>İlan sahibi</span>
                <input
                  readOnly
                  className={inputClass + " bg-slate-50"}
                  value={viewerName || "Oturum sahibi yükleniyor…"}
                />
              </label>
            ) : (
              <label className="text-xs">
                <span>İlan sahibi *</span>
                <button type="button" onClick={() => setOwnerPickerOpen(true)} className={`${inputClass} flex items-center justify-between text-left`}><span className="flex items-center gap-2 text-slate-700">{selectedOwner?.avatar_url ? <img src={selectedOwner.avatar_url} className="h-7 w-7 rounded-full object-cover" /> : <UserRound size={18} className="text-slate-400" />}{selectedOwner ? `${selectedOwner.first_name} ${selectedOwner.last_name}` : "İlan sahibi seçiniz"}</span><Search size={16} className="text-slate-400" /></button>
              </label>
            )}
            <label className="text-xs">
              <span>WhatsApp numarası</span>
              <input
                className={inputClass}
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              />
            </label>
            <label className="text-xs">
              <span>İşlem tipi *</span>
              <select
                className={inputClass}
                value={form.transaction_type}
                onChange={(e) =>
                  setForm({ ...form, transaction_type: e.target.value })
                }
              >
                {[
                  "Satılık",
                  "Kiralık",
                  "Günlük Kiralık",
                  "Devren Satılık",
                  "Devren Kiralık",
                ].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span>Ana kategori *</span>
              <div className="mt-1.5 grid grid-cols-4 gap-2">{([["Konut", Home], ["Arsa", LandPlot], ["İşyeri", Store], ["Turistik Tesis", Building2]] as const).map(([category, Icon]) => <button key={category} type="button" onClick={() => setForm({ ...form, category, property_type: PROPERTY_TYPES[category][0], details: {} })} className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2 text-[10px] ${form.category === category ? "border-[#cd011e] bg-[#cd011e] text-white" : "border-slate-200 bg-white text-slate-600"}`}><Icon size={17} />{category}</button>)}</div>
            </label>
            <label className="text-xs">
              <span>İlan türü *</span>
              <select
                className={inputClass}
                value={form.property_type}
                onChange={(e) =>
                  setForm({
                    ...form,
                    property_type: e.target.value,
                    details: {},
                  })
                }
              >
                {propertyTypes.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-xs"><span>{form.transaction_type.includes("Kiral") ? "Kira fiyatı *" : "Satış fiyatı *"}</span><div className="flex"><select className="mt-1.5 w-20 rounded-l-xl border-0 bg-[#cd011e] px-2 text-center text-sm font-semibold text-white outline-none" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{["₺", "USD", "EUR"].map((option) => <option key={option}>{option}</option>)}</select><input required inputMode="numeric" className={`${inputClass} mt-1.5 rounded-l-none`} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") })} placeholder={form.transaction_type.includes("Kiral") ? "Örn. 35.000" : "Örn. 5.750.000"} /></div></label>
          </div>
        </section>
        <section className="border-t border-slate-100 pt-7">
          <h3>Konum Bilgileri</h3>
          <p className="mt-1 text-xs font-normal text-slate-500">
            İlanın adresini ve harita konumunu bu aşamada tanımlayın.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs">
              <span>İl *</span>
              <select
                required
                className={inputClass}
                value={form.city}
                onChange={(e) =>
                  setForm({
                    ...form,
                    city: e.target.value,
                    district: "",
                    neighborhood: "",
                  })
                }
              >
                <option value="">İl seçiniz</option>
                {TURKEY_PROVINCES.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span>İlçe *</span>
              <select
                required
                disabled={!form.city}
                className={inputClass}
                value={form.district}
                onChange={(e) =>
                  setForm({
                    ...form,
                    district: e.target.value,
                    neighborhood: "",
                  })
                }
              >
                <option value="">İlçe seçiniz</option>
                {getTurkeyDistricts(form.city).map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-xs">
              <span>Mahalle *</span>
              <select
                required
                disabled={!form.district || !locationRows.length}
                className={inputClass}
                value={form.neighborhood}
                onChange={(e) =>
                  setForm({ ...form, neighborhood: e.target.value })
                }
              >
                <option value="">
                  {!form.district
                    ? "Önce ilçe seçiniz"
                    : !locationRows.length
                      ? "Mahalleler yükleniyor…"
                      : neighborhoods.length
                        ? "Mahalle seçiniz"
                        : "Bu ilçe için mahalle bulunamadı"}
                </option>
                {neighborhoods.map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
            <label className="text-xs md:col-span-2">
              <span>Açık adres</span>
              <input
                className={inputClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Mahalle, cadde, sokak ve bina bilgisi"
              />
            </label>
            <label className="text-xs">
              <span>Posta kodu</span>
              <input
                className={inputClass}
                value={form.postalCode}
                onChange={(e) =>
                  setForm({ ...form, postalCode: e.target.value })
                }
              />
            </label>
            <label className="text-xs">
              <span>Enlem</span>
              <input
                className={inputClass}
                value={form.latitude}
                onChange={(e) => setForm({ ...form, latitude: e.target.value })}
                placeholder="39.9208"
              />
            </label>
            <label className="text-xs">
              <span>Boylam</span>
              <input
                className={inputClass}
                value={form.longitude}
                onChange={(e) =>
                  setForm({ ...form, longitude: e.target.value })
                }
                placeholder="32.8541"
              />
            </label>
            <div className="md:col-span-2 xl:col-span-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-700">
                  Konum önizlemesi
                </span>
                <span className="text-[10px] text-slate-400">
                  Enlem ve boylam girildiğinde harita güncellenir
                </span>
              </div>
              {form.latitude && form.longitude ? (
                <iframe
                  title="İlan konum haritası"
                  className="h-56 w-full rounded-xl border-0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(form.longitude) - 0.02}%2C${Number(form.latitude) - 0.015}%2C${Number(form.longitude) + 0.02}%2C${Number(form.latitude) + 0.015}&layer=mapnik&marker=${form.latitude}%2C${form.longitude}`}
                />
              ) : (
                <div className="grid h-40 place-items-center rounded-xl bg-white text-sm text-slate-400">
                  Harita için enlem ve boylam girin.
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="border-t border-slate-100 pt-7">
          <h3>{form.property_type} detayları</h3>
          <p className="mt-1 text-xs font-normal text-slate-500">
            Seçtiğiniz ilan türüne ait bilgiler gösterilir.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <label className="text-xs"><span>Aidat</span><input inputMode="numeric" className={inputClass} value={form.dues} onChange={(e) => setForm({ ...form, dues: e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") })} placeholder="Aylık aidat" /></label>
            {detailFields.map(renderField)}
          </div>
        </section>
        <section className="border-t border-slate-100 pt-7">
          <h3>İlan açıklaması</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => document.execCommand("bold")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              <b>B</b>
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("italic")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              <i>I</i>
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("insertUnorderedList")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              • Liste
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("insertOrderedList")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              1. Liste
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("formatBlock", false, "h3")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Başlık
            </button>
            <button
              type="button"
              onClick={() =>
                document.execCommand(
                  "createLink",
                  false,
                  prompt("Bağlantı adresi") || "",
                )
              }
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Bağlantı
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("justifyLeft")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Sola hizala
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("undo")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              Geri al
            </button>
            <button
              type="button"
              onClick={() => document.execCommand("redo")}
              className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-semibold text-white hover:bg-red-800"
            >
              İleri al
            </button>
          </div>
          <div ref={editorRef} contentEditable suppressContentEditableWarning onInput={(e) => setForm({ ...form, description: e.currentTarget.innerHTML })} className={inputClass + " min-h-48 resize-y leading-7"} data-placeholder="İlanın öne çıkan yönlerini, ulaşımını ve detaylarını yazın." />
          <label className="mt-4 block text-xs">
            <span>Danışman notları (sadece panel kullanıcıları görür)</span>
            <textarea
              className={inputClass + " min-h-28"}
              value={form.advisorNotes}
              onChange={(e) =>
                setForm({ ...form, advisorNotes: e.target.value })
              }
              placeholder="Müşteri görüşmeleri, özel takip notları…"
            />
          </label>
        </section>
        <section className="border-t border-slate-100 pt-7">
          <h3>Fotoğraf ve video</h3>
          <p className="mt-1 text-xs font-normal text-slate-500">Tek tuşla fotoğraf ve video yükleyin. Fotoğraf en fazla 15 MB, video en fazla 50 MB olabilir.</p>
          <div className="mt-4 rounded-2xl border-2 border-dashed border-slate-200 p-5">
            <div className="flex flex-wrap items-center gap-2">
            <label className="cursor-pointer rounded-xl bg-[#cd011e] px-4 py-3 text-xs font-semibold text-white">
              MEDYA EKLE
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif,image/avif,video/mp4,video/webm,video/quicktime"
                multiple
                className="hidden"
                disabled={uploading}\n                onChange={(e) => { void uploadFiles(e.target.files); e.currentTarget.value = ""; }}
              />
            </label>
            <span className="text-xs font-normal text-slate-500">Seçtiğiniz dosyalar otomatik yüklenir.</span>
            </div>
            {Object.entries(uploadProgress).filter(([, progress]) => progress < 100).map(([name, progress]) => <div key={name} className="mt-3"><div className="mb-1 flex justify-between text-[11px] text-slate-500"><span className="max-w-[75%] truncate">{name}</span><span>%{progress}</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-[#cd011e] transition-all" style={{ width: `${progress}%` }} /></div></div>)}
          </div>
          {uploaded.length > 0 && (
            <>
              <p className="mt-3 text-xs text-slate-500">
                Kapak yapmak için bir görsele tıklayın. Kırmızı çerçeveli görsel
                kapaktır.
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {uploaded.map((item) =>
                  item.type.startsWith("image/") ? (
                    <img
                      key={item.url}
                      src={item.url}
                      onClick={() => setCoverUrl(item.url)}
                      className={`h-24 w-full cursor-pointer rounded-xl object-cover ${coverUrl === item.url ? "ring-4 ring-[#cd011e]" : ""}`}
                    />
                  ) : (
                    <div
                      key={item.url}
                      className="grid h-24 place-items-center rounded-xl bg-slate-100 text-xs font-semibold text-slate-900"
                    >
                      Video eklendi
                    </div>
                  ),
                )}
              </div>
            </>
          )}
          <div className="mt-6 flex justify-end border-t border-slate-100 pt-5">
            <button type="button" onClick={() => { setActiveStep(5); setPreview(true); }} className="rc-primary">
              İlanı gözden geçir
            </button>
          </div>
        </section>
        <section className="border-t border-slate-100 pt-7">
          <h3>İlanı gözden geçir ve yayınla</h3>
          <p className="mt-1 text-xs font-normal text-slate-500">
            İlanı yayınlamadan önce önizlemeyi kontrol edin. Değişiklik için ilgili aşamaya geri dönebilirsiniz.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-3 text-xs font-normal text-slate-600">Önizleme penceresini kapattığınızda bu sayfanın altındaki kırmızı butonla ilanı yayınlayabilirsiniz.</div>
            <div className="flex flex-col justify-end gap-2 text-xs">
              <label>
                <input
                  type="checkbox"
                  checked={dealLabel}
                  onChange={(e) => setDealLabel(e.target.checked)}
                />{" "}
                Fırsat ilanı etiketi
              </label>
            </div>
          </div>
        </section>
        <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-7 sm:flex-row">
          <p className="text-xs font-normal text-slate-500">
            "İlan, gönderildiğinde doğrudan İlanlarımız sayfasında görünür."
          </p>
          <div className="flex gap-2"><button type="button" disabled={activeStep === 1} onClick={() => setActiveStep((step) => Math.max(1, step - 1))} className="rc-secondary disabled:opacity-40">Geri</button>{activeStep < 5 ? <button type="button" onClick={() => setActiveStep((step) => Math.min(5, step + 1))} className="rc-primary min-w-32">Devam Et</button> : <button disabled={saving} className="rc-primary min-w-56 disabled:opacity-60">{saving ? "İŞLEM YAPILIYOR…" : "İLANI YAYINLA"}</button>}</div>
        </footer>
        {ownerPickerOpen && <div className="fixed inset-0 z-[130] grid place-items-center bg-slate-950/45 p-4"><div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold text-slate-900">İlan sahibi seçin</h2><p className="mt-1 text-xs text-slate-500">Profil fotoğrafı veya isimle arayın.</p></div><button type="button" onClick={() => setOwnerPickerOpen(false)} className="rounded-lg p-2 hover:bg-slate-100"><X size={18} /></button></div><div className="relative mt-4"><Search size={16} className="absolute left-3 top-3 text-slate-400" /><input autoFocus value={ownerSearch} onChange={(e) => setOwnerSearch(e.target.value)} className={inputClass + " pl-9"} placeholder="İsim ara" /></div><div className="mt-4 grid max-h-80 gap-2 overflow-y-auto sm:grid-cols-2">{ownerResults.map((advisor) => <button type="button" key={advisor.id} onClick={() => { setForm({ ...form, advisor: advisor.id }); setOwnerPickerOpen(false); }} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3 text-left hover:border-[#cd011e] hover:bg-red-50">{advisor.avatar_url ? <img src={advisor.avatar_url} className="h-11 w-11 rounded-full object-cover" /> : <span className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-slate-400"><UserRound size={18} /></span>}<span><b className="block text-sm text-slate-800">{advisor.first_name} {advisor.last_name}</b><small className="text-xs text-slate-500">Danışman</small></span></button>)}{!ownerResults.length && <p className="col-span-2 p-6 text-center text-sm text-slate-400">Eşleşen profil bulunamadı.</p>}</div></div></div>}
        {preview && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/50 p-4">
            <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">İlan önizlemesi</h2>
                <button
                  type="button"
                  onClick={() => setPreview(false)}
                  className="rc-secondary"
                >
                  Kapat
                </button>
              </div>
              {uploaded.find((x) => x.type.startsWith("image/")) && (
                <img
                  src={uploaded.find((x) => x.type.startsWith("image/"))?.url}
                  className="mt-5 h-64 w-full rounded-xl object-cover"
                />
              )}
              <h1 className="mt-5 text-2xl font-semibold">
                {form.title || "İlan başlığı"}
              </h1>
              <p className="mt-2 text-lg font-semibold text-[#cd011e]">
                {form.price || "0"} {form.currency}
              </p>
              <p className="mt-2 text-sm text-slate-500">
                {form.city || "İl"} / {form.district || "İlçe"} /{" "}
                {form.neighborhood || "Mahalle"}
              </p>
              <div
                className="mt-5 whitespace-pre-wrap text-sm text-slate-700"
                dangerouslySetInnerHTML={{
                  __html: form.description || "Açıklama henüz eklenmedi.",
                }}
              />
              <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-400">İşlem / kategori</span>{form.transaction_type} · {form.category} · {form.property_type}</div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-400">İlan sahibi</span>{selectedOwner ? `${selectedOwner.first_name} ${selectedOwner.last_name}` : viewerName || "Belirtilmedi"}</div>
                <div className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-400">Konum</span>{form.city || "İl"} / {form.district || "İlçe"} / {form.neighborhood || "Mahalle"}</div>
                {form.dues && <div className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-400">Aidat</span>{form.dues} ₺ / ay</div>}
                {Object.entries(form.details).filter(([, value]) => value).map(([key, value]) => <div key={key} className="rounded-xl bg-slate-50 p-3 text-sm"><span className="block text-xs text-slate-400">{key}</span>{value}</div>)}
              </div>
              <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-5">
                <button type="button" onClick={() => setPreview(false)} className="rc-secondary">Düzenlemeye dön</button>
                <button type="button" onClick={() => setPreview(false)} className="rc-primary">Yayınlamaya geç</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
