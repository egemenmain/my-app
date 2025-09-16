"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface ServiceFiltersProps {
    searchTerm: string;
    onSearchChange: (value: string) => void;
    selectedCategory: string;
    onCategoryChange: (value: string) => void;
    categories: string[];
}

export default function ServiceFilters({
    searchTerm,
    onSearchChange,
    selectedCategory,
    onCategoryChange,
    categories
}: ServiceFiltersProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold text-textPrimary">Filtreler</h3>
            </div>

            <div className="space-y-4">
                <div>
                    <label className="text-sm font-medium text-textPrimary mb-2 block">
                        Arama
                    </label>
                    <Input
                        placeholder="Hizmet ara..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-white border-border text-textPrimary placeholder:text-muted-foreground"
                    />
                </div>

                <div>
                    <label className="text-sm font-medium text-textPrimary mb-2 block">
                        Kategori
                    </label>
                    <Select value={selectedCategory} onValueChange={onCategoryChange}>
                        <SelectTrigger className="bg-white border-border text-textPrimary">
                            <SelectValue placeholder="Tüm kategoriler" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-border">
                            <SelectItem value="all" className="text-textPrimary hover:bg-muted">
                                Tüm kategoriler
                            </SelectItem>
                            {categories.map((category) => (
                                <SelectItem
                                    key={category}
                                    value={category}
                                    className="text-textPrimary hover:bg-muted"
                                >
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
        </div>
    );
}
