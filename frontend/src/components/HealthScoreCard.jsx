export default function HealthScoreCard({ healthScore }) {
    if (!healthScore) return null;

    const { score, level } = healthScore;

    const color =
        level === "Tốt"
            ? "bg-emerald-500"
            : level === "Khá"
                ? "bg-teal-500"
                : level === "Trung bình"
                    ? "bg-amber-400"
                    : "bg-rose-500";

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">
                Mức độ phù hợp
            </h3>

            <div className="flex items-center justify-between mb-3">
                <div className="text-3xl font-bold text-slate-800">
                    {score}/100
                </div>
                <div className="text-sm font-medium text-slate-600">
                    {level}
                </div>
            </div>

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className={`${color} h-full`}
                    style={{ width: `${score}%` }}
                />
            </div>
        </div>
    );
}