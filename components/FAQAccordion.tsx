"use client";
import React from "react";

export type FAQ = { q: string; a: React.ReactNode };

export default function FAQAccordion({ items }: { items: FAQ[] }) {
    return (
        <div className="divide-y">
            {items.map((item, idx) => (
                <details key={idx} className="group py-3">
                    <summary className="cursor-pointer list-none py-2 outline-none focus:ring-2 focus:ring-blue-400 rounded-lg">
                        <span className="font-medium">{item.q}</span>
                    </summary>
                    <div className="prose prose-sm max-w-none py-2 text-gray-700">{item.a}</div>
                </details>
            ))}
        </div>
    );
}












