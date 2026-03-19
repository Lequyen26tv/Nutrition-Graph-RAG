import useMasterData from "../hooks/useMasterData";
import StatBadge from "../components/StatBadge";
import PipelineCard from "../components/PipelineCard";
import QuickActionCard from "../components/QuickActionCard";
import EmptyState from "../components/EmptyState";
import {
    MessageSquareText,
    HeartPulse,
    CookingPot,
    Database,
    Activity,
    Salad,
} from "lucide-react";

export default function DashboardPage({ onNavigate }) {
    const { foods, ingredients, diseases, loadingMasterData } = useMasterData();

    if (loadingMasterData) {
        return <EmptyState message="Đang tải dữ liệu tổng quan hệ thống..." />;
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col gap-3">
                    <div className="inline-flex items-center gap-2 w-fit px-3 py-2 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-sm font-medium">
                        <Activity size={16} />
                        Dashboard tổng quan hệ thống
                    </div>

                    <h2 className="text-2xl font-bold text-slate-800">
                        Hệ thống hỗ trợ tư vấn dinh dưỡng bệnh nhân
                    </h2>

                    <p className="text-slate-600 max-w-3xl">
                        Dashboard này giúp quan sát nhanh dữ liệu hiện có trong Knowledge Graph,
                        điều hướng các chức năng chính, và hỗ trợ trình bày đồ án một cách trực quan, chuyên nghiệp.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <StatBadge label="Món ăn" value={foods.length} color="emerald" />
                <StatBadge label="Nguyên liệu" value={ingredients.length} color="blue" />
                <StatBadge label="Bệnh hỗ trợ" value={diseases.length} color="amber" />
                <StatBadge label="Chức năng chính" value={7} color="blue" />
            </div>

            <div className="grid xl:grid-cols-3 gap-6">
                <QuickActionCard
                    icon={MessageSquareText}
                    title="Hỏi đáp dinh dưỡng"
                    description="Nhập câu hỏi tiếng Việt để hệ thống nhận diện món ăn và bệnh lý."
                    buttonText="Mở hỏi tự nhiên"
                    onClick={() => onNavigate("ask")}
                />

                <QuickActionCard
                    icon={HeartPulse}
                    title="Phân tích theo bệnh"
                    description="Đánh giá mức độ phù hợp của món ăn theo từng nhóm bệnh."
                    buttonText="Mở phân tích bệnh"
                    onClick={() => onNavigate("disease")}
                />

                <QuickActionCard
                    icon={CookingPot}
                    title="Tính từ nguyên liệu"
                    description="Tính tổng dinh dưỡng từ các nguyên liệu người dùng chuẩn bị nấu."
                    buttonText="Mở tính nguyên liệu"
                    onClick={() => onNavigate("custom")}
                />
            </div>

            <div className="grid xl:grid-cols-2 gap-6">
                <PipelineCard />

                <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 mb-5">Phạm vi dữ liệu hiện tại</h3>

                    <div className="space-y-4 text-slate-700">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-blue-100 text-blue-700">
                                <Database size={18} />
                            </div>
                            <div>
                                <div className="font-medium">Nguồn dữ liệu</div>
                                <div className="text-sm text-slate-600">
                                    Neo4j Graph Database với Food, Ingredient, Disease và quan hệ CONTAINS.
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                                <Salad size={18} />
                            </div>
                            <div>
                                <div className="font-medium">Chức năng hỗ trợ ra quyết định</div>
                                <div className="text-sm text-slate-600">
                                    Hệ thống hiện hỗ trợ phân tích món ăn, đánh giá theo bệnh, gợi ý món thay thế và thực đơn 1 ngày.
                                </div>
                            </div>
                        </div>

                        <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
                            Dữ liệu hiện tại mang tính tham khảo học thuật, hỗ trợ minh họa logic hệ thống,
                            chưa thay thế tư vấn y khoa chuyên môn.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}