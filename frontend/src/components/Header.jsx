import { Menu, ShieldPlus } from "lucide-react";

export default function Header({ activeLabel, onOpenSidebar }) {
    return (
        <header className="bg-white/95 backdrop-blur border-b border-slate-200 sticky top-0 z-20">
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3 min-w-0">
                        <button
                            onClick={onOpenSidebar}
                            className="lg:hidden mt-1 p-2 rounded-xl border border-slate-200 hover:bg-slate-50"
                        >
                            <Menu size={18} />
                        </button>

                        <div className="p-2 rounded-2xl bg-emerald-100 text-emerald-700 hidden sm:block">
                            <ShieldPlus size={24} />
                        </div>

                        <div className="min-w-0">
                            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-800 truncate">
                                NGR - Patient Nutrition Knowledge Graph
                            </h1>
                            <p className="text-slate-600 text-xs sm:text-sm mt-1">
                                {activeLabel
                                    ? `Đang sử dụng: ${activeLabel}`
                                    : "Hệ thống hỗ trợ tư vấn dinh dưỡng bệnh nhân"}
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-200 px-3 py-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                        <span className="text-sm text-slate-600">Sẵn sàng demo</span>
                    </div>
                </div>
            </div>
        </header>
    );
}