import { useState } from "react";
import {
    ClipboardList,
    Search,
    Trash2,
    ShieldCheck,
    Salad,
    Activity,
} from "lucide-react";

import api from "../api/client";
import useMasterData from "../hooks/useMasterData";
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
        { label: "Năng lượng", key: "energy_kcal", value: Number(nutrition?.energy_kcal || 0), color: "bg-emerald-500" },
        { label: "Protein", key: "protein_g", value: Number(nutrition?.protein_g || 0), color: "bg-teal-500" },
        { label: "Tinh bột", key: "carb_g", value: Number(nutrition?.carb_g || 0), color: "bg-amber-400" },
        { label: "Chất béo", key: "fat_g", value: Number(nutrition?.fat_g || 0), color: "bg-orange-400" },
        { label: "Natri", key: "sodium_mg", value: Number(nutrition?.sodium_mg || 0), color: "bg-rose-400" },
        { label: "Purin", key: "purine_mg", value: Number(nutrition?.purine_mg || 0), color: "bg-fuchsia-400" },
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

function ConclusionBanner({ diseaseName }) {
    return (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <div className="text-lg font-semibold">Đã tạo thực đơn gợi ý</div>
            <div className="text-sm mt-1">
                Hệ thống đã ghép thực đơn 1 ngày phù hợp hơn với bệnh lý{" "}
                <strong>{diseaseName}</strong>.
            </div>
        </div>
    );
}

function HealthScoreBlock({ healthScore }) {
    if (!healthScore) return null;

    const score = healthScore.score ?? 0;
    let barClass = "bg-rose-500";
    if (score >= 85) barClass = "bg-emerald-500";
    else if (score >= 70) barClass = "bg-teal-500";
    else if (score >= 50) barClass = "bg-amber-400";

    return (
        <SectionCard
            icon={ShieldCheck}
            title="Mức độ phù hợp"
            subtitle="Đánh giá tổng quan cho thực đơn 1 ngày"
        >
            <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                    <div className="text-4xl font-bold text-slate-800">{score}/100</div>
                    <div className="text-sm text-slate-500 mt-1">{healthScore.level}</div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <div className="text-slate-500">Phù hợp</div>
                        <div className="font-semibold">{healthScore.normal_count}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <div className="text-slate-500">Thấp</div>
                        <div className="font-semibold">{healthScore.low_count}</div>
                    </div>
                    <div className="rounded-2xl bg-slate-50 px-3 py-2">
                        <div className="text-slate-500">Cao</div>
                        <div className="font-semibold">{healthScore.high_count}</div>
                    </div>
                </div>
            </div>

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div className={`h-full ${barClass}`} style={{ width: `${score}%` }} />
            </div>
        </SectionCard>
    );
}

function NutritionChart({ nutrition }) {
    const items = buildChartItems(nutrition);
    const maxValue = Math.max(...items.map((i) => i.value), 1);

    return (
        <SectionCard
            icon={Activity}
            title="Biểu đồ dinh dưỡng chính"
            subtitle="Biểu diễn trực quan tổng dinh dưỡng của thực đơn 1 ngày"
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

function WarningPanel({ warnings = [] }) {
    return (
        <SectionCard
            title="Các điểm cần lưu ý"
            subtitle="Những chỉ số nên được theo dõi trong thực đơn"
        >
            {!warnings.length ? (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-700">
                    Không có cảnh báo đáng chú ý.
                </div>
            ) : (
                <ul className="space-y-3">
                    {warnings.map((warning, index) => (
                        <li
                            key={index}
                            className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800"
                        >
                            {warning}
                        </li>
                    ))}
                </ul>
            )}
        </SectionCard>
    );
}

export default function MealPlanPage() {
    const { diseases, loadingMasterData } = useMasterData();

    const [diseaseName, setDiseaseName] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handlePlan = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await api.post("/meal-plan", {
                disease_name: diseaseName,
            });
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không tạo được thực đơn.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setDiseaseName("");
        setData(null);
        setError("");
    };

    const plan = data?.meal_plan;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat label="Bệnh hỗ trợ" value={diseases.length} color="emerald" />
                <SummaryStat label="Chế độ" value="Thực đơn 1 ngày" color="blue" />
                <SummaryStat label="Bệnh đã chọn" value={diseaseName ? 1 : 0} color="amber" />
                <SummaryStat
                    label="Trạng thái"
                    value={plan ? "Đã tạo" : "Chờ nhập"}
                    color="teal"
                />
            </div>

            <SectionCard
                icon={ClipboardList}
                title="Gợi ý thực đơn 1 ngày"
                subtitle="Chọn bệnh lý để hệ thống đề xuất thực đơn phù hợp hơn trong ngày"
            >
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                            Bệnh lý
                        </label>
                        <select
                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                            value={diseaseName}
                            onChange={(e) => setDiseaseName(e.target.value)}
                        >
                            <option value="">Chọn bệnh</option>
                            {diseases.map((d) => (
                                <option key={d.id} value={d.name}>
                                    {d.id} - {d.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <DataHint value={diseaseName} options={diseases} label="Bệnh" />

                    <QuickExamples
                        title="Ví dụ gợi ý nhanh"
                        items={[
                            "Tăng huyết áp",
                            "Bệnh gút đơn thuần",
                            "Rối loạn lipid máu",
                        ]}
                        onPick={setDiseaseName}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handlePlan}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Search size={18} />
                            Tạo thực đơn
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
                        <p className="text-sm text-slate-500">Đang tải danh sách bệnh lý...</p>
                    )}
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}

            {!loading && !error && !plan && (
                <EmptyState message="Chọn bệnh lý để bắt đầu tạo thực đơn." />
            )}

            {plan && (
                <div className="space-y-6">
                    <ConclusionBanner diseaseName={data?.disease_name} />

                    <SectionCard
                        icon={Salad}
                        title="Thực đơn đề xuất"
                        subtitle="Các món được ghép để tạo thành thực đơn trong ngày"
                    >
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <div className="text-sm text-slate-500">Bữa sáng</div>
                                <div className="font-semibold text-slate-800 mt-1">{plan.breakfast}</div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <div className="text-sm text-slate-500">Bữa trưa</div>
                                <div className="font-semibold text-slate-800 mt-1">{plan.lunch}</div>
                            </div>
                            <div className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                                <div className="text-sm text-slate-500">Bữa tối</div>
                                <div className="font-semibold text-slate-800 mt-1">{plan.dinner}</div>
                            </div>
                        </div>
                    </SectionCard>

                    <HealthScoreBlock healthScore={plan.health_score} />

                    <NutritionChart nutrition={plan.total_nutrition} />

                    <SectionCard
                        icon={Activity}
                        title="Tổng dinh dưỡng cả ngày"
                        subtitle="Tổng hợp dinh dưỡng từ toàn bộ thực đơn đề xuất"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>Năng lượng: {formatNumber(plan.total_nutrition.energy_kcal)}</div>
                            <div>Protein: {formatNumber(plan.total_nutrition.protein_g)}</div>
                            <div>Tinh bột: {formatNumber(plan.total_nutrition.carb_g)}</div>
                            <div>Chất béo: {formatNumber(plan.total_nutrition.fat_g)}</div>
                            <div>Chất xơ: {formatNumber(plan.total_nutrition.fiber_g)}</div>
                            <div>Purin: {formatNumber(plan.total_nutrition.purine_mg)}</div>
                            <div>Natri: {formatNumber(plan.total_nutrition.sodium_mg)}</div>
                            <div>Kali: {formatNumber(plan.total_nutrition.potassium_mg)}</div>
                            <div>Cholesterol: {formatNumber(plan.total_nutrition.cholesterol_mg)}</div>
                            <div>Phospho: {formatNumber(plan.total_nutrition.phosphorus_mg)}</div>
                        </div>
                    </SectionCard>

                    <WarningPanel warnings={plan.warnings || []} />
                </div>
            )}
        </div>
    );
}