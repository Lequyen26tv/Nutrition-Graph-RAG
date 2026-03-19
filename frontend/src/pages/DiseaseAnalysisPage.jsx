import { useMemo, useState } from "react";
import {
    HeartPulse,
    Search,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    Salad,
    Activity,
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

function getStatusText(status) {
    if (status === "high") return "Cao";
    if (status === "low") return "Thấp";
    return "Phù hợp";
}

function getStatusClass(status) {
    if (status === "high") return "bg-rose-50 text-rose-700 border-rose-200";
    if (status === "low") return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-emerald-50 text-emerald-700 border-emerald-200";
}

function getLevelClass(level) {
    if (level === "Tốt") return "bg-emerald-500";
    if (level === "Khá") return "bg-teal-500";
    if (level === "Trung bình") return "bg-amber-400";
    return "bg-rose-500";
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

function ConclusionBanner({ healthScore, food, diseaseName, warningsCount }) {
    const score = healthScore?.score ?? 0;
    const level = healthScore?.level ?? "Chưa xác định";

    let typeClass = "bg-rose-50 border-rose-200 text-rose-800";
    let title = "Cần thận trọng";
    let desc = `Món ${food} có nhiều chỉ số cần lưu ý với bệnh ${diseaseName}.`;

    if (score >= 85) {
        typeClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
        title = "Mức phù hợp tốt";
        desc = `Món ${food} hiện tương đối phù hợp với bệnh ${diseaseName}.`;
    } else if (score >= 70) {
        typeClass = "bg-teal-50 border-teal-200 text-teal-800";
        title = "Có thể sử dụng";
        desc = `Món ${food} có thể sử dụng, nhưng vẫn nên theo dõi một số chỉ số dinh dưỡng.`;
    } else if (score >= 50) {
        typeClass = "bg-amber-50 border-amber-200 text-amber-800";
        title = "Cần cân nhắc";
        desc = `Món ${food} có một số điểm chưa thật sự tối ưu cho bệnh ${diseaseName}.`;
    }

    return (
        <div className={`rounded-3xl border p-5 ${typeClass}`}>
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <div className="text-lg font-semibold">{title}</div>
                    <div className="text-sm mt-1 opacity-90">{desc}</div>
                </div>

                <div className="rounded-2xl bg-white/70 px-4 py-3 min-w-[140px]">
                    <div className="text-xs opacity-70">Health score</div>
                    <div className="text-2xl font-bold">{score}/100</div>
                    <div className="text-sm">{level}</div>
                </div>
            </div>

            <div className="text-sm mt-4 opacity-90">
                Số cảnh báo hiện tại: <strong>{warningsCount}</strong>
            </div>
        </div>
    );
}

function HealthScoreBlock({ healthScore }) {
    if (!healthScore) return null;

    const score = healthScore.score ?? 0;
    const barClass = getLevelClass(healthScore.level);

    return (
        <SectionCard
            icon={ShieldCheck}
            title="Mức độ phù hợp"
            subtitle="Đánh giá tổng quan mức phù hợp của món ăn với bệnh lý đã chọn"
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
                                <div className={`h-full ${item.color}`} style={{ width: `${percent}%` }} />
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
            icon={AlertTriangle}
            title="Cảnh báo dinh dưỡng"
            subtitle="Các chỉ số cần chú ý khi sử dụng món ăn với bệnh lý đã chọn"
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

export default function DiseaseAnalysisPage() {
    const { foods, diseases, loadingMasterData } = useMasterData();

    const [foodName, setFoodName] = useState("");
    const [diseaseName, setDiseaseName] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleAnalyze = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await api.post("/analyze-food-with-disease", {
                food_name: foodName,
                disease_name: diseaseName,
            });
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không đánh giá được món ăn theo bệnh lý.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFoodName("");
        setDiseaseName("");
        setData(null);
        setError("");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat label="Món ăn hiện có" value={foods.length} color="emerald" />
                <SummaryStat label="Bệnh hỗ trợ" value={diseases.length} color="blue" />
                <SummaryStat label="Chế độ" value="Đánh giá theo bệnh" color="amber" />
                <SummaryStat label="Trạng thái" value={data ? "Đã phân tích" : "Chờ nhập"} color="teal" />
            </div>

            <SectionCard
                icon={HeartPulse}
                title="Đánh giá món ăn theo bệnh lý"
                subtitle="Chọn món ăn và bệnh để xem mức độ phù hợp, cảnh báo và chỉ số dinh dưỡng"
            >
                <div className="space-y-5">
                    <div className="grid lg:grid-cols-2 gap-4">
                        <AutocompleteInput
                            label="Món ăn"
                            value={foodName}
                            onChange={setFoodName}
                            options={foods}
                            placeholder="Nhập hoặc chọn món ăn"
                            listId="disease-foods-list"
                        />

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
                    </div>

                    <div className="grid lg:grid-cols-2 gap-4">
                        <DataHint value={foodName} options={foods} label="Món ăn" />
                        <DataHint value={diseaseName} options={diseases} label="Bệnh" />
                    </div>

                    <QuickExamples
                        title="Ví dụ gợi ý nhanh"
                        items={[
                            "Phở bò + Tăng huyết áp",
                            "Phở bò + Bệnh gút đơn thuần",
                            "Phở bò + Rối loạn lipid máu",
                        ]}
                        onPick={(value) => {
                            const [food, disease] = value.split(" + ");
                            setFoodName(food);
                            setDiseaseName(disease);
                        }}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleAnalyze}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Search size={18} />
                            Đánh giá
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
                        <p className="text-sm text-slate-500">Đang tải dữ liệu món ăn và bệnh lý...</p>
                    )}
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}

            {!loading && !error && !data && (
                <EmptyState message="Chọn món ăn và bệnh lý để bắt đầu đánh giá." />
            )}

            {data && (
                <div className="space-y-6">
                    <ConclusionBanner
                        healthScore={data.health_score}
                        food={data.food}
                        diseaseName={data.disease_name}
                        warningsCount={data.warnings?.length || 0}
                    />

                    <HealthScoreBlock healthScore={data.health_score} />

                    <WarningPanel warnings={data.warnings || []} />

                    <NutritionChart nutrition={data.nutrition} />

                    <SectionCard
                        icon={Salad}
                        title="Thành phần dinh dưỡng"
                        subtitle="Tổng hợp từ các nguyên liệu cấu thành món ăn"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div><strong>Món ăn:</strong> {data.food}</div>
                            <div><strong>Mã bệnh:</strong> {data.disease_id}</div>
                            <div><strong>Bệnh lý:</strong> {data.disease_name}</div>

                            <div>Năng lượng: {formatNumber(data.nutrition.energy_kcal)}</div>
                            <div>Protein: {formatNumber(data.nutrition.protein_g)}</div>
                            <div>Tinh bột: {formatNumber(data.nutrition.carb_g)}</div>
                            <div>Chất béo: {formatNumber(data.nutrition.fat_g)}</div>
                            <div>Chất xơ: {formatNumber(data.nutrition.fiber_g)}</div>
                            <div>Purin: {formatNumber(data.nutrition.purine_mg)}</div>
                            <div>Natri: {formatNumber(data.nutrition.sodium_mg)}</div>
                            <div>Kali: {formatNumber(data.nutrition.potassium_mg)}</div>
                            <div>Cholesterol: {formatNumber(data.nutrition.cholesterol_mg)}</div>
                            <div>Phospho: {formatNumber(data.nutrition.phosphorus_mg)}</div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={Activity}
                        title="Đánh giá chi tiết"
                        subtitle="So sánh từng chỉ số dinh dưỡng với ngưỡng bệnh lý"
                    >
                        <div className="overflow-auto">
                            <table className="w-full text-sm border-collapse min-w-[720px]">
                                <thead>
                                    <tr className="bg-slate-100">
                                        <th className="text-left p-3 rounded-l-2xl">Chỉ số</th>
                                        <th className="text-left p-3">Thực tế</th>
                                        <th className="text-left p-3">Ngưỡng thấp</th>
                                        <th className="text-left p-3">Ngưỡng cao</th>
                                        <th className="text-left p-3 rounded-r-2xl">Đánh giá</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.evaluations.map((item, idx) => (
                                        <tr key={idx} className="border-t border-slate-200">
                                            <td className="p-3 font-medium text-slate-700">{item.label}</td>
                                            <td className="p-3">{formatNumber(item.actual)}</td>
                                            <td className="p-3">{formatNumber(item.min)}</td>
                                            <td className="p-3">{formatNumber(item.max)}</td>
                                            <td className="p-3">
                                                <span className={`inline-flex px-3 py-1 rounded-full border text-xs font-medium ${getStatusClass(item.status)}`}>
                                                    {getStatusText(item.status)}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={ShieldCheck}
                        title="Khuyến nghị"
                        subtitle="Tóm tắt ngắn gọn để người dùng dễ hiểu"
                    >
                        <p className="text-slate-700 leading-7">
                            {data.advice}
                        </p>
                    </SectionCard>
                </div>
            )}
        </div>
    );
}