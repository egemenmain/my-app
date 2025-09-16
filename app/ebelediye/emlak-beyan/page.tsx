import PageHeader from "@/components/PageHeader";

export default function EmlakBeyanPage() {
    return (
        <>
            {/* DialogFusion Live */}
            <script
                id="chat-init"
                src="https://app.dialogfusion.com/account/js/init.js?id=6505747"
            ></script>
            <div className="container-narrow py-8">
                <PageHeader
                    title="Emlak Beyan Oluşturma"
                    subtitle="E-Başvuru kapsamında emlak beyan işlemleri (demo)."
                />
                <p className="mt-6 text-textMuted">
                    Bu sayfa demo amaçlıdır. İçerik daha sonra doldurulacaktır.
                </p>
            </div>
        </>
    );
}











