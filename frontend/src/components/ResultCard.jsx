export default function ResultCard({ title, children }) {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">{title}</h3>
            {children}
        </div>
    );
}