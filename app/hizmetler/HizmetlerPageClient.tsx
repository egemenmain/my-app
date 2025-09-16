"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Grid, List } from "lucide-react";
import ServiceCard from "@/components/services/ServiceCard";
import ServiceFilters from "@/components/services/ServiceFilters";
import ServiceSidebar from "@/components/services/ServiceSidebar";

interface Service {
    id: string;
    baslik: string;
    kategori: string;
    ozet: string;
    etiketler?: string[];
}

interface HizmetlerPageClientProps {
    services: Service[];
}

export default function HizmetlerPageClient({ services }: HizmetlerPageClientProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    // Kategorileri çıkar
    const categories = useMemo(() => {
        const cats = [...new Set(services.map(service => service.kategori))];
        return cats.sort();
    }, [services]);

    // Kategori başına hizmet sayısı
    const serviceCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        services.forEach(service => {
            counts[service.kategori] = (counts[service.kategori] || 0) + 1;
        });
        return counts;
    }, [services]);

    // Filtrelenmiş hizmetler
    const filteredServices = useMemo(() => {
        return services.filter(service => {
            const matchesSearch = searchTerm === "" ||
                service.baslik.toLowerCase().includes(searchTerm.toLowerCase()) ||
                service.ozet.toLowerCase().includes(searchTerm.toLowerCase()) ||
                (service.etiketler && service.etiketler.some(etiket =>
                    etiket.toLowerCase().includes(searchTerm.toLowerCase())
                ));

            const matchesCategory = selectedCategory === "all" ||
                service.kategori === selectedCategory;

            return matchesSearch && matchesCategory;
        });
    }, [services, searchTerm, selectedCategory]);

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <section className="bg-white border-b border-border py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold mb-6 text-textPrimary">
                            Hizmetlerimiz
                        </h1>
                        <p className="text-lg text-textMuted max-w-3xl mx-auto">
                            Vatandaşlarımıza sunduğumuz kapsamlı hizmetler
                        </p>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid lg:grid-cols-4 gap-8">
                        {/* Sidebar */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-24 space-y-6">
                                <ServiceSidebar
                                    categories={categories}
                                    selectedCategory={selectedCategory}
                                    onCategorySelect={setSelectedCategory}
                                    serviceCounts={serviceCounts}
                                />

                                <ServiceFilters
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    selectedCategory={selectedCategory}
                                    onCategoryChange={setSelectedCategory}
                                    categories={categories}
                                />
                            </div>
                        </div>

                        {/* Services Grid */}
                        <div className="lg:col-span-3">
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-2xl font-bold text-textPrimary">
                                        Hizmetler ({filteredServices.length})
                                    </h2>
                                    {searchTerm && (
                                        <p className="text-textMuted">
                                            &quot;{searchTerm}&quot; için arama sonuçları
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                    >
                                        <Grid className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>

                            {filteredServices.length > 0 ? (
                                <div className={`grid gap-6 ${viewMode === "grid"
                                    ? "md:grid-cols-2 xl:grid-cols-3"
                                    : "grid-cols-1"
                                    }`}>
                                    {filteredServices.map((service) => (
                                        <ServiceCard key={service.id} service={service} />
                                    ))}
                                </div>
                            ) : (
                                <Card className="bg-card border border-border rounded-2xl shadow-card">
                                    <CardContent className="py-12 text-center">
                                        <Search className="h-16 w-16 text-textMuted mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-textPrimary mb-2">
                                            Hizmet bulunamadı
                                        </h3>
                                        <p className="text-textMuted mb-4">
                                            Arama kriterlerinize uygun hizmet bulunmamaktadır.
                                        </p>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setSearchTerm("");
                                                setSelectedCategory("all");
                                            }}
                                        >
                                            Filtreleri Temizle
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
