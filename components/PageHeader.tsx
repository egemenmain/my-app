interface PageHeaderProps {
    title: string;
    subtitle?: string;
}

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
    return (
        <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-textPrimary mb-4">
                {title}
            </h1>
            {subtitle && (
                <p className="text-lg text-textMuted max-w-2xl mx-auto">
                    {subtitle}
                </p>
            )}
        </div>
    );
}













