import { useEffect, useMemo, useState } from "react";
import {
  ArchiveRestore,
  BarChart3,
  Building2,
  Clock3,
  ChevronRight,
  Download,
  FolderKanban,
  LayoutPanelTop,
  Library,
  ListChecks,
  Menu,
  MapPin,
  MessageSquare,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Trash2,
  Tv,
  UserCog,
  Users,
  Upload,
  X,
} from "lucide-react";
import { supabase } from "./lib/supabase";
import { TURKEY_PROVINCES, getTurkeyDistricts } from "./turkeyLocations";

type Page =
  | "overview"
  | "users"
  | "user-create"
  | "advisors"
  | "offices"
  | "listings"
  | "header"
  | "corporate"
  | "media"
  | "library"
  | "crm"
  | "inbox"
  | "backup"
  | "logs"
  | "trash";
type Profile = {
  id: string;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  last_login_at: string | null;
  created_at: string;
  avatar_url?: string | null;
};
type Office = {
  id: string;
  name: string;
  city: string;
  district: string;
  address: string;
  phone: string | null;
  email: string | null;
  manager_name: string | null;
  owner_profile_id?: string | null;
  image_url?: string | null;
  mobile_phone?: string | null;
  landline_phone?: string | null;
  work_hours?: string | null;
  description?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  deleted_at?: string | null;
};
type AdvisorMetric = {
  advisor_id: string;
  messages_answered: number;
  star_rating: number;
};
const groups: {
  title: string;
  items: { id: Page; label: string; icon: any }[];
}[] = [
  {
    title: "YÖNETİM",
    items: [
      { id: "overview", label: "Genel Bakış", icon: BarChart3 },
      { id: "users", label: "Kullanıcılar", icon: Users },
      { id: "advisors", label: "Danışman Yönetimi", icon: UserCog },
      { id: "offices", label: "Ofis Yönetimi", icon: Building2 },
    ],
  },
  {
    title: "İÇERİK VE İLAN",
    items: [
      { id: "listings", label: "İlan Yönetimi", icon: LayoutPanelTop },
      { id: "header", label: "Header Yönetimi", icon: LayoutPanelTop },
      { id: "corporate", label: "Kurumsal Yönetim", icon: Building2 },
      { id: "media", label: "Realty Medya", icon: Tv },
      { id: "library", label: "Realty Kütüphane", icon: Library },
    ],
  },
  {
    title: "OPERASYON",
    items: [
      { id: "crm", label: "CRM", icon: FolderKanban },
      { id: "inbox", label: "İletişim Merkezi", icon: MessageSquare },
    ],
  },
  {
    title: "SİSTEM",
    items: [
      { id: "backup", label: "Yedekleme", icon: ArchiveRestore },
      { id: "logs", label: "İşlem Kayıtları", icon: ListChecks },
      { id: "trash", label: "Çöp Kutusu", icon: Trash2 },
    ],
  },
];
const titleOf = (id: Page) =>
  groups.flatMap((g) => g.items).find((i) => i.id === id)?.label ||
  "Admin Paneli";
const roleName = (role: string) =>
  role === "advisor" ? "Danışman" : role === "manager" ? "Yönetici" : "Admin";
const statusName = (status: string) =>
  ({
    active: "Aktif",
    inactive: "Pasif",
    suspended: "Askıya alındı",
    departed: "Ayrıldı",
  })[status] || status;

function csv(name: string, rows: Record<string, unknown>[], keys: string[]) {
  const text = [
    keys.join(";"),
    ...rows.map((r) =>
      keys
        .map((k) => '"' + String(r[k] || "").replaceAll('"', '""') + '"')
        .join(";"),
    ),
  ].join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(
    new Blob(["\ufeff" + text], { type: "text/csv" }),
  );
  a.download = name + ".csv";
  a.click();
}
function AdvisorsPageV2({
  profiles,
  offices,
  members,
  metrics,
  stars,
  refresh,
  star,
  trash,
  create,
}: {
  profiles: Profile[];
  offices: Office[];
  members: { office_id: string; advisor_id: string }[];
  metrics: AdvisorMetric[];
  stars: { kind: string; entity_id: string }[];
  refresh: () => Promise<void>;
  star: (id: string) => Promise<void>;
  trash: (p: Profile) => Promise<void>;
  create: () => void;
}) {
  const [q, setQ] = useState(""),
    [phone, setPhone] = useState(""),
    [city, setCity] = useState(""),
    [district, setDistrict] = useState("");
  const [busy, setBusy] = useState(""),
    [modal, setModal] = useState<Profile | null>(null),
    [logs, setLogs] = useState<any[] | null>(null);
  const list = profiles.filter((p) => p.role === "advisor");
  useEffect(() => {
    document.querySelectorAll(".advisor-tap").forEach((button) => {
      if (button.textContent?.trim() === "Görüntüle")
        button.textContent = "Görüntüle / Düzenle";
    });
  });
  const office = (p: Profile) =>
    offices.find((o) =>
      members.some((m) => m.advisor_id === p.id && m.office_id === o.id),
    );
  const rows = list.filter((p) => {
    const o = office(p);
    return (
      `${p.first_name} ${p.last_name}`
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!phone || (p.phone || "").includes(phone)) &&
      (!city || o?.city === city) &&
      (!district || o?.district === district)
    );
  });
  const cities = [...new Set(offices.map((o) => o.city).filter(Boolean))],
    districts = [
      ...new Set(
        offices
          .filter((o) => !city || o.city === city)
          .map((o) => o.district)
          .filter(Boolean),
      ),
    ];
  const featured = stars
    .filter((s) => s.kind === "advisor")
    .map((s) => list.find((p) => p.id === s.entity_id))
    .filter(Boolean) as Profile[];
  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    try {
      await action();
    } finally {
      setBusy("");
    }
  };
  const showProfile = (p: Profile) => {
    const currentOffice = office(p),
      modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[130] flex items-center justify-center bg-slate-950/45 p-4";
    modal.innerHTML = `<form class="max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div class="flex items-start justify-between border-b border-slate-100 pb-5"><div><p class="text-[10px] font-black tracking-[.18em] text-[#cd011e]">DANIŞMAN PROFİLİ / DÜZENLE</p><h2 class="mt-1 text-xl font-black">${p.first_name} ${p.last_name}</h2><p class="mt-1 text-xs text-slate-400">Profil, giriş ve bölge bilgilerini güncelleyebilirsiniz.</p></div><button type="button" data-close class="rounded-lg border border-slate-200 px-3 py-2 text-xs font-black">Kapat</button></div><div class="mt-6 grid gap-7 lg:grid-cols-[250px_1fr]"><section><p class="text-sm font-black">Profil Fotoğrafı</p><label data-photo class="mt-4 flex h-52 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-[#cd011e]"><input name="avatar" type="file" accept="image/*" class="hidden"/>${p.avatar_url ? `<img src="${p.avatar_url}" class="h-28 w-28 rounded-full object-cover"/>` : `<span class="grid h-24 w-24 place-items-center rounded-full bg-red-50 text-2xl font-black text-[#cd011e]">${p.first_name[0]}${p.last_name[0]}</span>`}<b class="mt-3 text-xs">Resmi değiştir</b><small class="mt-1 text-[10px] text-slate-400">Tıkla veya sürükle bırak</small></label></section><section><p class="text-sm font-black">Kişisel ve İletişim Bilgileri</p><div class="mt-4 grid gap-3 sm:grid-cols-2"><label class="text-xs font-bold">Ad *<input required name="first_name" value="${p.first_name}" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">Soyad *<input required name="last_name" value="${p.last_name}" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">Kullanıcı adı *<input required name="username" value="${p.username}" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">E-posta *<input required type="email" name="email" value="${p.email}" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">Telefon<input name="phone" value="${p.phone || ""}" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">İl<input name="city" value="${currentOffice?.city || ""}" placeholder="Örn. Ankara" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">İlçe<input name="district" value="${currentOffice?.district || ""}" placeholder="Örn. Çankaya" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">Ofis bilgisi<input disabled value="${currentOffice?.name || "Ofis atanmamış"}" class="mt-1 w-full rounded-xl border bg-slate-50 p-3 text-sm text-slate-400"/></label></div><div class="mt-6 border-t border-slate-100 pt-5"><p class="text-sm font-black">Yetki ve Güvenlik</p><div class="mt-4 grid gap-3 sm:grid-cols-2"><label class="text-xs font-bold">Rol<select name="role" class="mt-1 w-full rounded-xl border p-3 text-sm"><option value="advisor" ${p.role === "advisor" ? "selected" : ""}>Danışman</option><option value="manager" ${p.role === "manager" ? "selected" : ""}>Yönetici</option><option value="admin" ${p.role === "admin" ? "selected" : ""}>Admin</option></select></label><label class="text-xs font-bold">Hesap durumu<select name="status" class="mt-1 w-full rounded-xl border p-3 text-sm"><option value="active" ${p.status === "active" ? "selected" : ""}>Aktif</option><option value="inactive" ${p.status === "inactive" ? "selected" : ""}>Pasif</option><option value="suspended" ${p.status === "suspended" ? "selected" : ""}>Askıya alındı</option></select></label><label class="text-xs font-bold">Yeni şifre<input name="password" type="password" minlength="10" placeholder="Değiştirmek istemiyorsanız boş bırakın" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label><label class="text-xs font-bold">Yeni şifre tekrar<input name="password_repeat" type="password" minlength="10" placeholder="Yeni şifreyi tekrar girin" class="mt-1 w-full rounded-xl border p-3 text-sm"/></label></div><label class="mt-3 flex items-center gap-2 text-xs font-bold"><input name="force" type="checkbox"/> İlk girişte şifre değişikliği zorunlu</label></div></section></div><div class="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5"><button type="button" data-close class="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black">İptal</button><button class="rounded-xl bg-[#cd011e] px-6 py-3 text-xs font-black text-white">DEĞİŞİKLİKLERİ KAYDET</button></div></form>`;
    const close = () => modal.remove(),
      form = modal.querySelector("form") as HTMLFormElement,
      input = modal.querySelector("[name=avatar]") as HTMLInputElement,
      photo = modal.querySelector("[data-photo]")!;
    modal
      .querySelectorAll("[data-close]")
      .forEach((x) => x.addEventListener("click", close));
    photo.addEventListener("click", () => input.click());
    photo.addEventListener("dragover", (e) => e.preventDefault());
    photo.addEventListener("drop", (e) => {
      e.preventDefault();
      input.files = e.dataTransfer?.files || null;
    });
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form),
        password = String(fd.get("password") || "");
      if (password !== String(fd.get("password_repeat") || ""))
        return alert("Şifre tekrarı eşleşmiyor.");
      const image = fd.get("avatar") as File;
      const avatar = image?.size
        ? await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.readAsDataURL(image);
          })
        : p.avatar_url || null;
      const button = form.querySelector(
        "button[type=submit]",
      ) as HTMLButtonElement;
      button.disabled = true;
      button.textContent = "KAYDEDİLİYOR…";
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: String(fd.get("first_name")).trim(),
          last_name: String(fd.get("last_name")).trim(),
          username: String(fd.get("username"))
            .trim()
            .toLowerCase()
            .replace(/\\s/g, ""),
          email: String(fd.get("email")).trim().toLowerCase(),
          phone: String(fd.get("phone")).trim() || null,
          role: String(fd.get("role")),
          status: String(fd.get("status")),
          avatar_url: avatar,
          expertise_areas: [
            String(fd.get("city")).trim(),
            String(fd.get("district")).trim(),
          ].filter(Boolean),
        })
        .eq("id", p.id);
      if (error) {
        alert(error.message);
        button.disabled = false;
        button.textContent = "DEĞİŞİKLİKLERİ KAYDET";
        return;
      }
      if (password) {
        const { data, error: passwordError } = await supabase.functions.invoke(
          "admin-users",
          {
            body: {
              action: "update_user",
              payload: {
                id: p.id,
                password,
                forcePasswordChange: fd.get("force") === "on",
              },
            },
          },
        );
        if (passwordError || data?.error) {
          alert(
            "Profil kaydedildi; şifre güncellenemedi: " +
              (data?.error || passwordError?.message),
          );
          button.disabled = false;
          button.textContent = "DEĞİŞİKLİKLERİ KAYDET";
          return;
        }
      }
      close();
      await refresh();
      alert("Danışman bilgileri başarıyla güncellendi.");
    });
    document.body.appendChild(modal);
  };
  const showLogs = async (p: Profile) => {
    setModal(p);
    setLogs(null);
    setBusy("Hareketler yükleniyor");
    try {
      const { data } = await supabase
        .from("audit_logs")
        .select("action,created_at")
        .eq("entity_id", p.id)
        .order("created_at", { ascending: false })
        .limit(30);
      setLogs(data || []);
    } finally {
      setBusy("");
    }
  };
  const exportRows = () =>
    run("Excel dosyası hazırlanıyor", async () => {
      await new Promise((r) => setTimeout(r, 500));
      csv(
        "realty-center-danismanlar",
        rows.map((p) => ({
          Danışman: `${p.first_name} ${p.last_name}`,
          Telefon: p.phone || "",
          Eposta: p.email,
          Ofis: office(p)?.name || "",
          Durum: statusName(p.status),
        })),
        ["Danışman", "Telefon", "Eposta", "Ofis", "Durum"],
      );
    });
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <style>{`.advisor-tap{transition:all .18s ease}.advisor-tap:hover{transform:translateY(-2px);box-shadow:0 10px 22px #0f17221c}.advisor-tap:active{transform:scale(.97)}`}</style>
      <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-5 lg:px-8">
        <div className="hidden items-center gap-2 text-xs text-slate-400 md:flex">
          <UserCog size={15} />
          <span>Danışmanlar / Yönetim Merkezi</span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-xs font-bold text-slate-500">Sistem aktif</span>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-5 lg:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
              REALTY CENTER　›　YÖNETİM
            </p>
            <h1 className="mt-1 text-2xl font-black">Danışman Yönetimi</h1>
            <p className="mt-1 text-sm text-slate-500">
              Danışman profilleri, ofis bağları, performans ve yıldız seçimini
              yönetin.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run("Danışmanlar yenileniyor", refresh)}
              className="advisor-tap inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
            >
              <RefreshCw size={15} /> Yenile
            </button>
            <button
              onClick={exportRows}
              className="advisor-tap inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
            >
              <Download size={15} /> Excel'e Aktar
            </button>
            <button
              onClick={create}
              className="advisor-tap inline-flex items-center gap-2 rounded-xl bg-[#cd011e] px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-700/20"
            >
              <Plus size={16} /> Danışman Ekle
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [Users, "Toplam Danışman", list.length, "bg-blue-50 text-blue-600"],
            [
              ShieldCheck,
              "Aktif Danışman",
              list.filter((p) => p.status === "active").length,
              "bg-emerald-50 text-emerald-600",
            ],
            [
              MessageSquare,
              "Yanıtlanan Mesaj",
              metrics.reduce((a, m) => a + m.messages_answered, 0),
              "bg-violet-50 text-violet-600",
            ],
            [
              Building2,
              "Ofisli Danışman",
              list.filter((p) => office(p)).length,
              "bg-amber-50 text-amber-600",
            ],
          ].map(([Icon, label, value, color]: any) => (
            <div
              key={label}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={`grid h-10 w-10 place-items-center rounded-xl ${color}`}
                >
                  <Icon size={19} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400">{label}</p>
                  <b className="text-lg">{value}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
        <section className="mt-5 overflow-hidden rounded-2xl bg-[#cd011e] p-5 text-white shadow-lg shadow-red-700/15">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[.2em] text-white/75">
                REALTY CENTER YILDIZLARIMIZ
              </p>
              <h2 className="mt-1 text-base font-black">
                Ana sayfada gösterilen danışmanlar
              </h2>
            </div>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black">
              {featured.length}/3 seçildi
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            {featured.length ? (
              featured.map((p) => (
                <button
                  key={p.id}
                  onClick={() => showProfile(p)}
                  className="advisor-tap flex items-center gap-2 rounded-xl border border-white/25 bg-white/10 px-3 py-2 text-left hover:bg-white hover:text-[#cd011e]"
                >
                  <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white/20 text-xs font-black">
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      `${p.first_name[0]}${p.last_name[0]}`
                    )}
                  </span>
                  <span>
                    <b className="block text-xs">
                      ★ {p.first_name} {p.last_name}
                    </b>
                    <small className="text-[10px] opacity-75">
                      Kartı görüntüle
                    </small>
                  </span>
                </button>
              ))
            ) : (
              <span className="text-sm text-red-100">
                Henüz yıldız danışman seçilmedi.
              </span>
            )}
          </div>
        </section>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_180px_180px_180px_auto]">
          <label className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Search size={16} className="mr-3 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Ad soyad ara..."
            />
          </label>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Telefon ara"
          />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setDistrict("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm iller</option>
            {cities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm ilçeler</option>
            {districts.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setQ("");
              setPhone("");
              setCity("");
              setDistrict("");
            }}
            className="advisor-tap rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
          >
            Temizle
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1120px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Danışman</th>
                <th className="p-4">İletişim Bilgileri</th>
                <th className="p-4">Ofis</th>
                <th className="p-4">Puan / Mesaj</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const o = office(p),
                  m = metrics.find((x) => x.advisor_id === p.id),
                  isStar = stars.some(
                    (x) => x.kind === "advisor" && x.entity_id === p.id,
                  );
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 text-sm transition hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <button
                        onClick={() => showProfile(p)}
                        className="advisor-tap flex items-center gap-3 text-left"
                      >
                        {p.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-xs font-black text-[#cd011e]">
                            {p.first_name[0]}
                            {p.last_name[0]}
                          </span>
                        )}
                        <span>
                          <b className="block text-xs">
                            {p.first_name} {p.last_name}
                          </b>
                          <small className="text-[11px] text-slate-400">
                            @{p.username}
                          </small>
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      ✉　{p.email}
                      <br />
                      <span className="text-slate-400">
                        ⌕　{p.phone || "Telefon eklenmedi"}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <b>{o?.name || "Ofis atanmamış"}</b>
                      <br />
                      <span className="text-slate-400">
                        {o ? `${o.city} / ${o.district}` : "—"}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      ★ {m?.star_rating || 0}/5
                      <br />
                      <span className="text-slate-400">
                        {m?.messages_answered || 0} yanıt
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-black ${p.status === "active" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}
                      >
                        ●　{statusName(p.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() =>
                            run(
                              isStar
                                ? "Yıldızlardan çıkarılıyor"
                                : "Yıldızlara ekleniyor",
                              () => star(p.id),
                            )
                          }
                          className={`advisor-tap rounded-lg px-3 py-2 text-xs font-black text-white ${isStar ? "bg-amber-500 hover:bg-amber-600" : "bg-[#cd011e] hover:bg-[#a90019]"}`}
                        >
                          {isStar ? "★ Çıkar" : "☆ Yıldızlara Ekle"}
                        </button>
                        <button
                          onClick={() => void showLogs(p)}
                          className="advisor-tap rounded-lg bg-slate-700 px-3 py-2 text-xs font-black text-white hover:bg-slate-900"
                        >
                          Hareketleri Gör
                        </button>
                        <button
                          onClick={() => showProfile(p)}
                          className="advisor-tap rounded-lg bg-slate-200 px-3 py-2 text-xs font-black text-slate-700 hover:bg-slate-300"
                        >
                          Görüntüle
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Danışman çöp kutusuna taşınsın mı?"))
                              void run("Danışman çöp kutusuna taşınıyor", () =>
                                trash(p),
                              );
                          }}
                          className="advisor-tap rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white hover:bg-rose-700"
                        >
                          Çöp Kutusu
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <div className="p-12 text-center text-sm text-slate-400">
              Bu filtrelerle eşleşen danışman bulunmuyor.
            </div>
          )}
          <p className="p-4 text-xs text-slate-400">
            {rows.length} danışman gösteriliyor
          </p>
        </div>
      </main>
      {modal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/45 p-4">
          <article className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                {modal.avatar_url ? (
                  <img
                    src={modal.avatar_url}
                    className="h-16 w-16 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="grid h-16 w-16 place-items-center rounded-2xl bg-red-50 text-xl font-black text-[#cd011e]">
                    {modal.first_name[0]}
                    {modal.last_name[0]}
                  </span>
                )}
                <div>
                  <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
                    DANIŞMAN PROFİLİ
                  </p>
                  <h2 className="mt-1 text-xl font-black">
                    {modal.first_name} {modal.last_name}
                  </h2>
                  <p className="text-xs text-slate-400">@{modal.username}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setModal(null);
                  setLogs(null);
                }}
                className="advisor-tap rounded-lg border border-slate-200 px-3 py-2 text-xs font-black"
              >
                Kapat
              </button>
            </div>
            {logs ? (
              <div className="mt-6 space-y-2">
                {logs.length ? (
                  logs.map((x, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <b>{x.action}</b>
                      <p className="mt-1 text-xs text-slate-400">
                        {new Date(x.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-9 text-center text-sm text-slate-400">
                    Kayıtlı hareket bulunmuyor.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {[
                  ["E-posta", modal.email],
                  ["Telefon", modal.phone || "Eklenmedi"],
                  ["Ofis", office(modal)?.name || "Atanmamış"],
                  [
                    "Konum",
                    office(modal)
                      ? `${office(modal)?.city} / ${office(modal)?.district}`
                      : "—",
                  ],
                  ["Hesap Durumu", statusName(modal.status)],
                  [
                    "Puan",
                    `★ ${metrics.find((m) => m.advisor_id === modal.id)?.star_rating || 0}/5`,
                  ],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 p-4">
                    <p className="text-[10px] font-black text-slate-400">
                      {label}
                    </p>
                    <b className="mt-1 block text-sm">{value}</b>
                  </div>
                ))}
              </div>
            )}
          </article>
        </div>
      )}
      {busy && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/35">
          <div className="rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#cd011e]" />
            <h2 className="mt-5 font-black">{busy}</h2>
            <p className="mt-1 text-xs text-slate-400">Lütfen bekleyin.</p>
          </div>
        </div>
      )}
    </div>
  );
}
function AdvisorsPage({
  profiles,
  offices,
  members,
  metrics,
  stars,
  refresh,
  star,
  trash,
  create,
}: {
  profiles: Profile[];
  offices: Office[];
  members: { office_id: string; advisor_id: string }[];
  metrics: AdvisorMetric[];
  stars: { kind: string; entity_id: string }[];
  refresh: () => Promise<void>;
  star: (id: string) => void;
  trash: (p: Profile) => void;
  create: () => void;
}) {
  const [q, setQ] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [busy, setBusy] = useState("");
  const [modal, setModal] = useState<Profile | null>(null);
  const [logs, setLogs] = useState<any[] | null>(null);
  const list = profiles.filter((p) => p.role === "advisor");
  const office = (p: Profile) =>
    offices.find((o) =>
      members.some((m) => m.advisor_id === p.id && m.office_id === o.id),
    );
  const rows = list.filter((p) => {
    const o = office(p);
    return (
      (p.first_name + " " + p.last_name)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (!phone || (p.phone || "").includes(phone)) &&
      (!city || o?.city === city) &&
      (!district || o?.district === district)
    );
  });
  const cities = [...new Set(offices.map((o) => o.city))],
    districts = [
      ...new Set(
        offices.filter((o) => !city || o.city === city).map((o) => o.district),
      ),
    ],
    featured = stars
      .filter((s) => s.kind === "advisor")
      .map((s) => list.find((p) => p.id === s.entity_id))
      .filter(Boolean) as Profile[];
  const reload = async () => {
    setBusy("Danışmanlar yenileniyor");
    await refresh();
    setBusy("");
  };
  const exp = () => {
    setBusy("Excel hazırlanıyor");
    setTimeout(() => {
      csv(
        "realty-center-danismanlar",
        rows.map((p) => ({
          Danışman: p.first_name + " " + p.last_name,
          Telefon: p.phone || "",
          Eposta: p.email,
          Ofis: office(p)?.name || "",
        })),
        ["Danışman", "Telefon", "Eposta", "Ofis"],
      );
      setBusy("");
    }, 550);
  };
  const move = async (p: Profile) => {
    if (!confirm("Danışman çöp kutusuna taşınsın mı?")) return;
    setBusy("Çöp kutusuna taşınıyor");
    await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), status: "departed" })
      .eq("id", p.id);
    await refresh();
    setBusy("");
  };
  const showLogs = async (p: Profile) => {
    setModal(p);
    setLogs(null);
    const { data } = await supabase
      .from("audit_logs")
      .select("action,created_at")
      .eq("entity_id", p.id)
      .order("created_at", { ascending: false })
      .limit(30);
    setLogs(data || []);
  };
  return (
    <div className="min-h-screen bg-[#f7f9fc] p-5 text-slate-900 lg:p-8">
      <div className="mx-auto max-w-[1500px]">
        <div className="flex items-end justify-between border-b border-slate-100 pb-5">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
              REALTY CENTER / YÖNETİM
            </p>
            <h1 className="mt-1 text-2xl font-black">Danışman Yönetimi</h1>
            <p className="mt-1 text-sm text-slate-500">
              Danışman profil, ofis ve aktivite kayıtlarını yönetin.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reload}
              className="tap rounded-xl border bg-white px-4 py-3 text-xs font-black"
            >
              <RefreshCw size={15} className="mr-2 inline" />
              Yenile
            </button>
            <button
              onClick={exp}
              className="tap rounded-xl border bg-white px-4 py-3 text-xs font-black"
            >
              <Download size={15} className="mr-2 inline" />
              Excel'e Aktar
            </button>
            <button
              onClick={create}
              className="tap rounded-xl bg-[#cd011e] px-4 py-3 text-xs font-black text-white"
            >
              <Plus size={15} className="mr-2 inline" />
              Danışman Ekle
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["Toplam Danışman", list.length],
            [
              "Aktif Danışman",
              list.filter((p) => p.status === "active").length,
            ],
            [
              "Yanıtlanan Mesaj",
              metrics.reduce((a, m) => a + m.messages_answered, 0),
            ],
            ["Ofisli Danışman", list.filter((p) => office(p)).length],
          ].map(([l, n]) => (
            <div key={String(l)} className="rounded-xl bg-white p-4 shadow-sm">
              <p className="text-xs font-bold text-slate-400">{l}</p>
              <b className="text-xl">{n}</b>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-2xl bg-[#cd011e] p-5 text-white">
          <p className="text-[10px] font-black tracking-[.18em]">
            REALTY CENTER YILDIZLARIMIZ
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {featured.length ? (
              featured.map((p) => (
                <span
                  className="rounded-full border border-white/30 px-3 py-1 text-xs font-bold"
                  key={p.id}
                >
                  ★ {p.first_name} {p.last_name}
                </span>
              ))
            ) : (
              <span className="text-sm text-red-100">
                Henüz yıldız danışman seçilmedi.
              </span>
            )}
          </div>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="rounded-xl border bg-white px-4 py-3 text-sm"
            placeholder="Ad soyad ara"
          />
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="rounded-xl border bg-white px-4 py-3 text-sm"
            placeholder="Telefon ara"
          />
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setDistrict("");
            }}
            className="rounded-xl border bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm iller</option>
            {cities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            className="rounded-xl border bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm ilçeler</option>
            {districts.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <button
            onClick={() => {
              setQ("");
              setPhone("");
              setCity("");
              setDistrict("");
            }}
            className="tap rounded-xl border bg-white px-4 py-3 text-xs font-black"
          >
            Filtreleri temizle
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Danışman</th>
                <th className="p-4">İletişim / Ofis</th>
                <th className="p-4">Puan / Mesaj</th>
                <th className="p-4">Durum</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const o = office(p),
                  m = metrics.find((x) => x.advisor_id === p.id),
                  isStar = stars.some(
                    (x) => x.kind === "advisor" && x.entity_id === p.id,
                  );
                return (
                  <tr key={p.id} className="border-t text-sm">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-full bg-red-50 text-xs font-black text-[#cd011e]">
                            {p.first_name[0]}
                            {p.last_name[0]}
                          </span>
                        )}
                        <div>
                          <b>
                            {p.first_name} {p.last_name}
                          </b>
                          <p className="text-xs text-slate-400">
                            @{p.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      {p.phone || "Telefon yok"}
                      <br />
                      <span className="text-slate-400">
                        {o
                          ? o.name + " · " + o.city + "/" + o.district
                          : "Ofis atanmamış"}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      ★ {m?.star_rating || 0}/5
                      <br />
                      {m?.messages_answered || 0} yanıt
                    </td>
                    <td className="p-4 text-xs">{statusName(p.status)}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => star(p.id)}
                          className="tap rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-black text-amber-700"
                        >
                          {isStar ? "★ Çıkar" : "☆ Yıldızlara Ekle"}
                        </button>
                        <button
                          onClick={() => showLogs(p)}
                          className="tap rounded-lg border px-3 py-2 text-xs font-black"
                        >
                          Hareketleri Gör
                        </button>
                        <button
                          onClick={() => {
                            setModal(p);
                            setLogs(null);
                          }}
                          className="tap rounded-lg border px-3 py-2 text-xs font-black"
                        >
                          Görüntüle
                        </button>
                        <button
                          onClick={() => move(p)}
                          className="tap rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-black text-rose-700"
                        >
                          Çöp Kutusu
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {modal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
                  DANIŞMAN PROFİLİ
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {modal.first_name} {modal.last_name}
                </h2>
              </div>
              <button
                onClick={() => {
                  setModal(null);
                  setLogs(null);
                }}
                className="tap rounded-lg border px-3 py-2 text-xs font-black"
              >
                Kapat
              </button>
            </div>
            {logs ? (
              <div className="mt-5 space-y-2">
                {logs.length ? (
                  logs.map((x, i) => (
                    <div key={i} className="rounded-xl bg-slate-50 p-3 text-sm">
                      <b>{x.action}</b>
                      <p className="text-xs text-slate-400">
                        {new Date(x.created_at).toLocaleString("tr-TR")}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="py-8 text-center text-sm text-slate-400">
                    Kayıtlı hareket bulunmuyor.
                  </p>
                )}
              </div>
            ) : (
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {[
                  ["Ad", modal.first_name],
                  ["Soyad", modal.last_name],
                  ["E-posta", modal.email],
                  ["Telefon", modal.phone || "Eklenmedi"],
                  ["Ofis", office(modal)?.name || "Atanmamış"],
                  ["Durum", statusName(modal.status)],
                ].map(([l, v]) => (
                  <div key={l} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-[10px] font-black text-slate-400">{l}</p>
                    <b className="text-sm">{v}</b>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      {busy && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/35">
          <div className="rounded-2xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#cd011e]" />
            <h2 className="mt-4 font-black">{busy}</h2>
          </div>
        </div>
      )}
    </div>
  );
}
function PanelFrame({
  page,
  setPage,
  children,
}: {
  page: Page;
  setPage: (p: Page) => void;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f7f9fc]">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r border-slate-200 bg-white lg:block">
        <div className="border-b border-slate-100 px-6 py-5">
          <p className="text-xs font-black tracking-[.2em] text-[#cd011e]">
            REALTY CENTER
          </p>
          <p className="mt-1 text-lg font-black">Admin Paneli</p>
        </div>
        <nav className="p-4">
          {groups.map((g) => (
            <div key={g.title} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-black tracking-wider text-slate-400">
                {g.title}
              </p>
              {g.items.map((i) => {
                const Icon = i.icon;
                return (
                  <button
                    key={i.id}
                    onClick={() => setPage(i.id)}
                    className={`tap mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${page === i.id ? "bg-[#cd011e] text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Icon size={18} />
                    {i.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-h-screen lg:pl-72">{children}</main>
    </div>
  );
}

function UsersPage({
  profiles,
  offices,
  create,
  refresh,
}: {
  profiles: Profile[];
  offices: Office[];
  create: () => void;
  refresh: () => void | Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [r, setR] = useState("all");
  const [s, setS] = useState("all");
  const [busy, setBusy] = useState(false);
  const [selected, setSelected] = useState<Profile | null>(null);
  const [saving, setSaving] = useState(false);
  const [busyText, setBusyText] = useState("");
  const rows = profiles.filter(
    (p) =>
      (p.first_name + " " + p.last_name + " " + p.username + " " + p.email)
        .toLowerCase()
        .includes(q.toLowerCase()) &&
      (r === "all" || p.role === r) &&
      (s === "all" || p.status === s),
  );
  const active = profiles.filter((p) => p.status === "active").length;
  const run = () => {
    setBusyText("Excel hazırlanıyor");
    setBusy(true);
    setTimeout(() => {
      csv(
        "realty-center-kullanicilar",
        rows.map((p) => ({
          Kullanıcı: p.first_name + " " + p.last_name,
          "Kullanıcı Adı": p.username,
          "E-posta": p.email,
          Rol: roleName(p.role),
          Durum: statusName(p.status),
          Telefon: p.phone || "",
        })),
        ["Kullanıcı", "Kullanıcı Adı", "E-posta", "Rol", "Durum", "Telefon"],
      );
      setBusy(false);
    }, 650);
  };
  const reload = async () => {
    setBusyText("Kullanıcılar yenileniyor");
    setBusy(true);
    await refresh();
    setBusy(false);
  };
  if (selected)
    return (
      <UserEditPage
        profile={selected}
        cancel={() => setSelected(null)}
        done={async () => {
          await refresh();
          setSelected(null);
        }}
      />
    );
  return (
    <div className="min-h-screen bg-[#f7f9fc] text-slate-900">
      <style>{`.tap{transition:transform .15s ease,box-shadow .15s ease}.tap:active{transform:scale(.96) translateY(1px);box-shadow:none}.tap:hover{box-shadow:0 8px 18px #0f172215}`}</style>
      <header className="flex h-16 items-center justify-between border-b border-slate-100 bg-white px-5 lg:px-8">
        <span className="hidden h-9 w-72 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-xs text-slate-400 md:flex">
          <Search size={15} className="mr-2" /> İlan, kullanıcı, ofis ara...
        </span>
        <div className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#cd011e]" />
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#cd011e] text-xs font-black text-white">
            AR
          </span>
          <span className="hidden text-xs font-bold sm:block">
            Admin
            <br />
            <i className="font-normal text-slate-400">Yönetici</i>
          </span>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] p-5 lg:p-8">
        <div className="flex flex-col gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
              REALTY CENTER　›　YÖNETİM
            </p>
            <h1 className="mt-1 text-2xl font-black">Kullanıcılar</h1>
            <p className="mt-1 text-sm text-slate-500">
              Tüm hesapları rol, durum ve iletişim bilgileriyle yönetin.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={reload}
              className="tap inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
            >
              <RefreshCw size={15} /> Yenile
            </button>
            <button
              onClick={run}
              className="tap inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
            >
              <Download size={15} /> Excel'e Aktar
            </button>
            <button
              onClick={create}
              className="tap inline-flex items-center gap-2 rounded-xl bg-[#cd011e] px-4 py-3 text-xs font-black text-white"
            >
              <Plus size={16} /> Yeni Kullanıcı
            </button>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            [
              Users,
              "Toplam Kullanıcı",
              profiles.length,
              "bg-blue-50 text-blue-600",
            ],
            [
              Users,
              "Aktif Kullanıcı",
              active,
              "bg-emerald-50 text-emerald-600",
            ],
            [
              Users,
              "Pasif Kullanıcı",
              profiles.filter((p) => p.status === "inactive").length,
              "bg-amber-50 text-amber-600",
            ],
            [
              ShieldCheck,
              "Askıdaki Kullanıcı",
              profiles.filter((p) => p.status === "suspended").length,
              "bg-rose-50 text-rose-600",
            ],
          ].map(([I, l, n, c]: any) => (
            <div
              key={l}
              className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span
                  className={
                    "grid h-10 w-10 place-items-center rounded-xl " + c
                  }
                >
                  <I size={19} />
                </span>
                <div>
                  <p className="text-xs font-bold text-slate-400">{l}</p>
                  <b className="text-lg">{n}</b>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_190px_190px_auto]">
          <label className="flex items-center rounded-xl border border-slate-200 bg-white px-4 py-3">
            <Search size={16} className="mr-3 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Ad, e-posta veya kullanıcı adı ara..."
            />
          </label>
          <select
            value={r}
            onChange={(e) => setR(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="all">Tüm roller</option>
            <option value="advisor">Danışman</option>
            <option value="manager">Yönetici</option>
            <option value="admin">Admin</option>
          </select>
          <select
            value={s}
            onChange={(e) => setS(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="all">Tüm durumlar</option>
            <option value="active">Aktif</option>
            <option value="inactive">Pasif</option>
            <option value="suspended">Askıya alındı</option>
          </select>
          <button
            onClick={() => {
              setQ("");
              setR("all");
              setS("all");
            }}
            className="tap rounded-xl border border-slate-200 bg-white px-4 py-3 text-xs font-black"
          >
            Filtreleri temizle
          </button>
        </div>
        <div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="border-b border-slate-100 bg-slate-50 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Kullanıcı</th>
                <th className="p-4">İletişim Bilgileri</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Ofis</th>
                <th className="p-4">Durum</th>
                <th className="p-4">Son Giriş</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const office =
                  offices.find((o) => o.owner_profile_id === p.id)?.name || "—";
                return (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 text-sm hover:bg-slate-50"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {p.avatar_url ? (
                          <img
                            src={p.avatar_url}
                            className="h-9 w-9 rounded-full object-cover"
                          />
                        ) : (
                          <span className="grid h-9 w-9 place-items-center rounded-full bg-red-50 text-xs font-black text-[#cd011e]">
                            {p.first_name[0]}
                            {p.last_name[0]}
                          </span>
                        )}
                        <div>
                          <b className="block text-xs">
                            {p.first_name} {p.last_name}
                          </b>
                          <span className="text-[11px] text-slate-400">
                            @{p.username}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-slate-600">
                      ✉　{p.email}
                      <br />
                      <span className="text-slate-400">
                        ⌕　{p.phone || "Telefon eklenmedi"}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={
                          "rounded-full px-3 py-1 text-[11px] font-black " +
                          (p.role === "advisor"
                            ? "bg-blue-100 text-blue-700"
                            : p.role === "manager"
                              ? "bg-violet-100 text-violet-700"
                              : "bg-rose-100 text-rose-700")
                        }
                      >
                        {roleName(p.role)}
                      </span>
                    </td>
                    <td className="p-4 text-xs">{office}</td>
                    <td className="p-4">
                      <span
                        className={
                          "rounded-full px-3 py-1 text-[11px] font-black " +
                          (p.status === "active"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.status === "inactive"
                              ? "bg-amber-100 text-amber-700"
                              : "bg-rose-100 text-rose-700")
                        }
                      >
                        ●　{statusName(p.status)}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-slate-500">
                      {p.last_login_at
                        ? new Date(p.last_login_at).toLocaleString("tr-TR")
                        : "Henüz giriş yok"}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setSelected(p)}
                        className="tap rounded-lg border border-slate-200 px-3 py-2 text-xs font-black"
                      >
                        Görüntüle
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!rows.length && (
            <div className="p-12 text-center text-sm text-slate-400">
              Bu filtrelerle eşleşen kullanıcı bulunmuyor.
            </div>
          )}
          <p className="p-4 text-xs text-slate-400">
            {rows.length} kullanıcı gösteriliyor
          </p>
        </div>
      </main>
      {selected && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setSaving(true);
              const f = new FormData(e.currentTarget);
              const { error } = await supabase
                .from("profiles")
                .update({
                  first_name: String(f.get("first_name")).trim(),
                  last_name: String(f.get("last_name")).trim(),
                  username: String(f.get("username"))
                    .trim()
                    .toLowerCase()
                    .replace(/\\s/g, ""),
                  email: String(f.get("email")).trim().toLowerCase(),
                  phone: String(f.get("phone")).trim() || null,
                  role: String(f.get("role")),
                  status: String(f.get("status")),
                })
                .eq("id", selected.id);
              setSaving(false);
              if (error) {
                window.alert(error.message);
                return;
              }
              await refresh();
              setSelected(null);
            }}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">
                  KULLANICI DETAYI
                </p>
                <h2 className="mt-1 text-xl font-black">
                  {selected.first_name} {selected.last_name}
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Bilgileri düzenleyip kaydedebilirsiniz.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="tap rounded-lg border border-slate-200 px-3 py-2 text-xs font-black"
              >
                Kapat
              </button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {[
                ["first_name", "Ad"],
                ["last_name", "Soyad"],
                ["username", "Kullanıcı adı"],
                ["email", "E-posta"],
                ["phone", "Telefon"],
              ].map(([key, label]) => (
                <label key={key} className="text-xs font-black text-slate-700">
                  {label}
                  <input
                    required={key !== "phone"}
                    name={key}
                    defaultValue={(selected as any)[key] || ""}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#cd011e]"
                  />
                </label>
              ))}
              <label className="text-xs font-black">
                Rol
                <select
                  name="role"
                  defaultValue={selected.role}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                >
                  <option value="advisor">Danışman</option>
                  <option value="manager">Yönetici</option>
                  <option value="admin">Admin</option>
                </select>
              </label>
              <label className="text-xs font-black">
                Hesap durumu
                <select
                  name="status"
                  defaultValue={selected.status}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                >
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="suspended">Askıya alındı</option>
                  <option value="departed">Ayrıldı</option>
                </select>
              </label>
            </div>
            <div className="mt-7 flex justify-end gap-2 border-t border-slate-100 pt-5">
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="tap rounded-xl border border-slate-200 px-4 py-3 text-xs font-black"
              >
                Vazgeç
              </button>
              <button
                disabled={saving}
                className="tap rounded-xl bg-[#cd011e] px-5 py-3 text-xs font-black text-white disabled:opacity-60"
              >
                {saving ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
      {busy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35">
          <div className="w-72 rounded-2xl bg-white p-7 text-center shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#cd011e]" />
            <h2 className="mt-4 font-black">{busyText}</h2>
            <p className="mt-1 text-xs text-slate-500">
              {busyText.includes("Excel")
                ? "Kullanıcı listesi indirilmeye hazırlanıyor."
                : "Yalnızca kullanıcı kayıtları güncelleniyor."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminControlCenter() {
  const [page, setPage] = useState<Page>("overview");
  const [mobile, setMobile] = useState(false);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [offices, setOffices] = useState<Office[]>([]);
  const [metrics, setMetrics] = useState<AdvisorMetric[]>([]);
  const [officeMembers, setOfficeMembers] = useState<
    { office_id: string; advisor_id: string; is_manager: boolean }[]
  >([]);
  const [stars, setStars] = useState<
    { kind: string; entity_id: string; position: number }[]
  >([]);
  const [search, setSearch] = useState("");
  const [role, setRole] = useState("all");
  const [officeCity, setOfficeCity] = useState("");
  const [officeDistrict, setOfficeDistrict] = useState("");
  const [drawer, setDrawer] = useState<Profile | null>(null);
  const [officeDrawer, setOfficeDrawer] = useState<Office | null>(null);
  const [showOfficeCreate, setShowOfficeCreate] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [fields, setFields] = useState([
    "Ad Soyad",
    "Kullanıcı Adı",
    "E-posta",
    "Rol",
    "Durum",
    "Telefon",
  ]);
  const [listingMode, setListingMode] = useState<"all" | "approval" | "add">(
    "all",
  );
  const [notice, setNotice] = useState("");
  const [newUserOpen, setNewUserOpen] = useState(false);
  const alert = (t: string) => {
    if (t === "Yeni kullanıcı formu mevcut Kullanıcılar ekranından açılır.") {
      setPage("user-create");
      return;
    }
    setNotice(t);
    setTimeout(() => setNotice(""), 2800);
  };
  const cacheKey = "realty-center:admin-bootstrap:v2";
  const applyBootstrap = (data: {
    profiles?: Profile[];
    offices?: Office[];
    metrics?: AdvisorMetric[];
    officeMembers?: {
      office_id: string;
      advisor_id: string;
      is_manager: boolean;
    }[];
    stars?: { kind: string; entity_id: string; position: number }[];
  }) => {
    if (data.profiles) setProfiles(data.profiles);
    if (data.offices) setOffices(data.offices);
    if (data.metrics) setMetrics(data.metrics);
    if (data.officeMembers) setOfficeMembers(data.officeMembers);
    if (data.stars) setStars(data.stars);
  };
  const load = async () => {
    const [p, o, m, om, s] = await Promise.all([
      supabase
        .from("profiles")
        .select(
          "id,first_name,last_name,username,email,phone,role,status,last_login_at,created_at,avatar_url",
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("offices")
        .select(
          "id,name,city,district,address,phone,email,manager_name,owner_profile_id,image_url,deleted_at",
        )
        .is("deleted_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("advisor_metrics")
        .select("advisor_id,messages_answered,star_rating"),
      supabase
        .from("office_advisors")
        .select("office_id,advisor_id,is_manager"),
      supabase
        .from("homepage_stars")
        .select("kind,entity_id,position")
        .order("position"),
    ]);
    const next = {
      profiles: (p.data || []) as Profile[],
      offices: (o.data || []) as Office[],
      metrics: (m.data || []) as AdvisorMetric[],
      officeMembers: (om.data || []) as {
        office_id: string;
        advisor_id: string;
        is_manager: boolean;
      }[],
      stars: (s.data || []) as {
        kind: string;
        entity_id: string;
        position: number;
      }[],
    };
    applyBootstrap(next);
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify(next));
    } catch {}
  };
  useEffect(() => {
    try {
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) applyBootstrap(JSON.parse(cached));
    } catch {}
    void load();
  }, []);
  useEffect(() => {
    if (!newUserOpen) return;
    setPage("user-create");
    setNewUserOpen(false);
    return;
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4";
    modal.innerHTML = `<form class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div class="flex items-start justify-between gap-3"><div><p class="text-[10px] font-black tracking-[.2em] text-[#cd011e]">REALTY CENTER</p><h2 class="mt-1 text-xl font-black text-slate-900">Yeni Kullanıcı</h2><p class="mt-1 text-sm text-slate-500">Kullanıcı gerçek authentication sistemine kaydedilir.</p></div><button type="button" data-close class="rounded-lg p-2 text-slate-500">✕</button></div><div data-error class="mt-4 hidden rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700"></div><div class="mt-5 grid gap-3 md:grid-cols-2"><label class="text-xs font-black text-slate-700">AD *<input name="firstName" required class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">SOYAD *<input name="lastName" required class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">KULLANICI ADI *<input name="username" required class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">E-POSTA *<input name="email" type="email" required class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">TELEFON<input name="phone" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">ROL *<select name="role" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"><option value="advisor">Danışman</option><option value="manager">Yönetici</option><option value="admin">Admin</option></select></label><label class="text-xs font-black text-slate-700">ŞİFRE *<input name="password" type="password" required minlength="10" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">ŞİFRE TEKRAR *<input name="repeat" type="password" required minlength="10" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"/></label><label class="text-xs font-black text-slate-700">HESAP DURUMU<select name="status" class="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"><option value="active">Aktif</option><option value="inactive">Pasif</option></select></label><label class="flex items-end gap-2 pb-3 text-xs font-bold text-slate-700"><input name="force" type="checkbox" checked/> İlk girişte şifre değişikliği zorunlu</label></div><button data-submit class="mt-5 rounded-xl bg-[#cd011e] px-5 py-3 text-xs font-black text-white">KULLANICI OLUŞTUR</button></form>`;
    const close = () => setNewUserOpen(false);
    modal.querySelector("[data-close]")?.addEventListener("click", close);
    modal.addEventListener("click", (e) => {
      if (e.target === modal) close();
    });
    const form = modal.querySelector("form")!;
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const password = String(fd.get("password") || "");
      const repeat = String(fd.get("repeat") || "");
      const error = modal.querySelector("[data-error]") as HTMLElement;
      if (password !== repeat) {
        error.textContent = "Şifre tekrarı eşleşmiyor.";
        error.classList.remove("hidden");
        return;
      }
      const button = modal.querySelector("[data-submit]") as HTMLButtonElement;
      button.disabled = true;
      button.textContent = "KULLANICI OLUŞTURULUYOR…";
      const { data, error: requestError } = await supabase.functions.invoke(
        "admin-users",
        {
          body: {
            action: "create_user",
            payload: {
              firstName: String(fd.get("firstName") || "").trim(),
              lastName: String(fd.get("lastName") || "").trim(),
              username: String(fd.get("username") || "")
                .trim()
                .toLowerCase()
                .replace(/\s/g, ""),
              email: String(fd.get("email") || "")
                .trim()
                .toLowerCase(),
              phone: String(fd.get("phone") || "").trim() || null,
              role: String(fd.get("role") || "advisor"),
              password,
              status: String(fd.get("status") || "active"),
              forcePasswordChange: fd.get("force") === "on",
            },
          },
        },
      );
      if (requestError || data?.error) {
        error.textContent =
          "Kullanıcı oluşturulamadı: " +
          (data?.error || requestError?.message || "Bilinmeyen hata");
        error.classList.remove("hidden");
        button.disabled = false;
        button.textContent = "KULLANICI OLUŞTUR";
        return;
      }
      close();
      void load();
      alert("Kullanıcı gerçek giriş hesabıyla oluşturuldu.");
    });
    document.body.appendChild(modal);
    return () => modal.remove();
  }, [newUserOpen]);
  const visible = useMemo(
    () =>
      profiles.filter((p) => {
        const q = (
          p.first_name +
          " " +
          p.last_name +
          " " +
          p.username +
          " " +
          p.email +
          " " +
          (p.phone || "")
        ).toLowerCase();
        return (
          (role === "all" || p.role === role) &&
          q.includes(search.toLowerCase())
        );
      }),
    [profiles, search, role],
  );
  const advisers = profiles.filter((p) => p.role === "advisor");
  const exportRows = () => {
    const map: Record<string, string> = {
      "Ad Soyad": "name",
      "Kullanıcı Adı": "username",
      "E-posta": "email",
      Rol: "roleName",
      Durum: "statusName",
      Telefon: "phone",
      "Son Giriş": "last_login_at",
      Oluşturulma: "created_at",
    };
    csv(
      "realty-center-kullanicilar",
      visible.map((p) => ({
        ...p,
        name: p.first_name + " " + p.last_name,
        roleName: roleName(p.role),
        statusName: statusName(p.status),
      })),
      fields.map((f) => map[f]),
    );
    setExporting(false);
    alert("Açık filtredeki kayıtlar Excel uyumlu olarak indirildi.");
  };
  const trash = async (p: Profile) => {
    const { error } = await supabase
      .from("profiles")
      .update({ deleted_at: new Date().toISOString(), status: "departed" })
      .eq("id", p.id);
    if (error) return alert(error.message);
    setProfiles((x) => x.filter((i) => i.id !== p.id));
    setDrawer(null);
    alert("Kullanıcı çöp kutusuna taşındı.");
  };
  const addOffice = () => {
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4";
    modal.innerHTML = `<form class="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-2xl"><div class="flex justify-between"><div><p class="text-[10px] font-black tracking-[.2em] text-[#cd011e]">REALTY CENTER</p><h2 class="mt-1 text-xl font-black">Yeni Ofis Ekle</h2></div><button type="button" data-close>✕</button></div><div class="mt-5 grid gap-3 md:grid-cols-2"><label class="text-xs font-black">Ofis adı *<input required name="name" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">Ofis sahibi / yönetici<input name="manager" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">İl *<input required name="city" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">İlçe *<input required name="district" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">Telefon<input name="phone" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">E-posta<input name="email" type="email" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black md:col-span-2">Açık adres<textarea name="address" class="mt-1 w-full rounded-xl border p-3"></textarea></label><label data-drop class="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#cd011e]/40 bg-red-50 text-xs font-black text-[#cd011e] md:col-span-2">Ofis görselini sürükleyip bırakın veya seçin<input name="image" type="file" accept="image/*" class="hidden"/></label></div><button class="mt-5 rounded-xl bg-[#cd011e] px-5 py-3 text-xs font-black text-white">OFİSİ KAYDET</button></form>`;
    const close = () => modal.remove();
    modal.querySelector("[data-close]")?.addEventListener("click", close);
    const zone = modal.querySelector("[data-drop]")!;
    const input = modal.querySelector("[name=image]") as HTMLInputElement;
    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("bg-red-100");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      input.files = e.dataTransfer?.files || null;
      zone.textContent = input.files?.[0]?.name || "Görsel seçildi";
    });
    modal.querySelector("form")!.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const image = fd.get("image") as File;
      const imageUrl = image?.size
        ? await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.readAsDataURL(image);
          })
        : null;
      const { error } = await supabase.from("offices").insert({
        name: String(fd.get("name")),
        city: String(fd.get("city")),
        district: String(fd.get("district")),
        address: String(fd.get("address") || ""),
        phone: String(fd.get("phone") || "") || null,
        email: String(fd.get("email") || "") || null,
        manager_name: String(fd.get("manager") || "") || null,
        image_url: imageUrl,
        status: "active",
      });
      if (error) {
        alert(error.message);
        return;
      }
      close();
      void load();
      alert("Ofis gerçek kayda eklendi ve yayına hazır.");
    });
    document.body.appendChild(modal);
  };
  const addOfficeWithOwner = () => {
    const options = advisers
      .map(
        (a) =>
          `<option value="${a.id}">${a.first_name} ${a.last_name}${a.phone ? " · " + a.phone : ""}</option>`,
      )
      .join("");
    const modal = document.createElement("div");
    modal.className =
      "fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4";
    modal.innerHTML = `<form class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl"><div class="flex justify-between"><div><p class="text-[10px] font-black tracking-[.2em] text-[#cd011e]">REALTY CENTER</p><h2 class="mt-1 text-xl font-black">Yeni Ofis Ekle</h2><p class="mt-1 text-sm text-slate-500">Sahibi danışmanlar arasından isim veya telefonla seçin.</p></div><button type="button" data-close>✕</button></div><div class="mt-5 grid gap-3 md:grid-cols-2"><label class="text-xs font-black">Ofis adı *<input required name="name" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">Ofis sahibi / yönetici<select name="owner" class="mt-1 w-full rounded-xl border p-3"><option value="">Atanmadı</option>${options}</select></label><label class="text-xs font-black">İl *<input required name="city" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">İlçe *<input required name="district" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">Telefon<input name="phone" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black">E-posta<input name="email" type="email" class="mt-1 w-full rounded-xl border p-3"/></label><label class="text-xs font-black md:col-span-2">Açık adres<textarea name="address" class="mt-1 w-full rounded-xl border p-3"></textarea></label><label data-drop class="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#cd011e]/40 bg-red-50 text-xs font-black text-[#cd011e] md:col-span-2">Ofis görselini sürükleyip bırakın veya seçin<input name="image" type="file" accept="image/*" class="hidden"/></label></div><button class="mt-5 rounded-xl bg-[#cd011e] px-5 py-3 text-xs font-black text-white">OFİSİ KAYDET</button></form>`;
    const close = () => modal.remove();
    modal.querySelector("[data-close]")?.addEventListener("click", close);
    const zone = modal.querySelector("[data-drop]")!;
    const input = modal.querySelector("[name=image]") as HTMLInputElement;
    zone.addEventListener("click", () => input.click());
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      zone.classList.add("bg-red-100");
    });
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      input.files = e.dataTransfer?.files || null;
      zone.textContent = input.files?.[0]?.name || "Görsel seçildi";
    });
    modal.querySelector("form")!.addEventListener("submit", async (e) => {
      e.preventDefault();
      const fd = new FormData(e.currentTarget as HTMLFormElement);
      const ownerId = String(fd.get("owner") || "");
      const owner = advisers.find((a) => a.id === ownerId);
      const image = fd.get("image") as File;
      const imageUrl = image?.size
        ? await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onload = () => resolve(String(r.result));
            r.readAsDataURL(image);
          })
        : null;
      const { data, error } = await supabase
        .from("offices")
        .insert({
          name: String(fd.get("name")),
          city: String(fd.get("city")),
          district: String(fd.get("district")),
          address: String(fd.get("address") || ""),
          phone: String(fd.get("phone") || "") || null,
          email: String(fd.get("email") || "") || null,
          owner_profile_id: ownerId || null,
          manager_name: owner ? owner.first_name + " " + owner.last_name : null,
          image_url: imageUrl,
          status: "active",
        })
        .select("id")
        .single();
      if (error) {
        alert(error.message);
        return;
      }
      if (ownerId && data)
        await supabase.from("office_advisors").upsert({
          office_id: data.id,
          advisor_id: ownerId,
          is_manager: true,
        });
      close();
      void load();
      alert("Ofis, sahibi ve görseli gerçek kayda eklendi.");
    });
    document.body.appendChild(modal);
  };
  const setStar = async (kind: "advisor" | "office", id: string) => {
    const { data, error } = await supabase.rpc("toggle_homepage_star", {
      p_kind: kind,
      p_entity_id: id,
    });
    if (error) {
      alert(error.message);
      return;
    }
    await load();
    alert(
      data
        ? "Ana sayfadaki Yıldızlarımız alanına eklendi."
        : "Danışman yıldızlardan çıkarıldı.",
    );
  };
  const addAdvisorToOffice = async (o: Office) => {
    const choices = advisers.filter(
      (a) =>
        !officeMembers.some(
          (m) => m.office_id === o.id && m.advisor_id === a.id,
        ),
    );
    const selected = window.prompt(
      "Eklenecek danışmanı seçin:\n" +
        choices
          .map(
            (a, i) =>
              `${i + 1}. ${a.first_name} ${a.last_name} ${a.phone || ""}`,
          )
          .join("\n"),
    );
    const i = Number(selected) - 1;
    if (!Number.isInteger(i) || !choices[i]) return;
    const { error } = await supabase.from("office_advisors").insert({
      office_id: o.id,
      advisor_id: choices[i].id,
      is_manager: false,
    });
    if (error) return alert(error.message);
    void load();
    alert("Danışman ofise eklendi.");
  };
  const heading = (title: string, desc: string, action?: React.ReactNode) => (
    <div className="mb-6 flex flex-col gap-4 border-b border-slate-200 pb-5 md:flex-row md:items-end md:justify-between">
      <div>
        <p className="text-[10px] font-black tracking-[.2em] text-[#cd011e]">
          REALTY CENTER / YÖNETİM
        </p>
        <h1 className="mt-1 text-2xl font-black text-slate-900">{title}</h1>
        <p className="mt-1 text-sm text-slate-500">{desc}</p>
      </div>
      {action}
    </div>
  );
  const button = (
    children: React.ReactNode,
    onClick?: () => void,
    primary = false,
  ) => (
    <button
      onClick={onClick}
      className={primary ? "rc-primary" : "rc-secondary"}
    >
      {children}
    </button>
  );
  const userTable = (data: Profile[], advisor = false) => (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[850px] text-left">
        <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
          <tr>
            <th className="p-4">{advisor ? "Danışman" : "Kullanıcı"}</th>
            <th className="p-4">İletişim</th>
            <th className="p-4">Rol / Durum</th>
            <th className="p-4">{advisor ? "Portföy / Puan" : "Son Giriş"}</th>
            <th className="p-4 text-right">İşlem</th>
          </tr>
        </thead>
        <tbody>
          {data.map((p) => (
            <tr
              key={p.id}
              className="border-t border-slate-100 text-sm hover:bg-slate-50"
            >
              <td className="p-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#cd011e]/10 font-black text-[#cd011e]">
                    {p.avatar_url ? (
                      <img
                        src={p.avatar_url}
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      (p.first_name[0] || "R") + (p.last_name[0] || "C")
                    )}
                  </span>
                  <div>
                    <b>
                      {p.first_name} {p.last_name}
                    </b>
                    <p className="text-xs text-slate-500">@{p.username}</p>
                  </div>
                </div>
              </td>
              <td className="p-4 text-xs text-slate-600">
                {p.email}
                <br />
                {p.phone || "Telefon yok"}
              </td>
              <td className="p-4 text-xs">
                <b>{roleName(p.role)}</b>
                <br />
                <span
                  className={
                    p.status === "active" ? "status-good" : "status-warn"
                  }
                >
                  {statusName(p.status)}
                </span>
              </td>
              <td className="p-4 text-xs text-slate-500">
                {advisor ? (
                  <>
                    0 ilan
                    <br />☆ Puan yok
                  </>
                ) : p.last_login_at ? (
                  new Date(p.last_login_at).toLocaleString("tr-TR")
                ) : (
                  "Henüz giriş yok"
                )}
              </td>
              <td className="p-4 text-right">
                {button("Görüntüle", () => setDrawer(p))}
              </td>
            </tr>
          ))}
          {!data.length && (
            <tr>
              <td
                colSpan={5}
                className="p-10 text-center text-sm text-slate-400"
              >
                Kayıt bulunmuyor.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
  let view: React.ReactNode;
  if (page === "user-create")
    return (
      <PanelFrame page={page} setPage={setPage}>
        <NewUserPage
          offices={offices}
          cancel={() => setPage("users")}
          done={() => {
            void load();
            setPage("users");
            alert("Kullanıcı başarıyla eklendi.");
          }}
        />
      </PanelFrame>
    );
  if (page === "users")
    return (
      <PanelFrame page={page} setPage={setPage}>
        <UsersPage
          profiles={profiles}
          offices={offices}
          create={() => setPage("user-create")}
          refresh={load}
        />
      </PanelFrame>
    );
  if (page === "advisors")
    return (
      <PanelFrame page={page} setPage={setPage}>
        <AdvisorsPageV2
          profiles={profiles}
          offices={offices}
          members={officeMembers}
          metrics={metrics}
          stars={stars}
          refresh={load}
          star={(id) => setStar("advisor", id)}
          trash={trash}
          create={() => setPage("user-create")}
        />
      </PanelFrame>
    );
  if (page === "overview")
    view = (
      <>
        <>
          {heading(
            "Genel Bakış",
            "Kullanıcı, ilan, başvuru ve içerik süreçlerinin tek merkezden özeti.",
          )}
        </>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Metric
            label="Toplam Kullanıcı"
            value={profiles.length}
            detail={`${advisers.length} danışman`}
            icon={Users}
          />
          <Metric
            label="Aktif Ofis"
            value={offices.length}
            detail="Yayındaki kayıtlar"
            icon={Building2}
          />
          <Metric
            label="Onay Bekleyen İlan"
            value="0"
            detail="İlan onay merkezi"
            icon={LayoutPanelTop}
          />
          <Metric
            label="Yeni Talep"
            value="0"
            detail="İletişim merkezi"
            icon={MessageSquare}
          />
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <Panel
            title="Hızlı İşlemler"
            actions={[
              ["Yeni kullanıcı oluştur", "users"],
              ["Ofis ekle", "offices"],
              ["İlan onay merkezi", "listings"],
              ["İletişim talepleri", "inbox"],
            ]}
            run={(x) => setPage(x as Page)}
          />
          <div className="rounded-2xl bg-slate-900 p-6 text-white">
            <ShieldCheck className="text-red-300" />
            <h2 className="mt-4 font-black">Sistem güvenliği</h2>
            <p className="mt-2 text-sm leading-6 text-slate-300">
              Kullanıcı, ilan, silme ve oturum hareketleri işlem kayıtları
              altında izlenir.
            </p>
            {button("İşlem kayıtlarını aç", () => setPage("logs"), true)}
          </div>
        </div>
      </>
    );
  else if (page === "users" || page === "advisors") {
    const advisor = page === "advisors";
    const rows = advisor
      ? visible.filter((p) => p.role === "advisor")
      : visible;
    view = (
      <>
        {heading(
          advisor ? "Danışman Yönetimi" : "Kullanıcılar",
          advisor
            ? "Profil, ofis, iletişim, mesaj ve yıldız seçimlerini gerçek kayıtlardan yönetin."
            : "Tüm hesapları rol, durum ve iletişim bilgileriyle yönetin.",
          <div className="flex gap-2">
            {button(
              <>
                <Download size={15} /> Excel’e Aktar
              </>,
              () =>
                advisor
                  ? csv(
                      "realty-center-danismanlar",
                      rows.map((p) => ({
                        ...p,
                        name: p.first_name + " " + p.last_name,
                        messages:
                          metrics.find((m) => m.advisor_id === p.id)
                            ?.messages_answered || 0,
                        rating:
                          metrics.find((m) => m.advisor_id === p.id)
                            ?.star_rating || 0,
                        office: offices
                          .filter((o) =>
                            officeMembers.some(
                              (m) =>
                                m.office_id === o.id && m.advisor_id === p.id,
                            ),
                          )
                          .map((o) => o.name)
                          .join(", "),
                      })),
                      [
                        "name",
                        "email",
                        "phone",
                        "messages",
                        "rating",
                        "office",
                      ],
                    )
                  : setExporting(true),
            )}
            {button(
              <>
                <Plus size={15} />
                {advisor ? "Danışman Ekle" : "Yeni Kullanıcı"}
              </>,
              () => setNewUserOpen(true),
              true,
            )}
          </div>,
        )}
        <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3">
            <Search size={17} className="text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full py-3 text-sm outline-none"
              placeholder="Ad, kullanıcı adı, e-posta veya telefon ara"
            />
          </label>
          {!advisor && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold"
            >
              <option value="all">Tüm roller</option>
              <option value="advisor">Danışman</option>
              <option value="manager">Yönetici</option>
              <option value="admin">Admin</option>
            </select>
          )}
          {button("Filtreyi temizle", () => {
            setSearch("");
            setRole(advisor ? "advisor" : "all");
          })}
        </div>
        {advisor && (
          <div className="mb-5 rounded-2xl border border-red-100 bg-red-50 p-4 text-sm">
            <b>REALTY CENTER Yıldızlarımız:</b> Ana sayfada gösterilecek en
            fazla 3 danışmanı seçin.{" "}
            {stars.filter((s) => s.kind === "advisor").length}/3 seçildi.
          </div>
        )}
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">{advisor ? "Danışman" : "Kullanıcı"}</th>
                <th className="p-4">İletişim / Ofis</th>
                <th className="p-4">Rol / Durum</th>
                <th className="p-4">
                  {advisor ? "Mesaj / Puan" : "Son Giriş"}
                </th>
                <th className="p-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const metric = metrics.find((m) => m.advisor_id === p.id);
                const officeNames = offices
                  .filter((o) =>
                    officeMembers.some(
                      (m) => m.office_id === o.id && m.advisor_id === p.id,
                    ),
                  )
                  .map((o) => o.name);
                return (
                  <tr key={p.id} className="border-t border-slate-100 text-sm">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#cd011e]/10 font-black text-[#cd011e]">
                          {p.avatar_url ? (
                            <img
                              src={p.avatar_url}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            (p.first_name[0] || "R") + (p.last_name[0] || "C")
                          )}
                        </span>
                        <div>
                          <b>
                            {p.first_name} {p.last_name}
                          </b>
                          <p className="text-xs text-slate-500">
                            @{p.username}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-xs">
                      {p.email}
                      <br />
                      {p.phone || "Telefon yok"}
                      {advisor && (
                        <p className="mt-1 font-bold text-[#cd011e]">
                          {officeNames.join(", ") || "Ofis atanmamış"}
                        </p>
                      )}
                    </td>
                    <td className="p-4 text-xs">
                      <b>{roleName(p.role)}</b>
                      <br />
                      <span
                        className={
                          p.status === "active" ? "status-good" : "status-warn"
                        }
                      >
                        {statusName(p.status)}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      {advisor ? (
                        <>
                          Yanıtlanan: {metric?.messages_answered || 0}
                          <br />★ {metric?.star_rating || 0}/5
                        </>
                      ) : p.last_login_at ? (
                        new Date(p.last_login_at).toLocaleString("tr-TR")
                      ) : (
                        "Henüz giriş yok"
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        {advisor &&
                          button(
                            stars.some(
                              (s) =>
                                s.kind === "advisor" && s.entity_id === p.id,
                            )
                              ? "Yıldızdan Çıkar"
                              : "Yıldızlara Ekle",
                            () => void setStar("advisor", p.id),
                          )}
                        {button("Görüntüle", () => setDrawer(p))}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === "offices") {
    const filtered = offices.filter(
      (o) =>
        (!search ||
          `${o.name} ${o.city} ${o.district}`
            .toLowerCase()
            .includes(search.toLowerCase())) &&
        (!officeCity || o.city === officeCity) &&
        (!officeDistrict || o.district === officeDistrict),
    );
    const cities = [...new Set(offices.map((o) => o.city))];
    const districts = [
      ...new Set(
        offices
          .filter((o) => !officeCity || o.city === officeCity)
          .map((o) => o.district),
      ),
    ];
    view = (
      <>
        {heading(
          "Ofis Yönetimi",
          "Ofisleri il, ilçe, sahip ve sınırsız danışman atamasıyla yönetin.",
          <div className="flex gap-2">
            {button(
              <>
                <Download size={15} /> Excel’e Aktar
              </>,
              () =>
                csv("realty-center-ofisler", filtered as any, [
                  "name",
                  "city",
                  "district",
                  "address",
                  "phone",
                  "email",
                  "manager_name",
                ]),
            )}
            {button(
              <>
                <Plus size={15} /> Ofis Ekle
              </>,
              () => setShowOfficeCreate(true),
              true,
            )}
          </div>,
        )}
        <div className="mb-5 grid gap-3 md:grid-cols-3">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
            placeholder="Ofis adı ara"
          />
          <select
            value={officeCity}
            onChange={(e) => {
              setOfficeCity(e.target.value);
              setOfficeDistrict("");
            }}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm iller</option>
            {cities.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
          <select
            value={officeDistrict}
            onChange={(e) => setOfficeDistrict(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm"
          >
            <option value="">Tüm ilçeler</option>
            {districts.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <section className="mb-5 overflow-hidden rounded-2xl bg-[#cd011e] p-5 text-white shadow-lg shadow-red-700/15">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black tracking-[.2em] text-white/75">
                REALTY CENTER YILDIZ OFİSLERİ
              </p>
              <h2 className="mt-1 text-base font-black">
                Ana sayfada gösterilen seçili ofisler
              </h2>
            </div>
            <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-black">
              {stars.filter((s) => s.kind === "office").length}/3 seçildi
            </span>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {stars
              .filter((s) => s.kind === "office")
              .map((s) => offices.find((o) => o.id === s.entity_id))
              .filter(Boolean)
              .map((o: any) => {
                const staff = officeMembers
                  .filter((m) => m.office_id === o.id)
                  .map((m) => advisers.find((a) => a.id === m.advisor_id))
                  .filter(Boolean) as Profile[];
                return (
                  <button
                    key={o.id}
                    onClick={() => setOfficeDrawer(o)}
                    className="group flex items-center gap-3 rounded-xl border border-white/25 bg-white/10 p-3 text-left transition hover:bg-white hover:text-[#cd011e]"
                  >
                    {o.image_url ? (
                      <img
                        src={o.image_url}
                        className="h-14 w-14 rounded-xl object-cover"
                      />
                    ) : (
                      <span className="grid h-14 w-14 place-items-center rounded-xl bg-white/15">
                        <Building2 size={22} />
                      </span>
                    )}
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm">★ {o.name}</b>
                      <small className="mt-1 block text-[11px] opacity-75">
                        {o.city} / {o.district}
                      </small>
                      <small className="block text-[10px] opacity-70">
                        {o.manager_name || "Lider atanmadı"} · {staff.length}{" "}
                        danışman
                      </small>
                    </span>
                  </button>
                );
              })}
            {!stars.some((s) => s.kind === "office") && (
              <p className="py-3 text-sm text-red-100">
                Henüz yıldız ofis seçilmedi.
              </p>
            )}
          </div>
        </section>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[1050px] text-left">
            <thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500">
              <tr>
                <th className="p-4">Ofis</th>
                <th className="p-4">Konum / İletişim</th>
                <th className="p-4">Ofis Lideri</th>
                <th className="p-4">Danışmanlar</th>
                <th className="p-4 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const team = officeMembers
                  .filter((m) => m.office_id === o.id)
                  .map((m) => advisers.find((a) => a.id === m.advisor_id))
                  .filter(Boolean) as Profile[];
                const count = team.length;
                return (
                  <tr key={o.id} className="border-t text-sm hover:bg-slate-50">
                    <td className="p-4">
                      <button
                        onClick={() => setOfficeDrawer(o)}
                        className="flex items-center gap-3 text-left"
                      >
                        {o.image_url ? (
                          <img
                            src={o.image_url}
                            className="h-10 w-10 rounded-xl object-cover"
                          />
                        ) : (
                          <span className="grid h-10 w-10 place-items-center rounded-xl bg-red-50 text-[#cd011e]">
                            <Building2 size={18} />
                          </span>
                        )}
                        <span>
                          <b className="block">{o.name}</b>
                          <small className="text-slate-400">
                            {count} danışman
                          </small>
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-xs">
                      <b>
                        {o.city} / {o.district}
                      </b>
                      <br />
                      <span className="text-slate-400">
                        {o.phone || "Telefon yok"} · {o.email || "E-posta yok"}
                      </span>
                    </td>
                    <td className="p-4 text-xs">
                      <b>{o.manager_name || "Atanmadı"}</b>
                      <br />
                      <span className="text-slate-400">Ofis lideri</span>
                    </td>
                    <td className="p-4">
                      <div className="flex -space-x-2">
                        {team.slice(0, 5).map((p) =>
                          p.avatar_url ? (
                            <img
                              key={p.id}
                              title={p.first_name + " " + p.last_name}
                              src={p.avatar_url}
                              className="h-8 w-8 rounded-full border-2 border-white object-cover"
                            />
                          ) : (
                            <span
                              key={p.id}
                              title={p.first_name + " " + p.last_name}
                              className="grid h-8 w-8 place-items-center rounded-full border-2 border-white bg-slate-200 text-[10px] font-black"
                            >
                              {p.first_name[0]}
                              {p.last_name[0]}
                            </span>
                          ),
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => void addAdvisorToOffice(o)}
                          className="rounded-lg bg-slate-700 px-3 py-2 text-xs font-black text-white"
                        >
                          Danışman Ata
                        </button>
                        <button
                          onClick={() => void setStar("office", o.id)}
                          className="rounded-lg bg-[#cd011e] px-3 py-2 text-xs font-black text-white"
                        >
                          {stars.some(
                            (s) => s.kind === "office" && s.entity_id === o.id,
                          )
                            ? "★ Çıkar"
                            : "☆ Yıldızlara Ekle"}
                        </button>
                        <button
                          onClick={() => setOfficeDrawer(o)}
                          className="rounded-lg bg-slate-200 px-3 py-2 text-xs font-black"
                        >
                          Görüntüle / Düzenle
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Ofis çöp kutusuna taşınsın mı?"))
                              void supabase
                                .from("offices")
                                .update({
                                  deleted_at: new Date().toISOString(),
                                })
                                .eq("id", o.id)
                                .then(() => load());
                          }}
                          className="rounded-lg bg-rose-600 px-3 py-2 text-xs font-black text-white"
                        >
                          Çöp Kutusu
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </>
    );
  } else if (page === "listings")
    view = (
      <>
        {heading(
          "İlan Yönetimi",
          "Kapsamlı ilan girişi, ilan onayı ve vitrinde öne çıkarma.",
        )}
        <div className="mb-5 flex gap-2">
          {(["all", "approval", "add"] as const).map((k) =>
            button(
              k === "all"
                ? "Tüm İlanlar"
                : k === "approval"
                  ? "İlan Onay Merkezi"
                  : "İlan Ekle",
              () => setListingMode(k),
              listingMode === k,
            ),
          )}
        </div>
        {listingMode === "add" ? (
          <ListingEntryPage profiles={profiles} alert={alert} close={() => setListingMode("all")} />
        ) : (
          <ListingForm
            alert={alert}
            profiles={profiles}
            mode={listingMode}
            setMode={setListingMode}
          />
        )}
      </>
    );
  else view = <FeaturePage title={titleOf(page)} page={page} />;
  return (
    <div className="min-h-screen bg-[#f6f7f9] text-slate-900">
      <style>{`.rc-primary,.rc-secondary{display:inline-flex;align-items:center;justify-content:center;gap:.45rem;border-radius:.75rem;padding:.7rem .9rem;font-size:.75rem;font-weight:800}.rc-primary{background:#cd011e;color:white}.rc-secondary{border:1px solid #e2e8f0;background:white;color:#475569}.status-good,.status-warn{display:inline-block;margin-top:.3rem;border-radius:999px;padding:.15rem .45rem;font-size:10px;font-weight:800}.status-good{background:#d1fae5;color:#047857}.status-warn{background:#fef3c7;color:#a16207}`}</style>
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-slate-200 bg-white transition-transform lg:translate-x-0 ${mobile ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-slate-100 px-6">
          <div>
            <p className="text-xs font-black tracking-[.2em] text-[#cd011e]">
              REALTY CENTER
            </p>
            <p className="mt-1 text-lg font-black">Admin Paneli</p>
          </div>
          <button onClick={() => setMobile(false)} className="lg:hidden">
            <X />
          </button>
        </div>
        <nav className="h-[calc(100vh-76px)] overflow-y-auto p-4">
          {groups.map((g) => (
            <div key={g.title} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-black tracking-wider text-slate-400">
                {g.title}
              </p>
              {g.items.map((i) => {
                const Icon = i.icon;
                return (
                  <button
                    key={i.id}
                    onClick={() => {
                      setPage(i.id);
                      setMobile(false);
                    }}
                    className={`mb-1 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-bold ${page === i.id ? "bg-[#cd011e] text-white" : "text-slate-600 hover:bg-slate-50"}`}
                  >
                    <Icon size={18} />
                    {i.label}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>
      <main className="min-h-screen lg:pl-72">
        <header className="flex h-[76px] items-center justify-between border-b border-slate-200 bg-white px-5 lg:px-8">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobile(true)} className="lg:hidden">
              <Menu />
            </button>
            <div>
              <b className="text-sm">{titleOf(page)}</b>
              <p className="text-[11px] text-slate-400">Yönetim paneli</p>
            </div>
          </div>
          <button
            onClick={() => void load()}
            className="rounded-lg border border-slate-200 p-2 text-slate-500"
          >
            <ArchiveRestore size={17} />
          </button>
        </header>
        <section className="p-5 lg:p-8">{view}</section>
      </main>
      {notice && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl bg-slate-900 px-5 py-3 text-sm font-bold text-white">
          {notice}
        </div>
      )}
      {drawer && (
        <UserDrawer
          profile={drawer}
          close={() => setDrawer(null)}
          trash={() => void trash(drawer)}
        />
      )}{" "}
      {officeDrawer && (
        <OfficeDrawer
          office={officeDrawer}
          profiles={profiles}
          members={officeMembers}
          close={() => setOfficeDrawer(null)}
          done={load}
        />
      )}
      {showOfficeCreate && (
        <NewOfficeModal
          advisers={advisers}
          close={() => setShowOfficeCreate(false)}
          done={load}
        />
      )}
      {exporting && (
        <Export
          fields={fields}
          setFields={setFields}
          close={() => setExporting(false)}
          submit={exportRows}
        />
      )}
    </div>
  );
}

function UserEditPage({
  profile,
  cancel,
  done,
}: {
  profile: Profile;
  cancel: () => void;
  done: () => void | Promise<void>;
}) {
  const [f, setF] = useState({
    first_name: profile.first_name,
    last_name: profile.last_name,
    username: profile.username,
    email: profile.email,
    phone: profile.phone || "",
    role: profile.role,
    status: profile.status,
    avatar_url: profile.avatar_url || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k: string, v: string) => setF((x) => ({ ...x, [k]: v }));
  const pick = (file?: File) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => set("avatar_url", String(r.result));
    r.readAsDataURL(file);
  };
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        ...f,
        username: f.username.trim().toLowerCase().replace(/\\s/g, ""),
        email: f.email.trim().toLowerCase(),
        phone: f.phone || null,
      })
      .eq("id", profile.id);
    setBusy(false);
    if (error) return window.alert(error.message);
    await done();
  };
  return (
    <div className="min-h-screen bg-[#f7f9fc] p-5 text-slate-900 lg:p-9">
      <div className="mx-auto max-w-6xl">
        <p className="text-[10px] font-black tracking-[.2em] text-[#cd011e]">
          REALTY CENTER / KULLANICI YÖNETİMİ
        </p>
        <h1 className="mt-2 text-3xl font-black">
          Kullanıcı Bilgilerini Düzenle
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Profil, iletişim ve hesap yetkilerini bu ekrandan güncelleyin.
        </p>
        <form
          onSubmit={save}
          className="mt-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-7"
        >
          <div className="grid gap-8 lg:grid-cols-[330px_1fr]">
            <section className="border-b border-slate-100 pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
              <h2 className="text-base font-black">Profil Fotoğrafı</h2>
              <label className="mt-5 flex h-60 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-[#cd011e]">
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => pick(e.target.files?.[0])}
                />
                {f.avatar_url ? (
                  <img
                    src={f.avatar_url}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="grid h-28 w-28 place-items-center rounded-full bg-red-50 text-3xl font-black text-[#cd011e]">
                    {profile.first_name[0]}
                    {profile.last_name[0]}
                  </span>
                )}
                <b className="mt-4 text-sm">Profil resmini değiştir</b>
                <span className="mt-1 text-xs text-slate-400">
                  Dosya seçmek için tıklayın
                </span>
              </label>
            </section>
            <section>
              <h2 className="text-base font-black">Temel Bilgiler</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["first_name", "Ad *"],
                  ["last_name", "Soyad *"],
                  ["username", "Kullanıcı Adı *"],
                  ["email", "E-Posta *"],
                  ["phone", "Telefon"],
                ].map(([key, label]) => (
                  <label key={key} className="text-xs font-bold text-slate-700">
                    {label}
                    <input
                      required={key !== "phone"}
                      type={key === "email" ? "email" : "text"}
                      value={(f as any)[key]}
                      onChange={(e) => set(key, e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#cd011e]"
                    />
                  </label>
                ))}
              </div>
              <div className="mt-7 border-t border-slate-100 pt-6">
                <h2 className="text-base font-black">Yetki ve Hesap</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-bold">
                    Rol
                    <select
                      value={f.role}
                      onChange={(e) => set("role", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    >
                      <option value="advisor">Danışman</option>
                      <option value="manager">Yönetici</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Hesap Durumu
                    <select
                      value={f.status}
                      onChange={(e) => set("status", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                      <option value="suspended">Askıya alındı</option>
                      <option value="departed">Ayrıldı</option>
                    </select>
                  </label>
                </div>
              </div>
            </section>
          </div>
          <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={cancel}
              className="tap rounded-xl border border-slate-200 px-5 py-3 text-xs font-black"
            >
              İptal
            </button>
            <button
              disabled={busy}
              className="tap rounded-xl bg-[#cd011e] px-6 py-3 text-xs font-black text-white disabled:opacity-60"
            >
              {busy ? "Kaydediliyor…" : "Değişiklikleri Kaydet"}
            </button>
          </div>
        </form>
      </div>
      {busy && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35">
          <div className="rounded-2xl bg-white p-8 text-center shadow-2xl">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#cd011e]" />
            <h2 className="mt-5 font-black">Kullanıcı güncelleniyor</h2>
          </div>
        </div>
      )}
    </div>
  );
}
function NewUserPage({
  offices,
  cancel,
  done,
}: {
  offices: Office[];
  cancel: () => void;
  done: () => void;
}) {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    city: "",
    district: "",
    role: "advisor",
    status: "active",
    password: "",
    repeat: "",
    force: true,
  });
  const [avatar, setAvatar] = useState("");
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const update = (key: string, value: string | boolean) =>
    setForm((x) => ({ ...x, [key]: value }));
  const file = (f?: File) => {
    if (!f) return;
    const r = new FileReader();
    r.onload = () => setAvatar(String(r.result));
    r.readAsDataURL(f);
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.repeat)
      return setError("Şifre tekrarı eşleşmiyor.");
    setBusy(true);
    const { data, error: requestError } = await supabase.functions.invoke(
      "admin-users",
      {
        body: {
          action: "create_user",
          payload: {
            firstName: form.firstName.trim(),
            lastName: form.lastName.trim(),
            username: form.username.trim().toLowerCase().replace(/\s/g, ""),
            email: form.email.trim().toLowerCase(),
            phone: form.phone.trim() || null,
            role: form.role,
            password: form.password,
            status: form.status,
            forcePasswordChange: form.force,
            avatarUrl: avatar || null,
            expertiseAreas: [form.city, form.district].filter(Boolean),
          },
        },
      },
    );
    setBusy(false);
    if (requestError || data?.error)
      return setError(
        data?.error || requestError?.message || "Kullanıcı oluşturulamadı.",
      );
    setSuccess(true);
    setTimeout(done, 1600);
  };
  return (
    <div className="min-h-screen bg-[#f7f9fc] p-5 text-slate-900 lg:p-9">
      <div className="mx-auto max-w-6xl">
        <button onClick={cancel} className="hidden">
          ← Kullanıcılara dön
        </button>
        <h1 className="text-3xl font-black tracking-tight">
          Yeni Kullanıcı Ekle
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kullanıcı hesabı ve yetki bilgilerini tanımlayın.
        </p>
        <form
          onSubmit={submit}
          className="mt-7 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm lg:p-7"
        >
          <div className="grid gap-8 lg:grid-cols-[330px_1fr]">
            <section className="border-b border-slate-100 pb-7 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-8">
              <h2 className="text-base font-black">Profil Fotoğrafı</h2>
              <p className="mt-1 text-xs text-slate-400">
                JPG veya PNG, en fazla 5 MB.
              </p>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  file(e.dataTransfer.files[0]);
                }}
                className="mt-5 flex h-60 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 text-center hover:border-[#cd011e]"
              >
                <input
                  className="hidden"
                  type="file"
                  accept="image/*"
                  onChange={(e) => file(e.target.files?.[0])}
                />
                {avatar ? (
                  <img
                    src={avatar}
                    className="h-32 w-32 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-200 text-3xl text-slate-400">
                    ◉
                  </span>
                )}
                <b className="mt-4 text-sm">Profil resmi yükle</b>
                <span className="mt-1 text-xs text-slate-400">
                  Sürükle bırak veya dosya seç
                </span>
              </label>
            </section>
            <section>
              <h2 className="text-base font-black">Temel Bilgiler</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {[
                  ["firstName", "Ad *", "Adınızı girin"],
                  ["lastName", "Soyad *", "Soyadınızı girin"],
                  ["username", "Kullanıcı Adı *", "Kullanıcı adını girin"],
                  ["email", "E-Posta *", "ornek@realtycenter.com"],
                  ["phone", "Telefon", "(554) 322 22 22"],
                ].map(([key, label, placeholder]) => (
                  <label key={key} className="text-xs font-bold text-slate-700">
                    {label}
                    <input
                      required={key !== "phone"}
                      type={key === "email" ? "email" : "text"}
                      value={(form as any)[key]}
                      onChange={(e) => update(key, e.target.value)}
                      placeholder={placeholder}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm outline-none focus:border-[#cd011e]"
                    />
                  </label>
                ))}
                <label className="text-xs font-bold text-slate-700">
                  İl
                  <select
                    value={form.city}
                    onChange={(e) => update("city", e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  >
                    <option value="">İl seçin</option>
                    {[...new Set(offices.map((o) => o.city))].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
                <label className="text-xs font-bold text-slate-700">
                  İlçe
                  <select
                    value={form.district}
                    onChange={(e) => update("district", e.target.value)}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                  >
                    <option value="">İlçe seçin</option>
                    {[
                      ...new Set(
                        offices
                          .filter((o) => !form.city || o.city === form.city)
                          .map((o) => o.district),
                      ),
                    ].map((x) => (
                      <option key={x}>{x}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="mt-7 border-t border-slate-100 pt-6">
                <h2 className="text-base font-black">Yetki ve Hesap</h2>
                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  <label className="text-xs font-bold">
                    Rol *
                    <select
                      value={form.role}
                      onChange={(e) => update("role", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    >
                      <option value="advisor">Danışman</option>
                      <option value="manager">Yönetici</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Hesap Durumu
                    <select
                      value={form.status}
                      onChange={(e) => update("status", e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                    </select>
                  </label>
                  <label className="text-xs font-bold">
                    Şifre *
                    <input
                      required
                      type="password"
                      minLength={10}
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      placeholder="En az 10 karakter"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    />
                  </label>
                  <label className="text-xs font-bold">
                    Şifre Tekrar *
                    <input
                      required
                      type="password"
                      minLength={10}
                      value={form.repeat}
                      onChange={(e) => update("repeat", e.target.value)}
                      placeholder="Şifrenizi tekrar girin"
                      className="mt-1.5 w-full rounded-xl border border-slate-200 px-3 py-3 text-sm"
                    />
                  </label>
                </div>
                <label className="mt-5 flex items-center gap-2 text-xs font-bold">
                  <input
                    checked={form.force}
                    onChange={(e) => update("force", e.target.checked)}
                    type="checkbox"
                  />{" "}
                  İlk girişte şifre değişikliği zorunlu
                </label>
              </div>
            </section>
          </div>
          {error && (
            <p className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {error}
            </p>
          )}
          <div className="mt-7 flex justify-end gap-3 border-t border-slate-100 pt-5">
            <button
              type="button"
              onClick={cancel}
              className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black"
            >
              İptal
            </button>
            <button
              disabled={busy}
              className="rounded-xl bg-[#cd011e] px-6 py-3 text-xs font-black text-white disabled:opacity-60"
            >
              {busy ? "Kullanıcı oluşturuluyor…" : "Kullanıcı Oluştur"}
            </button>
          </div>
        </form>
      </div>
      {(busy || success) && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-8 text-center shadow-2xl">
            {success ? (
              <>
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
                  ✓
                </div>
                <h2 className="mt-4 text-xl font-black">
                  Kullanıcı başarıyla eklendi
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Kullanıcı listesine yönlendiriliyorsunuz.
                </p>
              </>
            ) : (
              <>
                <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-[#cd011e]" />
                <h2 className="mt-5 font-black">Kullanıcı oluşturuluyor</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Hesap güvenle hazırlanıyor.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
function Metric({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  icon: any;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex justify-between">
        <div>
          <p className="text-[10px] font-black tracking-wider text-slate-400">
            {label}
          </p>
          <b className="mt-2 block text-3xl">{value}</b>
          <p className="mt-1 text-xs text-slate-500">{detail}</p>
        </div>
        <Icon className="text-[#cd011e]" />
      </div>
    </div>
  );
}
function Panel({
  title,
  actions,
  run,
}: {
  title: string;
  actions: string[][];
  run: (s: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="font-black">{title}</h2>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {actions.map((a) => (
          <button
            key={a[0]}
            onClick={() => run(a[1])}
            className="flex items-center justify-between rounded-xl border border-slate-200 p-4 text-left text-sm font-bold hover:border-[#cd011e]"
          >
            {a[0]}
            <ChevronRight size={16} />
          </button>
        ))}
      </div>
    </div>
  );
}
type ListingRow = {
  id: string; owner_id: string; title: string; category: string; property_type: string;
  transaction_type: string; price: number; currency: string; city: string; district: string;
  neighborhood?: string | null; rooms?: string | null; area: number; images?: string[] | null;
  approval_status?: string | null; is_featured?: boolean | null; created_at: string;
};

const listingCities = TURKEY_PROVINCES;
const listingDistricts: Record<string, string[]> = Object.fromEntries(listingCities.map((city) => [city, getTurkeyDistricts(city)]));
const listingInput = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-[#cd011e] focus:ring-2 focus:ring-[#cd011e]/10";

function ListingEntryPage({ profiles, alert, close }: { profiles: Profile[]; alert: (text: string) => void; close: () => void }) {
  const advisors = profiles.filter((profile) => profile.role === "advisor" || profile.role === "manager");
  const [viewerRole, setViewerRole] = useState("admin");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploaded, setUploaded] = useState<{ url: string; type: string }[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: "", advisor: "", transaction_type: "Satılık", category: "Konut", property_type: "Daire", price: "", currency: "₺", city: "", district: "", neighborhood: "", rooms: "", gross: "", net: "", floor: "", total_floors: "", building_age: "", heating: "", parking: "", credit: "", deed: "", furnished: "", occupancy: "", bathrooms: "", balcony: "", elevator: "", site: "", dues: "", description: "", video_url: "", virtual_tour_url: "" });
  const districts = form.city ? getTurkeyDistricts(form.city) : [];
  const directPublish = viewerRole === "admin" || viewerRole === "manager";
  const options = (values: string[]) => values.map((value) => <option key={value} value={value}>{value}</option>);

  useEffect(() => {
    void (async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return;
      const { data } = await supabase.from("profiles").select("role").eq("id", auth.user.id).maybeSingle();
      if (data?.role) setViewerRole(data.role);
    })();
  }, []);

  const chooseFiles = (files: FileList | null) => setSelectedFiles(Array.from(files || []).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/")).slice(0, 16));
  const uploadFiles = async () => {
    if (!selectedFiles.length) return alert("Önce fotoğraf veya video seçin.");
    setUploading(true);
    try {
      const additions: { url: string; type: string }[] = [];
      for (const file of selectedFiles) {
        const fileName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-");
        const path = `listings/${Date.now()}-${crypto.randomUUID()}-${fileName}`;
        const { error } = await supabase.storage.from("listing-media").upload(path, file, { upsert: false });
        if (error) throw error;
        additions.push({ url: supabase.storage.from("listing-media").getPublicUrl(path).data.publicUrl, type: file.type });
      }
      setUploaded((current) => [...current, ...additions]);
      setSelectedFiles([]);
      alert(`${additions.length} dosya ilan medyasına eklendi.`);
    } catch (error: any) {
      alert(`Dosyalar eklenemedi: ${error.message || "Tekrar deneyin."}`);
    } finally { setUploading(false); }
  };
  const addMarkup = (prefix: string, suffix = "") => setForm((current) => ({ ...current, description: `${current.description}${current.description ? "\n" : ""}${prefix}${suffix}` }));
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.title || !form.price || !form.city || !form.district || !form.neighborhood || !form.advisor) return alert("Başlık, danışman, fiyat, il, ilçe ve mahalle zorunludur.");
    setSaving(true);
    try {
      const details = { gross_sqm: form.gross, net_sqm: form.net, floor: form.floor, total_floors: form.total_floors, building_age: form.building_age, heating: form.heating, parking: form.parking, credit: form.credit, deed: form.deed, furnished: form.furnished, occupancy: form.occupancy, bathrooms: form.bathrooms, balcony: form.balcony, elevator: form.elevator, site: form.site, dues: form.dues };
      const { error } = await supabase.from("listings").insert({ owner_id: form.advisor, title: form.title, category: form.category, property_type: form.property_type, transaction_type: form.transaction_type, price: Number(form.price.replaceAll(".", "")), currency: form.currency, city: form.city, district: form.district, neighborhood: form.neighborhood, rooms: form.rooms || null, area: Number(form.gross || form.net || 0), description: form.description || null, images: uploaded.filter((item) => item.type.startsWith("image/")).map((item) => item.url), video_url: form.video_url || uploaded.find((item) => item.type.startsWith("video/"))?.url || null, virtual_tour_url: form.virtual_tour_url || null, details, approval_status: directPublish ? "approved" : "pending", is_featured: false });
      if (error) throw error;
      alert(directPublish ? "İlan doğrudan yayına alındı." : "İlan onay merkezine gönderildi.");
      close();
    } catch (error: any) {
      alert(`İlan kaydedilemedi: ${error.message || "Tekrar deneyin."}`);
    } finally { setSaving(false); }
  };

  return <form onSubmit={submit} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <header className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">İLAN YÖNETİMİ / YENİ İLAN</p><h2 className="mt-1 text-xl font-black">Detaylı ilan girişi</h2><p className="mt-1 text-sm text-slate-500">{directPublish ? "Bu rol ile eklenen ilanlar doğrudan yayınlanır." : "Danışman ilanları onay merkezine gönderilir."}</p></div><button type="button" onClick={close} className="rc-secondary">Listeye dön</button></header>
    <div className="space-y-8 p-6">
      <section><h3 className="font-black">Temel bilgiler</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><label className="text-xs font-black">İlan başlığı *<input required className={listingInput} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></label><label className="text-xs font-black">Ekleyen danışman *<select required className={listingInput} value={form.advisor} onChange={(e) => setForm({ ...form, advisor: e.target.value })}><option value="">Danışman seçiniz</option>{advisors.map((advisor) => <option key={advisor.id} value={advisor.id}>{advisor.first_name} {advisor.last_name} · {advisor.phone || advisor.email}</option>)}</select></label><label className="text-xs font-black">İşlem tipi *<select className={listingInput} value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })}>{options(["Satılık", "Kiralık", "Devren Satılık", "Devren Kiralık"])}</select></label><label className="text-xs font-black">Ana kategori *<select className={listingInput} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{options(["Konut", "Arsa", "İşyeri", "Turistik Tesis"])}</select></label><label className="text-xs font-black">İlan türü *<select className={listingInput} value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })}>{options(["Daire", "Villa", "Müstakil Ev", "Arsa", "Tarla", "Ofis", "Dükkan", "Depo", "Otel", "Bina"])}</select></label><label className="text-xs font-black">Oda sayısı<select className={listingInput} value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })}><option value="">Belirtilmemiş</option>{options(["1+0", "1+1", "2+1", "3+1", "4+1", "5+1", "5+2", "6+1 ve üzeri"])}</select></label></div></section>
      <section className="border-t border-slate-100 pt-7"><h3 className="font-black">Fiyat ve seçilebilir konum</h3><p className="mt-1 text-xs text-slate-500">İl ve ilçe listeleri 81 il / 973 ilçe verisiyle bağlıdır.</p><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3"><label className="text-xs font-black">Fiyat *<input required inputMode="numeric" className={listingInput} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") })} placeholder="0" /></label><label className="text-xs font-black">Para birimi<select className={listingInput} value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })}>{options(["₺", "USD", "EUR", "GBP"])}</select></label><label className="text-xs font-black">İl *<select required className={listingInput} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, district: "", neighborhood: "" })}><option value="">İl seçiniz</option>{options(TURKEY_PROVINCES)}</select></label><label className="text-xs font-black">İlçe *<select required disabled={!form.city} className={listingInput} value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value, neighborhood: "" })}><option value="">İlçe seçiniz</option>{options(districts)}</select></label><label className="text-xs font-black">Mahalle *<input required list="listing-neighborhoods" disabled={!form.district} className={listingInput} value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} placeholder="Mahalle ara veya seç" /><datalist id="listing-neighborhoods"><option value="Merkez Mahallesi" /><option value="Yeni Mahalle" /><option value="Cumhuriyet Mahallesi" /></datalist></label><label className="text-xs font-black">Aylık aidat<input inputMode="numeric" className={listingInput} value={form.dues} onChange={(e) => setForm({ ...form, dues: e.target.value })} /></label></div></section>
      <section className="border-t border-slate-100 pt-7"><h3 className="font-black">İlan detayları</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4"><label className="text-xs font-black">Brüt m²<input inputMode="numeric" className={listingInput} value={form.gross} onChange={(e) => setForm({ ...form, gross: e.target.value })} /></label><label className="text-xs font-black">Net m²<input inputMode="numeric" className={listingInput} value={form.net} onChange={(e) => setForm({ ...form, net: e.target.value })} /></label><label className="text-xs font-black">Bulunduğu kat<select className={listingInput} value={form.floor} onChange={(e) => setForm({ ...form, floor: e.target.value })}><option value="">Seçiniz</option>{options(["Bodrum", "Zemin", "Yüksek giriş", ...Array.from({ length: 30 }, (_, i) => String(i + 1))])}</select></label><label className="text-xs font-black">Toplam kat<select className={listingInput} value={form.total_floors} onChange={(e) => setForm({ ...form, total_floors: e.target.value })}><option value="">Seçiniz</option>{options(Array.from({ length: 40 }, (_, i) => String(i + 1)))}</select></label><label className="text-xs font-black">Bina yaşı<select className={listingInput} value={form.building_age} onChange={(e) => setForm({ ...form, building_age: e.target.value })}><option value="">Seçiniz</option>{options(["0", "1-5", "6-10", "11-15", "16-20", "21-25", "26-30", "31 ve üzeri"])}</select></label><label className="text-xs font-black">Isıtma<select className={listingInput} value={form.heating} onChange={(e) => setForm({ ...form, heating: e.target.value })}><option value="">Seçiniz</option>{options(["Kombi (Doğalgaz)", "Merkezi", "Merkezi (Pay Ölçer)", "Yerden Isıtma", "Klima", "Soba", "Elektrikli", "Güneş Enerjisi", "Yok"])}</select></label><label className="text-xs font-black">Otopark<select className={listingInput} value={form.parking} onChange={(e) => setForm({ ...form, parking: e.target.value })}><option value="">Seçiniz</option>{options(["Açık Otopark", "Kapalı Otopark", "Açık ve Kapalı", "Yok"])}</select></label><label className="text-xs font-black">Kredi durumu<select className={listingInput} value={form.credit} onChange={(e) => setForm({ ...form, credit: e.target.value })}><option value="">Seçiniz</option>{options(["Krediye Uygun", "Krediye Uygun Değil", "Bilinmiyor"])}</select></label><label className="text-xs font-black">Tapu durumu<select className={listingInput} value={form.deed} onChange={(e) => setForm({ ...form, deed: e.target.value })}><option value="">Seçiniz</option>{options(["Kat Mülkiyeti", "Kat İrtifakı", "Hisseli Tapu", "Arsa Tapulu", "Tapu Yok"])}</select></label><label className="text-xs font-black">Eşyalı mı?<select className={listingInput} value={form.furnished} onChange={(e) => setForm({ ...form, furnished: e.target.value })}><option value="">Seçiniz</option>{options(["Evet", "Hayır", "Kısmen"])}</select></label><label className="text-xs font-black">Kullanım durumu<select className={listingInput} value={form.occupancy} onChange={(e) => setForm({ ...form, occupancy: e.target.value })}><option value="">Seçiniz</option>{options(["Boş", "Kiracılı", "Mal sahibi oturuyor", "Yapım aşamasında"])}</select></label><label className="text-xs font-black">Banyo sayısı<select className={listingInput} value={form.bathrooms} onChange={(e) => setForm({ ...form, bathrooms: e.target.value })}><option value="">Seçiniz</option>{options(["1", "2", "3", "4 ve üzeri"])}</select></label><label className="text-xs font-black">Balkon<select className={listingInput} value={form.balcony} onChange={(e) => setForm({ ...form, balcony: e.target.value })}><option value="">Seçiniz</option>{options(["Var", "Yok", "Fransız balkon", "Teras"])}</select></label><label className="text-xs font-black">Asansör<select className={listingInput} value={form.elevator} onChange={(e) => setForm({ ...form, elevator: e.target.value })}><option value="">Seçiniz</option>{options(["Var", "Yok"])}</select></label><label className="text-xs font-black">Site içerisinde<select className={listingInput} value={form.site} onChange={(e) => setForm({ ...form, site: e.target.value })}><option value="">Seçiniz</option>{options(["Evet", "Hayır"])}</select></label></div></section>
      <section className="border-t border-slate-100 pt-7"><h3 className="font-black">Açıklama</h3><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => addMarkup("## Başlık")} className="rc-secondary">Başlık</button><button type="button" onClick={() => addMarkup("**vurgulu metin**")} className="rc-secondary">Kalın</button><button type="button" onClick={() => addMarkup("- madde")} className="rc-secondary">Liste</button></div><textarea className={listingInput + " min-h-48 leading-6"} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="İlanın öne çıkan yönlerini, ulaşımını ve detaylarını düzenli biçimde yazın." /><div className="mt-3 grid gap-3 md:grid-cols-2"><input className={listingInput + " mt-0"} value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} placeholder="Video bağlantısı (isteğe bağlı)" /><input className={listingInput + " mt-0"} value={form.virtual_tour_url} onChange={(e) => setForm({ ...form, virtual_tour_url: e.target.value })} placeholder="Sanal tur bağlantısı (isteğe bağlı)" /></div></section>
      <section className="border-t border-slate-100 pt-7"><h3 className="font-black">Fotoğraf ve video</h3><p className="mt-1 text-xs text-slate-500">Önce dosyaları seçin, ardından ayrı “Fotoğrafları ekle” işlemiyle yükleyin.</p><div className="mt-4 flex flex-col gap-3 rounded-2xl border-2 border-dashed border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between"><label className="cursor-pointer text-sm font-black text-[#cd011e]">Dosyaları seç<input type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={(e) => chooseFiles(e.target.files)} /></label><span className="text-xs text-slate-500">{selectedFiles.length ? `${selectedFiles.length} dosya seçildi` : "Henüz dosya seçilmedi"}</span><button type="button" onClick={() => void uploadFiles()} disabled={uploading || !selectedFiles.length} className="rc-primary disabled:opacity-50">{uploading ? "YÜKLENİYOR…" : "FOTOĞRAFLARI EKLE"}</button></div>{uploaded.length > 0 && <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">{uploaded.map((item) => item.type.startsWith("image/") ? <img key={item.url} src={item.url} className="h-24 w-full rounded-xl object-cover" /> : <div key={item.url} className="grid h-24 place-items-center rounded-xl bg-slate-100 text-xs font-bold">Video eklendi</div>)}</div>}</section>
      <footer className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 pt-7 sm:flex-row"><p className="text-xs text-slate-500">{directPublish ? "İlan, gönderildiğinde doğrudan İlanlarımız sayfasında görünür." : "İlan, gönderildiğinde yönetici onayını bekler."}</p><button disabled={saving} className="rc-primary min-w-56 px-6 py-4 disabled:opacity-60">{saving ? "İŞLEM YAPILIYOR…" : directPublish ? "İLANI YAYINLA" : "İLANI ONAYA GÖNDER"}</button></footer>
    </div>
  </form>;
}

function ListingForm({ alert, profiles, mode, setMode }: { alert: (x: string) => void; profiles: Profile[]; mode: "all" | "approval" | "add"; setMode: (v: "all" | "approval" | "add") => void }) {
  const [listings, setListings] = useState<ListingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [filters, setFilters] = useState({ q: "", city: "", district: "", type: "", advisor: "" });
  const empty = { title: "", transaction_type: "Satılık", category: "Konut", property_type: "Daire", price: "", currency: "₺", city: "", district: "", neighborhood: "", rooms: "", gross: "", net: "", floor: "", total_floors: "", building_age: "", heating: "", parking: "", deed: "", credit: "", dues: "", description: "", video_url: "", virtual_tour_url: "", advisor: "" };
  const [form, setForm] = useState(empty);
  const [media, setMedia] = useState<File[]>([]);
  const load = async () => { setLoading(true); const { data, error } = await supabase.from("listings").select("id,owner_id,title,category,property_type,transaction_type,price,currency,city,district,neighborhood,rooms,area,images,approval_status,is_featured,created_at").is("deleted_at", null).order("created_at", { ascending: false }); if (error) alert(error.message); else setListings((data || []) as ListingRow[]); setLoading(false); };
  useEffect(() => { void load(); }, []);
  const advisors = profiles.filter((p) => p.role === "advisor" || p.role === "manager");
  const advisorName = (id: string) => { const p = profiles.find((x) => x.id === id); return p ? `${p.first_name} ${p.last_name}` : "Sistem kullanıcısı"; };
  const filtered = listings.filter((x) => (mode !== "approval" || x.approval_status === "Onay Bekliyor") && (!filters.q || `${x.title} ${x.city} ${x.district}`.toLocaleLowerCase("tr-TR").includes(filters.q.toLocaleLowerCase("tr-TR"))) && (!filters.city || x.city === filters.city) && (!filters.district || x.district === filters.district) && (!filters.type || x.property_type === filters.type) && (!filters.advisor || x.owner_id === filters.advisor));
  const update = async (id: string, patch: Record<string, unknown>, label: string) => { setBusy(id + label); const { error } = await supabase.from("listings").update(patch).eq("id", id); if (error) alert(error.message); else { await load(); alert(label); } setBusy(""); };
  const onFiles = (files: FileList | null) => setMedia(Array.from(files || []).filter((file) => file.type.startsWith("image/") || file.type.startsWith("video/")).slice(0, 12));
  const submit = async (e: React.FormEvent) => { e.preventDefault(); if (!form.title || !form.price || !form.city || !form.district || !form.advisor) return alert("Başlık, fiyat, il, ilçe ve ekleyen danışman zorunludur."); setBusy("create"); try { const urls: string[] = []; for (const file of media.filter((x) => x.type.startsWith("image/"))) { const path = `${Date.now()}-${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`; const { error } = await supabase.storage.from("listing-media").upload(path, file, { upsert: false }); if (error) throw error; urls.push(supabase.storage.from("listing-media").getPublicUrl(path).data.publicUrl); } let uploadedVideo = form.video_url; const video = media.find((x) => x.type.startsWith("video/")); if (video) { const path = `${Date.now()}-${crypto.randomUUID()}-${video.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`; const { error } = await supabase.storage.from("listing-media").upload(path, video, { upsert: false }); if (error) throw error; uploadedVideo = supabase.storage.from("listing-media").getPublicUrl(path).data.publicUrl; } const details = { gross_sqm: form.gross, net_sqm: form.net, floor: form.floor, total_floors: form.total_floors, building_age: form.building_age, heating: form.heating, parking: form.parking, deed: form.deed, credit: form.credit, dues: form.dues }; const { error } = await supabase.from("listings").insert({ owner_id: form.advisor, title: form.title, transaction_type: form.transaction_type, category: form.category, property_type: form.property_type, price: Number(form.price.replaceAll(".", "").replace(",", ".")), currency: form.currency, city: form.city, district: form.district, neighborhood: form.neighborhood || null, rooms: form.rooms || null, area: Number(form.gross || form.net || 0), description: form.description || null, video_url: uploadedVideo || null, virtual_tour_url: form.virtual_tour_url || null, images: urls, details, approval_status: "pending", is_featured: false }); if (error) throw error; setForm(empty); setMedia([]); await load(); setMode("approval"); alert("İlan kaydedildi ve onay merkezine gönderildi."); } catch (err: any) { alert(`İlan kaydedilemedi: ${err.message || "Tekrar deneyin."}`); } finally { setBusy(""); } };
  if (mode === "add") return <form onSubmit={submit} className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="flex flex-col gap-4 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-[#cd011e]">İLAN YÖNETİMİ / YENİ İLAN</p><h2 className="mt-1 text-xl font-black">Detaylı ilan girişi</h2><p className="mt-1 text-sm text-slate-500">Zorunlu alanları doldurun; ilan önce onay merkezine düşer.</p></div><button type="button" onClick={() => setMode("all")} className="rc-secondary">Listeye Dön</button></div><div className="grid gap-6 p-6 xl:grid-cols-[1fr_320px]"><div className="space-y-6"><section><h3 className="font-black">Temel İlan Bilgileri</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-black">İlan başlığı *<input required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={listingInput} placeholder="Örn. Çankaya'da modern 3+1 daire" /></label><label className="text-xs font-black">Ekleyen danışman *<select required value={form.advisor} onChange={(e) => setForm({ ...form, advisor: e.target.value })} className={listingInput}><option value="">Danışman seçiniz</option>{advisors.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name} · {p.phone || p.email}</option>)}</select></label><label className="text-xs font-black">İşlem tipi *<select value={form.transaction_type} onChange={(e) => setForm({ ...form, transaction_type: e.target.value })} className={listingInput}>{["Satılık", "Kiralık", "Devren Satılık", "Devren Kiralık"].map((x) => <option key={x}>{x}</option>)}</select></label><label className="text-xs font-black">Ana kategori *<select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={listingInput}>{["Konut", "Arsa", "İşyeri", "Turistik Tesis"].map((x) => <option key={x}>{x}</option>)}</select></label><label className="text-xs font-black">İlan türü *<select value={form.property_type} onChange={(e) => setForm({ ...form, property_type: e.target.value })} className={listingInput}>{["Daire", "Villa", "Müstakil Ev", "Arsa", "Tarla", "Ofis", "Dükkan", "Depo", "Otel"].map((x) => <option key={x}>{x}</option>)}</select></label><label className="text-xs font-black">Oda sayısı<select value={form.rooms} onChange={(e) => setForm({ ...form, rooms: e.target.value })} className={listingInput}><option value="">Belirtilmemiş</option>{["1+0", "1+1", "2+1", "3+1", "4+1", "5+1 ve üzeri"].map((x) => <option key={x}>{x}</option>)}</select></label></div></section><section className="border-t pt-6"><h3 className="font-black">Fiyat ve Konum</h3><div className="mt-4 grid gap-3 md:grid-cols-2"><label className="text-xs font-black">Fiyat *<input required inputMode="numeric" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".") })} className={listingInput} placeholder="0" /></label><label className="text-xs font-black">Para birimi<select value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value })} className={listingInput}><option>₺</option><option>USD</option><option>EUR</option></select></label><label className="text-xs font-black">İl *<select required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value, district: "" })} className={listingInput}><option value="">İl seçiniz</option>{listingCities.map((x) => <option key={x}>{x}</option>)}</select></label><label className="text-xs font-black">İlçe *<select required value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} className={listingInput}><option value="">İlçe seçiniz</option>{(listingDistricts[form.city] || []).map((x) => <option key={x}>{x}</option>)}</select></label><label className="text-xs font-black">Mahalle<input value={form.neighborhood} onChange={(e) => setForm({ ...form, neighborhood: e.target.value })} className={listingInput} placeholder="Mahalle adı" /></label><label className="text-xs font-black">Aidat<input inputMode="numeric" value={form.dues} onChange={(e) => setForm({ ...form, dues: e.target.value })} className={listingInput} placeholder="Aylık aidat" /></label></div></section><section className="border-t pt-6"><h3 className="font-black">Teknik Özellikler</h3><div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">{[["gross", "Brüt m²", "Örn. 145"], ["net", "Net m²", "Örn. 125"], ["floor", "Bulunduğu kat", "Örn. 3"], ["total_floors", "Toplam kat", "Örn. 8"], ["building_age", "Bina yaşı", "Örn. 0-5"], ["heating", "Isıtma", "Örn. Kombi"], ["parking", "Otopark", "Örn. Açık / Kapalı"], ["deed", "Tapu durumu", "Örn. Kat mülkiyeti"], ["credit", "Kredi uygunluğu", "Uygun / Değil"]].map(([key, label, placeholder]) => <label key={key} className="text-xs font-black">{label}<input value={(form as any)[key]} onChange={(e) => setForm({ ...form, [key]: e.target.value })} className={listingInput} placeholder={placeholder} /></label>)}</div></section><section className="border-t pt-6"><h3 className="font-black">Açıklama ve bağlantılar</h3><div className="mt-4 grid gap-3"><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={listingInput + " min-h-32"} placeholder="İlan detay açıklaması" /><input value={form.video_url} onChange={(e) => setForm({ ...form, video_url: e.target.value })} className={listingInput} placeholder="Video URL (isteğe bağlı)" /><input value={form.virtual_tour_url} onChange={(e) => setForm({ ...form, virtual_tour_url: e.target.value })} className={listingInput} placeholder="Sanal tur URL (isteğe bağlı)" /></div></section></div><aside><div className="sticky top-5 rounded-2xl bg-slate-50 p-5"><h3 className="font-black">Görsel ve Video</h3><label className="mt-4 flex min-h-48 cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white p-4 text-center transition hover:border-[#cd011e]"><Upload size={24} className="text-[#cd011e]" /><b className="mt-3 text-xs">Fotoğraf veya video ekle</b><small className="mt-1 text-[10px] text-slate-400">Tıkla ya da sürükle bırak · en fazla 12 dosya</small><input type="file" accept="image/*,video/mp4,video/webm" multiple className="hidden" onChange={(e) => onFiles(e.target.files)} /></label>{media.length > 0 && <div className="mt-3 space-y-1 text-xs text-slate-600">{media.map((file) => <p key={file.name} className="truncate">• {file.name}</p>)}</div>}<button disabled={busy === "create"} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#cd011e] px-4 py-3 text-xs font-black text-white shadow-lg shadow-red-700/20 transition hover:bg-red-800 disabled:opacity-60">{busy === "create" ? "İLAN KAYDEDİLİYOR…" : "İLANI ONAYA GÖNDER"}</button><p className="mt-3 text-center text-[10px] text-slate-500">Onaydan sonra İlanlarımız, öne çıkanlar ve canlı akışta kullanılabilir.</p></div></aside></div></form>;
  return <div className="space-y-5"><div className="flex flex-col gap-4 rounded-2xl bg-[#cd011e] p-5 text-white sm:flex-row sm:items-center sm:justify-between"><div><p className="text-[10px] font-black tracking-[.18em] text-white/70">REALTY CENTER / İLAN MERKEZİ</p><h2 className="mt-1 text-xl font-black">{mode === "approval" ? "İlan Onay Merkezi" : "Tüm İlanlar"}</h2><p className="mt-1 text-sm text-white/75">{listings.length} kayıt · {listings.filter((x) => x.approval_status === "pending").length} onay bekliyor</p></div><button onClick={() => setMode("add")} className="rounded-xl bg-white px-5 py-3 text-xs font-black text-[#cd011e] shadow-sm transition hover:scale-[1.02]">+ İLAN EKLE</button></div><div className="grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-5"><input value={filters.q} onChange={(e) => setFilters({ ...filters, q: e.target.value })} className={listingInput + " mt-0"} placeholder="İlan ara" /><select value={filters.city} onChange={(e) => setFilters({ ...filters, city: e.target.value, district: "" })} className={listingInput + " mt-0"}><option value="">Tüm iller</option>{listingCities.map((x) => <option key={x}>{x}</option>)}</select><select value={filters.district} onChange={(e) => setFilters({ ...filters, district: e.target.value })} className={listingInput + " mt-0"}><option value="">Tüm ilçeler</option>{(listingDistricts[filters.city] || []).map((x) => <option key={x}>{x}</option>)}</select><select value={filters.type} onChange={(e) => setFilters({ ...filters, type: e.target.value })} className={listingInput + " mt-0"}><option value="">Tüm türler</option>{["Daire", "Villa", "Müstakil Ev", "Arsa", "Tarla", "Ofis", "Dükkan", "Depo", "Otel"].map((x) => <option key={x}>{x}</option>)}</select><select value={filters.advisor} onChange={(e) => setFilters({ ...filters, advisor: e.target.value })} className={listingInput + " mt-0"}><option value="">Tüm danışmanlar</option>{advisors.map((p) => <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>)}</select></div><div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white"><table className="w-full min-w-[920px] text-left"><thead className="bg-slate-50 text-[10px] font-black uppercase text-slate-500"><tr><th className="p-4">İlan</th><th className="p-4">Konum</th><th className="p-4">Fiyat / m²</th><th className="p-4">Ekleyen danışman</th><th className="p-4">Durum</th><th className="p-4 text-right">İşlemler</th></tr></thead><tbody>{loading ? <tr><td colSpan={6} className="p-8 text-center text-sm text-slate-400">İlanlar yükleniyor…</td></tr> : filtered.length ? filtered.map((x) => <tr key={x.id} className="border-t text-sm hover:bg-slate-50"><td className="p-4"><div className="flex items-center gap-3">{x.images?.[0] ? <img src={x.images[0]} className="h-11 w-14 rounded-lg object-cover" /> : <span className="grid h-11 w-14 place-items-center rounded-lg bg-red-50 text-xs font-black text-[#cd011e]">İLAN</span>}<span><b className="block max-w-52 truncate">{x.title}</b><small className="text-slate-400">{x.transaction_type} · {x.property_type}</small></span></div></td><td className="p-4 text-xs font-bold">{x.city} / {x.district}<br/><span className="font-medium text-slate-400">{x.neighborhood || "-"}</span></td><td className="p-4"><b>{Number(x.price).toLocaleString("tr-TR")} {x.currency}</b><small className="block text-slate-400">{x.area || "-"} m²</small></td><td className="p-4 text-xs font-bold">{advisorName(x.owner_id)}</td><td className="p-4"><span className={`rounded-full px-2.5 py-1 text-[10px] font-black ${x.approval_status === "approved" ? "bg-emerald-100 text-emerald-700" : x.approval_status === "rejected" ? "bg-rose-100 text-rose-700" : "bg-amber-100 text-amber-700"}`}>{x.approval_status === "approved" ? "Yayında" : x.approval_status === "rejected" ? "Reddedildi" : "Onay bekliyor"}</span></td><td className="p-4 text-right"><div className="flex justify-end gap-2">{x.approval_status !== "approved" && <button disabled={busy === x.id + "Onaylandı"} onClick={() => void update(x.id, { approval_status: "approved" }, "Onaylandı")} className="rounded-lg bg-emerald-600 px-3 py-2 text-[10px] font-black text-white">{busy === x.id + "Onaylandı" ? "…" : "Onayla"}</button>}<button onClick={() => void update(x.id, { is_featured: !x.is_featured }, x.is_featured ? "Öne çıkarma kaldırıldı" : "Öne çıkarıldı")} className={`rounded-lg px-3 py-2 text-[10px] font-black ${x.is_featured ? "bg-amber-400 text-slate-900" : "bg-slate-800 text-white"}`}>★ {x.is_featured ? "Öne çıktı" : "Öne çıkar"}</button></div></td></tr>) : <tr><td colSpan={6} className="p-10 text-center text-sm text-slate-400">Bu kriterlerde ilan bulunmuyor.</td></tr>}</tbody></table></div></div>;
}
function FeaturePage({ title, page }: { title: string; page: Page }) {
  const info: Record<string, string[]> = {
    header: [
      "Menü ağacı, sıralama ve aktif/pasif kontrol",
      "Yeni ana sayfa ile 2., 3. ve 4. seviye alt sayfa ekleme",
      "Metin, resim, video ve tipografi düzenleyicisi",
    ],
    corporate: [
      "Hakkımızda: metin, görsel ve video",
      "Yönetim kadrosu: fotoğraf, isim ve CV",
      "Belgeler, Referanslar ve İş Ortakları yönetimi",
    ],
    media: [
      "Realty TV ve Realty Haber",
      "YouTube URL, kanal URL ve video yükleme",
      "Kapak görseli veya varsayılan Realty Center kapağı",
    ],
    library: [
      "Kategori yönetimi",
      "Kapak görseli, zengin metin ve video bağlantısı",
      "Etiketler ve yayın kontrolü",
    ],
    crm: [
      "Müşteri kartı ve hızlı arama",
      "Arama, mesaj, toplantı ve görev geçmişi",
      "Danışman atama ve portföy eşleştirme",
    ],
    inbox: [
      "İletişim, Barterbank ve Siz Aradığınızı Söyleyin talepleri",
      "İl/ilçe bazlı danışman bildirimi",
      "Finansal çözüm form kayıtları",
    ],
    backup: [
      "Otomatik günlük, haftalık ve aylık yedek",
      "Excel, PDF ve ZIP indirme seçenekleri",
      "Yetki kontrollü güvenli erişim",
    ],
    logs: [
      "Başarılı/başarısız girişler",
      "Kullanıcı, rol ve ilan hareketleri",
      "Oturum sonlandırma ve silme kayıtları",
    ],
    trash: [
      "Silinen kayıtları görüntüleme",
      "Geri yükleme ve kalıcı silme",
      "Silme zamanı ve işlemi yapan kullanıcı",
    ],
  };
  return (
    <>
      <div className="mb-6 border-b border-slate-200 pb-5">
        <p className="text-[10px] font-black tracking-[.2em] text-[#cd011e]">
          REALTY CENTER / YÖNETİM
        </p>
        <h1 className="mt-1 text-2xl font-black">{title}</h1>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(info[page] || []).map((x, i) => (
          <button
            key={x}
            className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm hover:border-[#cd011e]"
          >
            <span className="flex items-center gap-3">
              <b className="rounded-xl bg-[#cd011e]/10 px-3 py-2 text-xs text-[#cd011e]">
                0{i + 1}
              </b>
              <span className="text-sm font-black">{x}</span>
            </span>
            <ChevronRight size={18} className="text-slate-400" />
          </button>
        ))}
      </div>
    </>
  );
}
function UserDrawer({
  profile,
  close,
  trash,
}: {
  profile: Profile;
  close: () => void;
  trash: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 bg-slate-950/30" onClick={close}>
      <aside
        className="absolute right-0 top-0 h-full w-full max-w-md bg-white p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between">
          <h2 className="text-lg font-black">Kullanıcı Detayı</h2>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <h3 className="mt-7 text-xl font-black">
          {profile.first_name} {profile.last_name}
        </h3>
        <p className="text-sm text-slate-500">@{profile.username}</p>
        <div className="mt-6 space-y-3 text-sm">
          <p>
            <b>E-posta:</b> {profile.email}
          </p>
          <p>
            <b>Telefon:</b> {profile.phone || "Eklenmedi"}
          </p>
          <p>
            <b>Rol:</b> {roleName(profile.role)}
          </p>
          <p>
            <b>Durum:</b> {statusName(profile.status)}
          </p>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-2">
          <button className="rc-secondary">Profili Düzenle</button>
          <button className="rc-secondary">Şifreyi Sıfırla</button>
          <button className="rc-secondary">Oturumları Bitir</button>
          <button
            onClick={trash}
            className="rounded-xl border border-red-200 bg-red-50 px-3 py-3 text-xs font-black text-red-700"
          >
            Çöp Kutusuna Taşı
          </button>
        </div>
      </aside>
    </div>
  );
}
function NewOfficeModal({
  advisers,
  close,
  done,
  office,
}: {
  advisers: Profile[];
  close: () => void;
  done: () => Promise<void>;
  office?: Office;
}) {
  const cities = [
    "Adana",
    "Ankara",
    "Antalya",
    "Balıkesir",
    "Bursa",
    "Eskişehir",
    "Gaziantep",
    "İstanbul",
    "İzmir",
    "Kayseri",
    "Kocaeli",
    "Konya",
    "Mersin",
    "Muğla",
    "Sakarya",
    "Samsun",
    "Tekirdağ",
    "Trabzon",
  ];
  const districts: Record<string, string[]> = {
    Ankara: [
      "Altındağ",
      "Çankaya",
      "Etimesgut",
      "Keçiören",
      "Mamak",
      "Sincan",
      "Yenimahalle",
    ],
    İstanbul: [
      "Ataşehir",
      "Bakırköy",
      "Beşiktaş",
      "Kadıköy",
      "Kartal",
      "Maltepe",
      "Pendik",
      "Sarıyer",
      "Şişli",
      "Üsküdar",
    ],
    İzmir: ["Bornova", "Buca", "Çeşme", "Karşıyaka", "Konak", "Urla"],
    Bursa: ["Nilüfer", "Osmangazi", "Yıldırım"],
    Antalya: ["Alanya", "Konyaaltı", "Muratpaşa"],
    Kocaeli: ["Başiskele", "Gebze", "İzmit"],
    Konya: ["Karatay", "Meram", "Selçuklu"],
  };
  const savedHours = (office?.work_hours || "09:00 - 18:00").match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  const [form, setForm] = useState({
    name: office?.name || "",
    ownerId: office?.owner_profile_id || "",
    city: office?.city || "",
    district: office?.district || "",
    mobile: office?.mobile_phone || office?.phone || "",
    landline: office?.landline_phone || "",
    email: office?.email || "",
    address: office?.address || "",
    description: office?.description || "",
    hoursStart: savedHours?.[1] || "09:00",
    hoursEnd: savedHours?.[2] || "18:00",
  });
  const [imageUrl, setImageUrl] = useState(office?.image_url || "");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const timeOptions = Array.from({ length: 35 }, (_, index) => {
    const minutes = 6 * 60 + index * 30;
    return `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
  });
  const set = (key: string, value: string | number) =>
    setForm((old) => ({ ...old, [key]: value }));
  const loadImage = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/") || file.size > 5 * 1024 * 1024)
      return setNotice("Lütfen 5 MB altı JPG, PNG veya WebP görsel seçin.");
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(file);
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const mobile = form.mobile.replace(/\s|\(|\)|-/g, "");
    const landline = form.landline.replace(/\s|\(|\)|-/g, "");
    if (!/^05\d{9}$/.test(mobile))
      return setNotice("Cep telefonu 05XX XXX XX XX biçiminde geçerli olmalı.");
    if (landline && !/^0[2-4]\d{9}$/.test(landline))
      return setNotice(
        "Sabit telefon alan koduyla birlikte 0XXX XXX XX XX biçiminde olmalı.",
      );
    if (form.hoursStart >= form.hoursEnd)
      return setNotice("Çıkış saati giriş saatinden sonra olmalı.");
    setBusy(true);
    setNotice(office ? "Ofis bilgileri güncelleniyor…" : "Ofis kaydı oluşturuluyor…");
    const owner = advisers.find((item) => item.id === form.ownerId);
    const payload = {
        name: form.name,
        city: form.city,
        district: form.district,
        address: form.address,
        email: form.email || null,
        phone: form.mobile,
        mobile_phone: form.mobile,
        landline_phone: form.landline || null,
        work_hours: `${form.hoursStart} - ${form.hoursEnd}`,
        description: form.description || null,
        owner_profile_id: form.ownerId || null,
        manager_name: owner ? `${owner.first_name} ${owner.last_name}` : null,
        image_url: imageUrl || null,
        status: "active",
      };
    const request = office
      ? supabase.from("offices").update(payload).eq("id", office.id).select("id").single()
      : supabase.from("offices").insert(payload).select("id").single();
    const { data, error } = await request;
    if (!error && data && form.ownerId) {
      await supabase.from("office_advisors").update({ is_manager: false }).eq("office_id", data.id);
      await supabase.from("office_advisors").upsert({
        office_id: data.id,
        advisor_id: form.ownerId,
        is_manager: true,
      });
    }
    setBusy(false);
    if (error) return setNotice(error.message);
    await done();
    setNotice(
      office ? "Ofis güncellendi ve Ofislerimiz alanına yansıtıldı." : "Ofis başarıyla oluşturuldu ve web sitesindeki Ofislerimiz alanına yansıtıldı.",
    );
    window.setTimeout(close, 900);
  };
  return (
    <div className="fixed inset-0 z-[110] overflow-y-auto bg-slate-950/55 p-3 sm:p-6">
      <form
        onSubmit={save}
        className="mx-auto my-3 w-full max-w-[1360px] rounded-[24px] bg-white p-5 shadow-2xl sm:p-9"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-black tracking-[.28em] text-[#cd011e]">
              REALTY CENTER
            </p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-[#0b2450]">
              {office ? "Ofis Bilgilerini Düzenle" : "Yeni Ofis Ekle"}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              {office ? "Mevcut bilgileri güncelleyin. İl, ilçe ve iletişim alanları düzenlenebilir." : "Sistemde görünecek yeni ofisi oluşturun. Konum ve iletişim bilgilerini eksiksiz girin."}
            </p>
          </div>
          <button
            type="button"
            onClick={close}
            className="grid h-11 w-11 place-items-center rounded-full bg-slate-100 text-xl text-slate-600 transition hover:bg-slate-200"
          >
            ×
          </button>
        </div>
        <div className="mt-7 grid gap-5 lg:grid-cols-[1.3fr_.9fr]">
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="border-b bg-slate-50/70 px-5 py-4">
                <h3 className="font-black text-[#0b2450]">
                  <Building2 className="mr-2 inline h-5 w-5 text-blue-500" />
                  Temel Bilgiler
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Ofis adını, konumunu ve iletişim bilgilerini girin.
                </p>
              </div>
              <div className="grid gap-4 p-5 sm:grid-cols-2">
                <Field label="Ofis adı *">
                  <input
                    required
                    value={form.name}
                    onChange={(e) => set("name", e.target.value)}
                    placeholder="Örn. Çankaya Ofisi"
                    className="rc-office-input"
                  />
                </Field>
                <Field label="Ofis sahibi / yönetici *">
                  <select
                    required
                    value={form.ownerId}
                    onChange={(e) => set("ownerId", e.target.value)}
                    className="rc-office-input"
                  >
                    <option value="">Danışman seçin</option>
                    {advisers.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.first_name} {a.last_name}
                        {a.phone ? ` · ${a.phone}` : ""}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="İl *">
                  <select
                    required
                    value={form.city}
                    onChange={(e) => {
                      set("city", e.target.value);
                      set("district", "");
                    }}
                    className="rc-office-input"
                  >
                    <option value="">İl seçin</option>
                    {cities.map((city) => (
                      <option key={city}>{city}</option>
                    ))}
                  </select>
                </Field>
                <Field label="İlçe *">
                  <select
                    required
                    disabled={!form.city}
                    value={form.district}
                    onChange={(e) => set("district", e.target.value)}
                    className="rc-office-input disabled:opacity-50"
                  >
                    <option value="">İlçe seçin</option>
                    {(districts[form.city] || ["Merkez"]).map((district) => (
                      <option key={district}>{district}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Cep telefonu *">
                  <input
                    required
                    inputMode="tel"
                    value={form.mobile}
                    onChange={(e) => set("mobile", e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="rc-office-input"
                  />
                </Field>
                <Field label="Sabit telefon">
                  <input
                    inputMode="tel"
                    value={form.landline}
                    onChange={(e) => set("landline", e.target.value)}
                    placeholder="0XXX XXX XX XX"
                    className="rc-office-input"
                  />
                </Field>
                <Field label="E-posta">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    placeholder="ornek@realtycenter.com"
                    className="rc-office-input"
                  />
                </Field>
                <Field label="Çalışma saatleri *">
                  <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
                    <select value={form.hoursStart} onChange={(e) => set("hoursStart", e.target.value)} className="rc-office-input">
                      {timeOptions.map((time) => <option key={time}>{time}</option>)}
                    </select>
                    <span className="text-slate-400">–</span>
                    <select value={form.hoursEnd} onChange={(e) => set("hoursEnd", e.target.value)} className="rc-office-input">
                      {timeOptions.map((time) => <option key={time}>{time}</option>)}
                    </select>
                  </div>
                  <p className="mt-1.5 text-[10px] font-medium text-slate-400">Önce giriş, sonra çıkış saatini seçin.</p>
                </Field>
                <Field label="Açık adres *" wide>
                  <textarea
                    required
                    value={form.address}
                    onChange={(e) => set("address", e.target.value)}
                    placeholder="Mahalle, cadde, sokak, bina no, daire…"
                    className="rc-office-input min-h-24 resize-y"
                  />
                </Field>
              </div>
            </section>
            <section className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="border-b bg-slate-50/70 px-5 py-4">
                <h3 className="font-black text-[#0b2450]">
                  <Clock3 className="mr-2 inline h-5 w-5 text-blue-500" />
                  Ek Bilgiler
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Ofis bilgileri sayfasında gösterilecek açıklama ve çalışma
                  düzeni.
                </p>
              </div>
              <div className="p-5">
                <Field label="Ofis açıklaması">
                  <textarea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    placeholder="Ofis ile ilgili kısa bilgi ekleyin…"
                    className="rc-office-input min-h-24 resize-y"
                  />
                </Field>
              </div>
            </section>
          </div>
          <div className="space-y-5">
            <section className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="border-b bg-slate-50/70 px-5 py-4">
                <h3 className="font-black text-[#0b2450]">
                  <Upload className="mr-2 inline h-5 w-5 text-blue-500" />
                  Ofis Görseli
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Ofisin dış görünümünü yansıtan bir fotoğraf yükleyin.
                </p>
              </div>
              <label
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  loadImage(e.dataTransfer.files?.[0]);
                }}
                className="m-4 flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-slate-50 p-5 text-center transition hover:border-[#cd011e] hover:bg-red-50"
              >
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => loadImage(e.target.files?.[0])}
                />
                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt="Ofis önizleme"
                    className="h-44 w-full rounded-lg object-cover"
                  />
                ) : (
                  <>
                    <Upload className="h-9 w-9 text-slate-400" />
                    <b className="mt-3 text-sm text-[#0b2450]">
                      Fotoğraf yükleyin
                    </b>
                    <span className="mt-1 text-xs text-slate-400">
                      JPG, PNG veya WebP · maksimum 5 MB
                    </span>
                    <span className="mt-4 rounded-xl border bg-white px-4 py-2 text-xs font-black text-[#0b2450]">
                      Dosya Seç
                    </span>
                  </>
                )}
              </label>
            </section>
          </div>
        </div>
        {notice && (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold text-blue-800">
            {notice}
          </div>
        )}
        <div className="mt-7 flex justify-end gap-3 border-t pt-5">
          <button
            type="button"
            onClick={close}
            className="rounded-xl border border-slate-300 px-6 py-3 text-xs font-black text-[#0b2450]"
          >
            İptal
          </button>
          <button
            disabled={busy}
            className="inline-flex min-w-40 items-center justify-center gap-2 rounded-xl bg-[#d70724] px-6 py-3 text-xs font-black text-white shadow-lg shadow-red-700/20 transition active:scale-95 disabled:opacity-70"
          >
            {busy && (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {busy ? "Kaydediliyor…" : office ? "Değişiklikleri Kaydet" : "Ofisi Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <label
      className={`text-xs font-black text-[#0b2450] ${wide ? "sm:col-span-2" : ""}`}
    >
      {label}
      <div className="mt-1.5">{children}</div>
    </label>
  );
}
function OfficeDrawer({
  office,
  profiles,
  members,
  close,
  done,
}: {
  office: Office;
  profiles: Profile[];
  members: { office_id: string; advisor_id: string; is_manager: boolean }[];
  close: () => void;
  done: () => Promise<void>;
}) {
  return <NewOfficeModal advisers={profiles.filter((profile) => profile.role === "advisor")} office={office} close={close} done={done} />;
}
function Export({
  fields,
  setFields,
  close,
  submit,
}: {
  fields: string[];
  setFields: (x: string[]) => void;
  close: () => void;
  submit: () => void;
}) {
  const all = [
    "Ad Soyad",
    "Kullanıcı Adı",
    "E-posta",
    "Rol",
    "Durum",
    "Telefon",
    "Son Giriş",
    "Oluşturulma",
  ];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6">
        <div className="flex justify-between">
          <h2 className="text-lg font-black">Excel’e Aktar</h2>
          <button onClick={close}>
            <X />
          </button>
        </div>
        <p className="mt-1 text-sm text-slate-500">
          Açık filtredeki kayıtlar için alanları seçin.
        </p>
        <div className="mt-5 space-y-2">
          {all.map((x) => (
            <label
              key={x}
              className="flex gap-3 rounded-lg px-2 py-2 text-sm font-bold"
            >
              <input
                type="checkbox"
                checked={fields.includes(x)}
                onChange={(e) =>
                  setFields(
                    e.target.checked
                      ? [...fields, x]
                      : fields.filter((i) => i !== x),
                  )
                }
              />
              {x}
            </label>
          ))}
        </div>
        <button
          disabled={!fields.length}
          onClick={submit}
          className="rc-primary mt-5 w-full"
        >
          <Download size={16} /> Excel uyumlu indir
        </button>
      </div>
    </div>
  );
}
