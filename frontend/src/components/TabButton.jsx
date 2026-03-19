export default function TabButton({ active, label, onClick }) {
    return (
        <button
            onClick={onClick}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${active
                ? "bg-emerald-600 text-white shadow"
                : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50"
                }`}
        >
            {label}
        </button>
    );
}