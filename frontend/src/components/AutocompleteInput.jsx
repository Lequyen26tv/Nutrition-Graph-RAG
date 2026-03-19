export default function AutocompleteInput({
    label,
    value,
    onChange,
    options = [],
    placeholder = "",
    listId,
}) {
    return (
        <div className="space-y-2">
            {label && (
                <label className="block text-sm font-semibold text-slate-700">
                    {label}
                </label>
            )}

            <input
                type="text"
                list={listId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
            />

            <datalist id={listId}>
                {options.map((item, index) => {
                    const optionValue = typeof item === "string" ? item : item.name;
                    return <option key={index} value={optionValue} />;
                })}
            </datalist>
        </div>
    );
}