import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

interface Service {
    id: string;
    baslik: string;
    kategori: string;
    ozet: string;
    etiketler?: string[];
}

interface ServiceCardProps {
    service: Service;
}

export default function ServiceCard({ service }: ServiceCardProps) {
    return (
        <Card className="bg-card border border-border rounded-2xl shadow-card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-2">
                    <Badge variant="secondary">
                        {service.kategori}
                    </Badge>
                </div>
                <CardTitle className="text-lg text-textPrimary line-clamp-2">
                    {service.baslik}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-textMuted text-sm line-clamp-3 mb-4">
                    {service.ozet}
                </p>

                {service.etiketler && service.etiketler.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                        {service.etiketler.slice(0, 3).map((etiket, index) => (
                            <span
                                key={index}
                                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded"
                            >
                                {etiket}
                            </span>
                        ))}
                        {service.etiketler.length > 3 && (
                            <span className="text-xs text-muted-foreground">
                                +{service.etiketler.length - 3} daha
                            </span>
                        )}
                    </div>
                )}

                <Link href={`/hizmetler/${service.id}`}>
                    <Button
                        variant="outline"
                        className="w-full"
                    >
                        Detayları Gör
                        <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </CardContent>
        </Card>
    );
}
