export default function EmptyState({ message }) {
    return (
        <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center text-slate-500">
            {message}
        </div>
    );
}