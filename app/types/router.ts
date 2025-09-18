// Next.js 15 uyumluluğu için router tipleri
export type IdParams = Promise<{ id: string }>;
export type SlugParams = Promise<{ slug: string }>;
export type AnySearchParams = Promise<Record<string, string | string[] | undefined>>;

// Özel parametre tipleri
export type ServiceParams = Promise<{ id: string }>;
export type NewsParams = Promise<{ id: string }>;
export type EventParams = Promise<{ id: string }>;
export type JobParams = Promise<{ id: string }>;












