import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock } from "lucide-react";
import { tr } from "@/lib/i18n";

interface SystemStatusProps {
    systems: {
        name: string;
        status: "online" | "offline" | "maintenance";
        lastUpdate: string;
    }[];
}

export default function SystemStatus({ systems }: SystemStatusProps) {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case "online":
                return <CheckCircle className="h-5 w-5 text-green-500" />;
            case "offline":
                return <XCircle className="h-5 w-5 text-red-500" />;
            case "maintenance":
                return <Clock className="h-5 w-5 text-yellow-500" />;
            default:
                return <Clock className="h-5 w-5 text-gray-500" />;
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case "online":
                return tr.home.systemStatus.online;
            case "offline":
                return tr.home.systemStatus.offline;
            case "maintenance":
                return "Bakımda";
            default:
                return "Bilinmiyor";
        }
    };

    const getStatusVariant = (status: string) => {
        switch (status) {
            case "online":
                return "default";
            case "offline":
                return "destructive";
            case "maintenance":
                return "secondary";
            default:
                return "outline";
        }
    };

    return (
        <section className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-textPrimary mb-4">
                        {tr.home.systemStatus.title}
                    </h2>
                    <p className="text-textMuted">
                        Sistemlerimizin anlık durumu
                    </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    {systems.map((system, index) => (
                        <Card key={index} className="text-center bg-card border border-border rounded-2xl shadow-card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
                            <CardHeader className="pb-3">
                                <div className="flex justify-center mb-2">
                                    {getStatusIcon(system.status)}
                                </div>
                                <CardTitle className="text-lg text-textPrimary">{system.name}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <Badge variant={getStatusVariant(system.status)} className="mb-2">
                                    {getStatusText(system.status)}
                                </Badge>
                                <p className="text-sm text-textMuted">
                                    Son güncelleme: {system.lastUpdate}
                                </p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
