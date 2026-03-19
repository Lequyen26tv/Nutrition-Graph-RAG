export default function DataHint({ value, options = [], label = "Dữ liệu" }) {
    if (!value || !value.trim()) return null;

    const exists = options.some((item) => {
        const text = typeof item === "string" ? item : item.name;
        return text?.trim().toLowerCase() === value.trim().toLowerCase();
    });

    if (exists) {
        return (
            <p className="text-sm text-emerald-600">
                {label} có trong dữ liệu.
            </p>
        );
    }

    return (
        <p className="text-sm text-amber-600">
            {label} chưa được đưa vào dữ liệu.
        </p>
    );
}