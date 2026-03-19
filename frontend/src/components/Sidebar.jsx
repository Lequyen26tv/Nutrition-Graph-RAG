import { X } from "lucide-react";

export default function Sidebar({
    tabs,
    activeTab,
    setActiveTab,
    sidebarOpen,
    setSidebarOpen,
}) {
    return (
        <>
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/40 z-30 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <aside
                className={`
          fixed top-0 left-0 h-full w-[290px] bg-white border-r border-slate-200 z-40
          transform transition-transform duration-300
          lg:static lg:h-auto lg:w-auto lg:rounded-3xl lg:border lg:shadow-sm
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
            >
                <div className="flex items-center justify-between p-4 border-b border-slate-200 lg:hidden">
                    <div>
                        <h2 className="font-semibold text-slate-800">Chức năng</h2>
                        <p className="text-xs text-slate-500">Chọn tác vụ muốn sử dụng</p>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="p-2 rounded-xl hover:bg-slate-100"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4 lg:p-5 space-y-4">
                    <div className="hidden lg:block">
                        <h2 className="text-lg font-semibold text-slate-800">Bảng điều khiển</h2>
                        <p className="text-sm text-slate-500 mt-1">
                            Chọn chức năng để phân tích và tư vấn dinh dưỡng.
                        </p>
                    </div>

                    <nav className="space-y-2">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const active = activeTab === tab.key;

                            return (
                                <button
                                    key={tab.key}
                                    onClick={() => setActiveTab(tab.key)}
                                    className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 text-left transition ${active
                                            ? "bg-emerald-600 text-white shadow"
                                            : "bg-slate-50 hover:bg-slate-100 text-slate-700"
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span className="font-medium text-sm">{tab.label}</span>
                                </button>
                            );
                        })}
                    </nav>

                    <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                        <h3 className="text-sm font-semibold text-slate-800">Mẹo sử dụng</h3>
                        <ul className="mt-2 text-sm text-slate-600 space-y-1">
                            <li>• Ưu tiên chọn từ gợi ý có sẵn</li>
                            <li>• Dùng tab “Hỏi tự nhiên” để demo nhanh</li>
                            <li>• Dùng tab “Theo bệnh” để xem cảnh báo chi tiết</li>
                        </ul>
                    </div>
                </div>
            </aside>
        </>
    );
}