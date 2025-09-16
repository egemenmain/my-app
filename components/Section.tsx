import React from "react";

export default function Section({
    id,
    title,
    children,
}: {
    id: string;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-28">
            <h2 id={`${id}-title`} className="text-2xl font-semibold mb-4">{title}</h2>
            <div className="rounded-2xl border bg-white/70 p-5 shadow-sm hover:shadow-md transition">{children}</div>
        </section>
    );
}










