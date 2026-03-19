export default function QuickActionCard({ title, description, buttonText, onClick, icon: Icon }) {
    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-start gap-3 mb-4">
                {Icon && (
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                        <Icon size={22} />
                    </div>
                )}

                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{description}</p>
                </div>
            </div>

            <button
                onClick={onClick}
                className="px-4 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700"
            >
                {buttonText}
            </button>
        </div>
    );
}