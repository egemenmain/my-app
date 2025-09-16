"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface ServiceSidebarProps {
    categories: string[];
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
    serviceCounts: Record<string, number>;
}

export default function ServiceSidebar({
    categories,
    selectedCategory,
    onCategorySelect,
    serviceCounts
}: ServiceSidebarProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <Card className="bg-white border border-border rounded-2xl">
            <CardHeader>
                <CardTitle className="flex items-center justify-between text-textPrimary">
                    <span>Kategoriler</span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-0 h-auto"
                    >
                        {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                        ) : (
                            <ChevronRight className="h-4 w-4" />
                        )}
                    </Button>
                </CardTitle>
            </CardHeader>
            {isExpanded && (
                <CardContent className="pt-0">
                    <div className="space-y-2">
                        <Button
                            variant={selectedCategory === "all" ? "default" : "ghost"}
                            className="w-full justify-between"
                            onClick={() => onCategorySelect("all")}
                        >
                            <span>Tümü</span>
                            <Badge variant="secondary">
                                {Object.values(serviceCounts).reduce((a, b) => a + b, 0)}
                            </Badge>
                        </Button>

                        {categories.map((category) => (
                            <Button
                                key={category}
                                variant={selectedCategory === category ? "default" : "ghost"}
                                className="w-full justify-between"
                                onClick={() => onCategorySelect(category)}
                            >
                                <span className="text-left">{category}</span>
                                <Badge variant="secondary">
                                    {serviceCounts[category] || 0}
                                </Badge>
                            </Button>
                        ))}
                    </div>
                </CardContent>
            )}
        </Card>
    );
}
