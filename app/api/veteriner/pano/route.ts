import { NextRequest } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PostType = "kayıp" | "bulundu";
type Sex = "erkek" | "dişi" | "bilinmiyor";
type PetType = "kedi" | "köpek" | "kuş" | "tavşan" | "diğer";
type DurumOnay = "pending" | "approved" | "rejected";

type Coords = { lat: number; lng: number };

export type PetPost = {
    id: string;
    durum: PostType;
    tur: PetType;
    isim?: string;
    cins?: string;
    yas?: string;
    cinsiyet?: Sex;
    renkAyirtici?: string;
    microchip?: string;
    sonGorulmeAdres?: string;
    sonGorulmeZaman?: string; // ISO
    coords?: Coords;
    aciklama?: string;
    foto?: string; // base64
    iletisim?: string; // telefon/email
    durumOnay: DurumOnay;
};

type DB = {
    version: number;
    updatedAt: string;
    pending: PetPost[];
    approved: PetPost[];
    ihbarlar: any[]; // diğer route yazıyor
};

const DB_PATH = path.join(process.cwd(), "data", "veteriner.json");

async function readDB(): Promise<DB> {
    try {
        const raw = await fs.readFile(DB_PATH, "utf8");
        const parsed = JSON.parse(raw) as DB;
        // emniyetli varsayılanlar
        parsed.pending ||= [];
        parsed.approved ||= [];
        parsed.ihbarlar ||= [];
        return parsed;
    } catch {
        const empty: DB = {
            version: 1,
            updatedAt: new Date().toISOString(),
            pending: [],
            approved: [],
            ihbarlar: [],
        };
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
    return Response.json({ pending: db.pending, approved: db.approved, updatedAt: db.updatedAt });
}

/**
 * POST body şekilleri:
 * { action: "create", post: PetPost }  -> pending'e ekler
 * { action: "approve", id: string }    -> pending'ten approved'a taşır
 * { action: "reject", id: string }     -> pending'ten siler
 * { action: "delete", id: string }     -> approved/pending'den siler
 */
export async function POST(req: NextRequest) {
    const db = await readDB();
    const body = await req.json();

    const action = String(body?.action || "");
    if (action === "create") {
        const p = body?.post as Partial<PetPost>;
        const newPost: PetPost = {
            id: p.id || crypto.randomUUID(),
            durum: (p.durum === "bulundu" ? "bulundu" : "kayıp"),
            tur: (["kedi", "köpek", "kuş", "tavşan", "diğer"].includes(String(p.tur)) ? p.tur! : "kedi") as PetType,
            isim: p.isim,
            cins: p.cins,
            yas: p.yas,
            cinsiyet: (["erkek", "dişi", "bilinmiyor"].includes(String(p.cinsiyet)) ? p.cinsiyet! : "bilinmiyor") as Sex,
            renkAyirtici: p.renkAyirtici,
            microchip: p.microchip,
            sonGorulmeAdres: p.sonGorulmeAdres,
            sonGorulmeZaman: p.sonGorulmeZaman || new Date().toISOString(),
            coords: p.coords && typeof p.coords.lat === "number" && typeof p.coords.lng === "number" ? p.coords : undefined,
            aciklama: p.aciklama,
            foto: p.foto,
            iletisim: p.iletisim,
            durumOnay: "pending",
        };
        db.pending.unshift(newPost);
        await writeDB(db);
        return Response.json({ ok: true, pending: db.pending, approved: db.approved, created: newPost });
    }

    const id = String(body?.id || "");
    const rmFrom = (arr: PetPost[]) => {
        const i = arr.findIndex((x) => x.id === id);
        return i >= 0 ? arr.splice(i, 1)[0] : undefined;
    };

    if (action === "approve") {
        const item = rmFrom(db.pending);
        if (!item) return Response.json({ ok: false, error: "not_found" }, { status: 404 });
        item.durumOnay = "approved";
        db.approved.unshift(item);
        await writeDB(db);
        return Response.json({ ok: true, pending: db.pending, approved: db.approved });
    }

    if (action === "reject") {
        rmFrom(db.pending);
        await writeDB(db);
        return Response.json({ ok: true, pending: db.pending, approved: db.approved });
    }

    if (action === "delete") {
        rmFrom(db.pending) || rmFrom(db.approved);
        await writeDB(db);
        return Response.json({ ok: true, pending: db.pending, approved: db.approved });
    }

    return Response.json({ ok: false, error: "unknown_action" }, { status: 400 });
}
