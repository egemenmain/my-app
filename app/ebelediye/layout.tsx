import EBelediyeSidebar from "@/components/ebelediye/Sidebar";

export default function EBelediyeLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sol Sidebar */}
                    <div className="lg:col-span-1">
                        <EBelediyeSidebar />
                    </div>

                    {/* Ana İçerik */}
                    <div className="lg:col-span-3">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}











