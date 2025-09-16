import Image from "next/image";
export default function HeroBanner({ title, subtitle, imageSrc, imageAlt, chips = [] }: {
    title: string; subtitle?: string; imageSrc: string; imageAlt: string; chips?: string[];
}) {
    return (
        <section aria-labelledby="hero-title" className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-amber-50 via-white to-blue-50">
            <div className="grid gap-6 p-6 md:grid-cols-2 md:p-10">
                <div className="flex flex-col justify-center">
                    <h1 id="hero-title" className="text-3xl font-bold tracking-tight">{title}</h1>
                    {subtitle && <p className="mt-3 text-gray-700">{subtitle}</p>}
                    {!!chips.length && <div className="mt-4 flex flex-wrap gap-2">
                        {chips.map(c => <span key={c} className="inline-block rounded-full bg-gray-900/5 px-3 py-1 text-xs text-gray-700">{c}</span>)}
                    </div>}
                </div>
                <div className="relative aspect-[4/3] w-full md:aspect-[5/4]">
                    <Image src={imageSrc} alt={imageAlt} fill className="object-cover rounded-xl" priority />
                </div>
            </div>
        </section>
    );
}