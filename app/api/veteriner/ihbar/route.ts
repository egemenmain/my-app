import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type Coords = { lat: number; lng: number };
type EmergencyType = "trafik" | "kanama" | "sıkışma" | "hasta" | "zehirlenme/yangın" | "yavru" | "diğer";
type AnimalType = "kedi" | "köpek" | "kuş" | "yaban" | "diğer";

export type Ihbar = {
    id: string;
    coords: Coords;
    adres?: string;
    zaman: string; // ISO
    tur: EmergencyType;
    hayvan: AnimalType;
    adet: number;
    aciklama?: string;
    foto?: string;
    adSoyad?: string;
    telefon?: string;
    kabulEdiyorum: boolean;
};

type DB = {
    version: number;
    updatedAt: string;
    pending: any[];
    approved: any[];
    ihbarlar: Ihbar[];
};

const DB_PATH = path.join(process.cwd(), "data", "veteriner.json");

async function readDB(): Promise<DB> {
    try {
        const raw = await fs.readFile(DB_PATH, "utf8");
        const parsed = JSON.parse(raw) as DB;
        parsed.ihbarlar ||= [];
        parsed.pending ||= [];
        parsed.approved ||= [];
        return parsed;
    } catch {
        const empty: DB = { version: 1, updatedAt: new Date().toISOString(), pending: [], approved: [], ihbarlar: [] };
        await fs.mkdir(path.dirname(DB_PATH), { recursive: true });
        await fs.writeFile(DB_PATH, JSON.stringify(empty, null, 2), "utf8");
        return empty;
    }
}

async function writeDB(db: DB) {
    db.updatedAt = new Date().toISOString();
    await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2), "utf8");
}

export async function GET() {
    const db = await readDB();
    // son 50’yi döndür
    return Response.json({ ihbarlar: db.ihbarlar.slice(0, 50), updatedAt: db.updatedAt });
}

/**
 * POST body:
 * { action: "create", ihbar: Ihbar }
 */
export async function POST(req: NextRequest) {
    const db = await readDB();
    const body = await req.json();
    if (String(body?.action) !== "create") {
        return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
    }
    const r = body?.ihbar as Partial<Ihbar>;
    const ihbar: Ihbar = {
        id: r.id || crypto.randomUUID(),
        coords: r.coords && typeof r.coords.lat === "number" && typeof r.coords.lng === "number" ? r.coords : { lat: 0, lng: 0 },
        adres: r.adres,
        zaman: r.zaman || new Date().toISOString(),
        tur: (["trafik", "kanama", "sıkışma", "hasta", "zehirlenme/yangın", "yavru", "diğer"].includes(String(r.tur)) ? r.tur! : "diğer") as any,
        hayvan: (["kedi", "köpek", "kuş", "yaban", "diğer"].includes(String(r.hayvan)) ? r.hayvan! : "diğer") as any,
        adet: typeof r.adet === "number" && r.adet > 0 ? r.adet : 1,
        aciklama: r.aciklama,
        foto: r.foto,
        adSoyad: r.adSoyad,
        telefon: r.telefon,
        kabulEdiyorum: !!r.kabulEdiyorum,
    };

    db.ihbarlar.unshift(ihbar);
    // dosyayı çok şişirmeyelim
    db.ihbarlar = db.ihbarlar.slice(0, 500);
    await writeDB(db);
    return Response.json({ ok: true, ihbarlar: db.ihbarlar.slice(0, 50), created: ihbar });
}
