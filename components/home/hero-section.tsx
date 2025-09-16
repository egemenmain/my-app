import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Building2, MessageSquare, Calendar } from "lucide-react";
import Link from "next/link";
import { tr } from "@/lib/i18n";

export default function HeroSection() {
    return (
        <div className="w-full bg-gradient-to-b from-[#FFFBEA] via-white to-white">
            <div className="container-narrow py-16 md:py-24">
                <div className="text-center">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-textPrimary mb-6">
                        {tr.home.hero.title}
                    </h1>
                    <p className="text-lg text-textMuted mb-12 max-w-3xl mx-auto">
                        {tr.home.hero.description}
                    </p>
                </div>

                {/* CTA Cards */}
                <div className="grid md:grid-cols-3 gap-8 mt-16">
                    <Card className="bg-card border border-border rounded-2xl shadow-card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8 text-center">
                            <Building2 className="h-16 w-16 mx-auto mb-6 text-primary" />
                            <h3 className="text-2xl font-bold mb-4 text-textPrimary">{tr.home.cta.eBelediye.title}</h3>
                            <p className="text-textMuted mb-6">
                                {tr.home.cta.eBelediye.description}
                            </p>
                            <Link href="/ebelediye">
                                <Button className="bg-primary hover:bg-primaryHover text-black">
                                    {tr.home.cta.eBelediye.button}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border rounded-2xl shadow-card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8 text-center">
                            <MessageSquare className="h-16 w-16 mx-auto mb-6 text-primary" />
                            <h3 className="text-2xl font-bold mb-4 text-textPrimary">{tr.home.cta.solution.title}</h3>
                            <p className="text-textMuted mb-6">
                                {tr.home.cta.solution.description}
                            </p>
                            <Link href="/cozum-merkezi">
                                <Button className="bg-primary hover:bg-primaryHover text-black">
                                    {tr.home.cta.solution.button}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-card border border-border rounded-2xl shadow-card hover:translate-y-[-2px] hover:shadow-lg transition-all duration-300">
                        <CardContent className="p-8 text-center">
                            <Calendar className="h-16 w-16 mx-auto mb-6 text-primary" />
                            <h3 className="text-2xl font-bold mb-4 text-textPrimary">{tr.home.cta.appointment.title}</h3>
                            <p className="text-textMuted mb-6">
                                {tr.home.cta.appointment.description}
                            </p>
                            <Link href="/randevu">
                                <Button className="bg-primary hover:bg-primaryHover text-black">
                                    {tr.home.cta.appointment.button}
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
