export default function ConclusionBanner({ type = "info", title, description }) {
    const styles = {
        good: "bg-emerald-50 border-emerald-200 text-emerald-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800",
        bad: "bg-rose-50 border-rose-200 text-rose-800",
        info: "bg-blue-50 border-blue-200 text-blue-800",
    };

    return (
        <div className={`rounded-3xl border p-5 ${styles[type]}`}>
            <div className="font-semibold text-base">{title}</div>
            <div className="text-sm mt-1 opacity-90">{description}</div>
        </div>
    );
}