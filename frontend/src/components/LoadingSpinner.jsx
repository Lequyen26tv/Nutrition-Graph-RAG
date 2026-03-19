export default function LoadingSpinner() {
    return (
        <div className="flex items-center gap-3 text-slate-600">
            <div className="w-5 h-5 border-2 border-slate-300 border-t-emerald-600 rounded-full animate-spin"></div>
            <span>Đang xử lý...</span>
        </div>
    );
}