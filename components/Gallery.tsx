import Image from "next/image";
export type GalleryItem = { src: string; alt: string; caption?: string };
export default function Gallery({ items }: { items: GalleryItem[] }) {
    return <div className="rounded-2xl border bg-white/70 p-4 shadow-sm">
        <div className="flex gap-4 overflow-x-auto pb-2 md:hidden snap-x">
            {items.map((it, i) => <figure key={i} className="snap-start min-w-[80%]">
                <div className="relative aspect-[4/3] w-full"><Image src={it.src} alt={it.alt} fill className="rounded-xl object-cover" /></div>
                {it.caption && <figcaption className="mt-2 text-sm text-gray-600">{it.caption}</figcaption>}
            </figure>)}
        </div>
        <div className="hidden grid-cols-3 gap-4 md:grid">
            {items.map((it, i) => <figure key={i}>
                <div className="relative aspect-[4/3] w-full"><Image src={it.src} alt={it.alt} fill className="rounded-xl object-cover" /></div>
                {it.caption && <figcaption className="mt-2 text-sm text-gray-600">{it.caption}</figcaption>}
            </figure>)}
        </div>
    </div>;
}