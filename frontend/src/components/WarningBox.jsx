export default function WarningBox({ warnings = [] }) {
    if (!warnings.length) {
        return (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                Không có cảnh báo đáng chú ý.
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <h4 className="font-semibold text-amber-800 mb-2">Cảnh báo</h4>
            <ul className="list-disc pl-5 space-y-1 text-amber-700">
                {warnings.map((item, index) => (
                    <li key={index}>{item}</li>
                ))}
            </ul>
        </div>
    );
}