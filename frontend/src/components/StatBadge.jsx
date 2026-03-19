export default function StatBadge({ label, value, color = "emerald" }) {
    const colorMap = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        blue: "bg-blue-50 text-blue-700 border-blue-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 ${colorMap[color]}`}>
            <div className="text-xs font-medium opacity-80">{label}</div>
            <div className="text-lg font-bold mt-1">{value}</div>
        </div>
    );
}