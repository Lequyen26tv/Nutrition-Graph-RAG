export default function QuickExamples({ title = "Ví dụ nhanh", items = [], onPick }) {
    if (!items.length) return null;

    return (
        <div className="space-y-2">
            <div className="text-sm font-semibold text-slate-700">{title}</div>
            <div className="flex flex-wrap gap-2">
                {items.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => onPick?.(item)}
                        className="px-3 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm hover:bg-slate-200"
                    >
                        {item}
                    </button>
                ))}
            </div>
        </div>
    );
}