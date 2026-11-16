import { useEffect, useState, type ReactNode } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { toast } from "sonner";
import { Copy, MapPin, X } from "lucide-react";
import monogram from "@/assets/monogram.png.asset.json";
import calendar from "@/assets/calendar.png.asset.json";
import mosque from "@/assets/mosque.png.asset.json";
import building from "@/assets/building.png.asset.json";
import pin from "@/assets/pin.png.asset.json";
import corner from "@/assets/corner.png.asset.json";
import divider from "@/assets/divider.png.asset.json";
import emblem from "@/assets/emblem.png.asset.json";
import pathImg from "@/assets/garden-path.webp.asset.json";
import leavesImg from "@/assets/garden-leaves.webp.asset.json";
import g1 from "@/assets/gallery-couple.webp.asset.json";
import g2 from "@/assets/gallery-rings.webp.asset.json";
import g3 from "@/assets/gallery-table.webp.asset.json";
import { ButterflyFlock } from "./Butterfly";
import { WEDDING } from "@/lib/wedding";
import { AR_RUM_21 } from "@/lib/verse";
import { addEntry, loadEntries, type Entry } from "@/lib/rsvp";

const reveal = {
  initial: { opacity: 0, y: 36 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 1, ease: [0.22, 1, 0.36, 1] },
} as const;

function Section({ children, className = "", tone = "navy" }: { children: ReactNode; className?: string; tone?: "navy" | "wine" }) {
  return (
    <section className="relative">
      {tone === "wine" && <div className="absolute inset-0 bg-wine-grad opacity-25" />}
      <div className={`relative mx-auto max-w-3xl px-6 py-20 text-center sm:py-28 ${className}`}>
        <img src={corner.url} alt="" className="pointer-events-none absolute left-2 top-2 w-14 opacity-50 sm:w-20" />
        <img src={corner.url} alt="" className="pointer-events-none absolute bottom-2 right-2 w-14 rotate-180 opacity-50 sm:w-20" />
        <motion.div {...reveal}>{children}</motion.div>
      </div>
    </section>
  );
}

function Title({ kicker, children }: { kicker: string; children: ReactNode }) {
  return (
    <div className="mb-10">
      <p className="text-[11px] uppercase tracking-[0.42em] text-cream/75">{kicker}</p>
      <h2 className="mt-2 font-script text-5xl text-gold-grad sm:text-6xl">{children}</h2>
      <img src={divider.url} alt="" className="mx-auto mt-3 opacity-80" style={{ height: 24, width: 200, objectFit: "cover", objectPosition: "top" }} />
    </div>
  );
}

function Countdown() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const diff = Math.max(0, new Date(WEDDING.akad.date).getTime() - (now ?? 0));
  const parts = now === null ? [0, 0, 0, 0] : [diff / 864e5, (diff / 36e5) % 24, (diff / 6e4) % 60, (diff / 1e3) % 60].map(Math.floor);
  return (
    <div className="mt-8 grid grid-cols-4 gap-2 sm:gap-3">
      {["Hari", "Jam", "Menit", "Detik"].map((l, i) => (
        <div key={l} className="card-navy rounded-xl py-3">
          <div className="font-display text-3xl text-gold-grad">{parts[i]}</div>
          <div className="text-[10px] uppercase tracking-widest text-cream/70">{l}</div>
        </div>
      ))}
    </div>
  );
}

function EventCard({ icon, title, e }: { icon: string; title: string; e: typeof WEDDING.akad }) {
  return (
    <div className="card-navy overflow-hidden p-0">
      <div className="bg-wine-grad px-6 pb-5 pt-6">
        <img src={icon} alt="" className="floaty mx-auto h-24 object-contain" />
        <h3 className="mt-3 font-display text-3xl text-ivory">{title}</h3>
      </div>
      <div className="p-6">
        <p className="font-medium text-ivory">{e.label}</p>
        <p className="text-sm text-cream/75">{e.time}</p>
        <p className="mt-3 font-display text-xl text-gold">{e.place}</p>
        <p className="text-sm text-cream/75">{e.address}</p>
        <a href={e.map} target="_blank" rel="noreferrer" className="btn-wine mt-5 px-5 py-2 text-sm font-medium">
          <MapPin className="h-4 w-4" /> Lihat Lokasi
        </a>
      </div>
    </div>
  );
}

function Rsvp({ guest }: { guest: string }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [name, setName] = useState(guest === "Tamu Undangan" ? "" : guest);
  const [attend, setAttend] = useState("Hadir");
  const [count, setCount] = useState(1);
  const [msg, setMsg] = useState("");
  useEffect(() => {
    setEntries(loadEntries());
  }, []);
  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!name.trim() || !msg.trim()) {
      toast.error("Mohon isi nama dan ucapan.");
      return;
    }
    setEntries(addEntry({ name: name.trim().slice(0, 60), attend, count, message: msg.trim().slice(0, 500), at: Date.now() }));
    setMsg("");
    toast.success("Terima kasih atas konfirmasi dan doanya!");
  };
  const wa = `https://wa.me/${WEDDING.whatsapp}?text=${encodeURIComponent(`Halo, saya ${name || "-"} konfirmasi: ${attend} (${count} orang). ${msg}`)}`;
  const field = "w-full rounded-lg border border-input bg-night/50 px-4 py-3 text-sm text-ivory placeholder:text-cream/50 outline-none focus:ring-2 focus:ring-ring";
  return (
    <>
      <form onSubmit={submit} className="card-navy space-y-3 p-6 text-left">
        <input className={field} placeholder="Nama" value={name} onChange={(e) => setName(e.target.value)} maxLength={60} aria-label="Nama" />
        <div className="grid grid-cols-2 gap-3">
          <select className={field} value={attend} onChange={(e) => setAttend(e.target.value)} aria-label="Kehadiran">
            <option>Hadir</option>
            <option>Tidak Hadir</option>
            <option>Masih Ragu</option>
          </select>
          <select className={field} value={count} onChange={(e) => setCount(Number(e.target.value))} aria-label="Jumlah tamu">
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n} orang</option>
            ))}
          </select>
        </div>
        <textarea className={field} rows={3} placeholder="Ucapan & doa" value={msg} onChange={(e) => setMsg(e.target.value)} maxLength={500} aria-label="Ucapan dan doa" />
        <div className="flex flex-col gap-2 sm:flex-row">
          <button className="btn-wine flex-1 py-3 text-sm font-medium">Kirim Ucapan</button>
          <a href={wa} target="_blank" rel="noreferrer" className="btn-ghost-gold flex-1 py-3 text-center text-sm">Konfirmasi via WhatsApp</a>
        </div>
      </form>
      <div className="mt-6 max-h-80 space-y-3 overflow-y-auto text-left">
        {entries.map((e, i) => (
          <div key={i} className="rounded-xl border border-border bg-burgundy/25 p-4">
            <div className="flex items-center justify-between gap-3">
              <span className="truncate font-display text-lg text-gold">{e.name}</span>
              <span className="shrink-0 text-xs text-cream/70">{e.attend}</span>
            </div>
            <p className="mt-1 break-words text-sm text-ivory/90">{e.message}</p>
          </div>
        ))}
      </div>
    </>
  );
}

const GALLERY = [g1.url, pathImg.url, g2.url, g3.url, leavesImg.url];

export function Main({ guest }: { guest: string }) {
  const { scrollY } = useScroll();
  const bgY = useTransform(scrollY, [0, 3000], ["0%", "20%"]);
  const [lightbox, setLightbox] = useState<string | null>(null);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const copy = (t: string) => {
    navigator.clipboard?.writeText(t);
    toast.success("Nomor rekening disalin");
  };
  return (
    <main className="relative overflow-hidden">
      <motion.div className="fixed inset-0 -z-10" style={{ y: bgY }}>
        <img src={leavesImg.url} alt="" className="h-[130%] w-full object-cover opacity-15" />
      </motion.div>
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-background/70 via-background/90 to-background" />

      {/* Hero */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 text-center">
        <motion.img src={pathImg.url} alt="" className="absolute inset-0 h-full w-full object-cover" initial={{ opacity: 0 }} animate={{ opacity: 0.45 }} transition={{ duration: 2, ease: "easeOut" }} />
        <div className="absolute inset-0 bg-night-fade" />
        <ButterflyFlock />
        <motion.div className="relative" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.6, delay: 0.5 }}>
          <img src={monogram.url} alt="S&L" className="mx-auto h-32 sm:h-44" />
          <p className="mt-6 text-[11px] uppercase tracking-[0.45em] text-cream/80">The Wedding of</p>
          <h1 className="mt-2 font-script text-6xl text-gold-grad sm:text-8xl">
            {WEDDING.bride} <span className="text-4xl">&</span> {WEDDING.groom}
          </h1>
          <p className="mt-4 font-display text-xl italic text-ivory">18 & 20 Desember 2026</p>
          <p className="mt-6 text-sm text-cream/75">
            Kepada Yth. <span className="text-ivory">{guest}</span>
          </p>
        </motion.div>
      </section>

      {/* QS. Ar-Rum : 21 */}
      <section className="relative px-5 py-20 sm:py-28">
        <motion.figure {...reveal} className="relative mx-auto max-w-2xl rounded-[2rem] border border-gold/40 bg-paper px-6 py-12 text-center text-ink shadow-soft sm:px-12">
          <div className="pointer-events-none absolute inset-3 rounded-[1.5rem] border border-burgundy/25" />
          <p className="text-[11px] uppercase tracking-[0.4em] text-burgundy/80">Firman Allah SWT</p>
          <blockquote
            dir="rtl"
            lang="ar"
            className="mt-8 font-arabic text-[1.55rem] leading-[2.3] text-ink sm:text-[2rem] sm:leading-[2.2]"
            style={{ wordSpacing: "0.08em" }}
          >
            {AR_RUM_21.arabic}
          </blockquote>
          <div className="mx-auto my-8 h-px w-24 bg-burgundy/40" />
          <p className="font-display text-lg italic leading-relaxed text-ink/85 sm:text-xl">"{AR_RUM_21.translation}"</p>
          <figcaption className="mt-6 text-sm font-medium tracking-[0.25em] text-burgundy">{AR_RUM_21.reference}</figcaption>
        </motion.figure>
      </section>

      <Section tone="wine">
        <Title kicker="Bismillahirrahmanirrahim">Mempelai</Title>
        <div className="grid gap-10 sm:grid-cols-2">
          {[
            { n: WEDDING.bride, p: WEDDING.brideParents },
            { n: WEDDING.groom, p: WEDDING.groomParents },
          ].map((x) => (
            <div key={x.n} className="card-navy px-6 py-8">
              <h3 className="font-script text-5xl text-gold-grad">{x.n}</h3>
              <p className="mt-2 text-sm text-cream/80">{x.p}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <Title kicker="Save the Date">Menghitung Hari</Title>
        <img src={calendar.url} alt="18 & 20" className="floaty mx-auto h-36 sm:h-40" />
        <Countdown />
      </Section>

      <Section className="max-w-4xl" tone="wine">
        <Title kicker="Rangkaian Acara">Waktu & Tempat</Title>
        <div className="grid gap-6 sm:grid-cols-2">
          <EventCard icon={mosque.url} title="Akad Nikah" e={WEDDING.akad} />
          <EventCard icon={building.url} title="Resepsi" e={WEDDING.resepsi} />
        </div>
        <img src={pin.url} alt="" className="mx-auto mt-10 h-16 opacity-80" />
      </Section>

      <Section className="max-w-5xl">
        <Title kicker="Momen Bahagia">Galeri</Title>
        <div className="columns-2 gap-3 sm:columns-3">
          {GALLERY.map((g, i) => (
            <button key={i} onClick={() => setLightbox(g)} className="mb-3 block w-full overflow-hidden rounded-xl border border-border shadow-soft">
              <img src={g} alt={`Galeri ${i + 1}`} loading="lazy" className="w-full transition-transform duration-700 hover:scale-105" />
            </button>
          ))}
        </div>
      </Section>

      <Section tone="wine">
        <Title kicker="Tanda Kasih">Wedding Gift</Title>
        <p className="mb-6 text-sm text-cream/80">Doa restu Anda adalah hadiah terindah. Namun jika ingin memberi tanda kasih, dapat melalui:</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {WEDDING.banks.map((b) => (
            <div key={b.number} className="rounded-2xl border border-gold/40 bg-wine-grad p-6 text-left shadow-wine">
              <p className="font-display text-2xl text-gold">{b.bank}</p>
              <p className="mt-4 font-mono text-xl tracking-widest text-ivory">{b.number}</p>
              <p className="text-sm text-cream/80">a.n. {b.name}</p>
              <button onClick={() => copy(b.number)} className="btn-ghost-gold mt-4 px-4 py-1.5 text-xs">
                <Copy className="h-3 w-3" /> Salin
              </button>
            </div>
          ))}
        </div>
        <div className="card-navy mt-4 p-5 text-sm">
          <p className="font-display text-lg text-gold">Kirim Kado</p>
          <p className="text-cream/80">{WEDDING.giftAddress}</p>
        </div>
      </Section>

      <Section>
        <Title kicker="Konfirmasi Kehadiran">RSVP & Ucapan</Title>
        <Rsvp guest={guest} />
      </Section>

      <section className="relative px-6 pb-24 pt-10 text-center">
        <div className="absolute inset-0 bg-wine-grad opacity-20" />
        <motion.div {...reveal} className="relative">
          <img src={emblem.url} alt="S&L" className="mx-auto h-28" />
          <p className="mx-auto mt-6 max-w-md text-sm text-cream/80">
            Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir dan memberikan doa restu.
          </p>
          <p className="mt-4 font-script text-4xl text-gold-grad">{WEDDING.bride} & {WEDDING.groom}</p>
        </motion.div>
      </section>

      {lightbox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-night/95 p-4" onClick={() => setLightbox(null)}>
          <button className="absolute right-4 top-4 text-ivory" aria-label="Tutup">
            <X />
          </button>
          <img src={lightbox} alt="" className="max-h-full max-w-full rounded-xl" />
        </div>
      )}
    </main>
  );
}
