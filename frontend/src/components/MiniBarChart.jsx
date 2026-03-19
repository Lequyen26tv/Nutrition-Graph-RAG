const colorMap = {
    Energy: "bg-emerald-500",
    Protein: "bg-teal-500",
    Carb: "bg-amber-400",
    Fat: "bg-orange-400",
    Sodium: "bg-rose-400",
    Purin: "bg-fuchsia-400",
};

export default function MiniBarChart({ title, items = [] }) {
    const maxValue = Math.max(...items.map((i) => Number(i.value) || 0), 1);

    return (
        <div className="bg-white rounded-3xl border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">
                {title}
            </h3>

            <div className="space-y-4">
                {items.map((item, index) => {
                    const percent = (item.value / maxValue) * 100;

                    return (
                        <div key={index}>
                            <div className="flex justify-between text-sm mb-1">
                                <span>{item.label}</span>
                                <span>{item.value.toFixed(1)}</span>
                            </div>

                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${colorMap[item.label] || "bg-emerald-500"}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}