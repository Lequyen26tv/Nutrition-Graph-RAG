import { useMemo, useState } from "react";
import {
    UtensilsCrossed,
    Search,
    Trash2,
    Salad,
    Activity,
    ShieldCheck,
} from "lucide-react";

import api from "../api/client";
import useMasterData from "../hooks/useMasterData";
import AutocompleteInput from "../components/AutocompleteInput";
import DataHint from "../components/DataHint";
import QuickExamples from "../components/QuickExamples";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";

function formatNumber(value) {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "-";
    }
    return Number(value).toFixed(2);
}

function buildChartItems(nutrition) {
    return [
        {
            label: "Năng lượng",
            key: "energy_kcal",
            value: Number(nutrition?.energy_kcal || 0),
            color: "bg-emerald-500",
        },
        {
            label: "Protein",
            key: "protein_g",
            value: Number(nutrition?.protein_g || 0),
            color: "bg-teal-500",
        },
        {
            label: "Tinh bột",
            key: "carb_g",
            value: Number(nutrition?.carb_g || 0),
            color: "bg-amber-400",
        },
        {
            label: "Chất béo",
            key: "fat_g",
            value: Number(nutrition?.fat_g || 0),
            color: "bg-orange-400",
        },
        {
            label: "Natri",
            key: "sodium_mg",
            value: Number(nutrition?.sodium_mg || 0),
            color: "bg-rose-400",
        },
        {
            label: "Purin",
            key: "purine_mg",
            value: Number(nutrition?.purine_mg || 0),
            color: "bg-fuchsia-400",
        },
    ];
}

function SummaryStat({ label, value, color = "emerald" }) {
    const colorMap = {
        emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
        blue: "bg-sky-50 text-sky-700 border-sky-200",
        amber: "bg-amber-50 text-amber-700 border-amber-200",
        teal: "bg-teal-50 text-teal-700 border-teal-200",
    };

    return (
        <div className={`rounded-2xl border px-4 py-3 ${colorMap[color]}`}>
            <div className="text-xs font-medium opacity-80">{label}</div>
            <div className="text-lg font-bold mt-1">{value}</div>
        </div>
    );
}

function SectionCard({ icon: Icon, title, subtitle, children }) {
    return (
        <section className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start gap-3 mb-5">
                {Icon && (
                    <div className="p-3 rounded-2xl bg-emerald-100 text-emerald-700">
                        <Icon size={22} />
                    </div>
                )}
                <div>
                    <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
                    {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
                </div>
            </div>
            {children}
        </section>
    );
}

function ConclusionBanner({ food }) {
    return (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <div className="text-lg font-semibold">Đã phân tích xong món ăn</div>
            <div className="text-sm mt-1">
                Hệ thống đã tổng hợp thành phần dinh dưỡng hiện có của món <strong>{food}</strong>.
            </div>
        </div>
    );
}

function NutritionSummaryBlock({ nutrition }) {
    if (!nutrition) return null;

    return (
        <SectionCard
            icon={ShieldCheck}
            title="Tóm tắt nhanh"
            subtitle="Các chỉ số quan trọng nhất của món ăn"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Năng lượng</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(nutrition.energy_kcal)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Protein</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(nutrition.protein_g)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Tinh bột</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(nutrition.carb_g)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Chất béo</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(nutrition.fat_g)}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function NutritionChart({ nutrition }) {
    const items = useMemo(() => buildChartItems(nutrition), [nutrition]);
    const maxValue = Math.max(...items.map((i) => i.value), 1);

    return (
        <SectionCard
            icon={Activity}
            title="Biểu đồ dinh dưỡng chính"
            subtitle="Biểu diễn trực quan các thành phần nổi bật của món ăn"
        >
            <div className="space-y-4">
                {items.map((item) => {
                    const percent = (item.value / maxValue) * 100;
                    return (
                        <div key={item.key}>
                            <div className="flex items-center justify-between text-sm mb-1">
                                <span className="font-medium text-slate-700">{item.label}</span>
                                <span className="text-slate-500">{formatNumber(item.value)}</span>
                            </div>
                            <div className="h-3 bg-slate-200 rounded-full overflow-hidden">
                                <div
                                    className={`h-full ${item.color}`}
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </SectionCard>
    );
}

export default function FoodAnalysisPage() {
    const { foods, loadingMasterData } = useMasterData();

    const [foodName, setFoodName] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await api.post("/analyze-food", {
                food_name: foodName,
            });
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không phân tích được món ăn.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFoodName("");
        setData(null);
        setError("");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat label="Món ăn hiện có" value={foods.length} color="emerald" />
                <SummaryStat label="Chế độ" value="Phân tích món ăn" color="blue" />
                <SummaryStat label="Dữ liệu nhập" value={foodName ? 1 : 0} color="amber" />
                <SummaryStat label="Trạng thái" value={data ? "Đã phân tích" : "Chờ nhập"} color="teal" />
            </div>

            <SectionCard
                icon={UtensilsCrossed}
                title="Phân tích món ăn"
                subtitle="Chọn món ăn để xem thành phần dinh dưỡng hiện có trong dữ liệu"
            >
                <div className="space-y-5">
                    <AutocompleteInput
                        label="Món ăn"
                        value={foodName}
                        onChange={setFoodName}
                        options={foods}
                        placeholder="Nhập hoặc chọn món ăn"
                        listId="food-analysis-list"
                    />

                    <DataHint value={foodName} options={foods} label="Món ăn" />

                    <QuickExamples
                        title="Ví dụ gợi ý nhanh"
                        items={[
                            "Phở bò",
                            "Cơm trắng",
                            "Bún bò",
                            "Cháo gà",
                        ]}
                        onPick={setFoodName}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleAnalyze}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Search size={18} />
                            Phân tích
                        </button>

                        <button
                            onClick={clearForm}
                            className="px-5 py-3 rounded-2xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300 flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Xóa
                        </button>
                    </div>

                    {loadingMasterData && (
                        <p className="text-sm text-slate-500">Đang tải danh sách món ăn...</p>
                    )}
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}

            {!loading && !error && !data && (
                <EmptyState message="Chọn món ăn để bắt đầu phân tích." />
            )}

            {data && (
                <div className="space-y-6">
                    <ConclusionBanner food={data.food} />

                    <NutritionSummaryBlock nutrition={data} />

                    <NutritionChart nutrition={data} />

                    <SectionCard
                        icon={Salad}
                        title="Thành phần dinh dưỡng"
                        subtitle="Tổng hợp từ các nguyên liệu cấu thành món ăn"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div><strong>Món ăn:</strong> {data.food}</div>

                            <div>Năng lượng: {formatNumber(data.energy_kcal)}</div>
                            <div>Protein: {formatNumber(data.protein_g)}</div>
                            <div>Tinh bột: {formatNumber(data.carb_g)}</div>
                            <div>Chất béo: {formatNumber(data.fat_g)}</div>
                            <div>Chất xơ: {formatNumber(data.fiber_g)}</div>
                            <div>Purin: {formatNumber(data.purine_mg)}</div>
                            <div>Natri: {formatNumber(data.sodium_mg)}</div>
                            <div>Kali: {formatNumber(data.potassium_mg)}</div>
                            <div>Cholesterol: {formatNumber(data.cholesterol_mg)}</div>
                            <div>Phospho: {formatNumber(data.phosphorus_mg)}</div>
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
}