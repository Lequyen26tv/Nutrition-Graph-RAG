import { useMemo, useState } from "react";
import {
    MessageSquareText,
    Send,
    ShieldCheck,
    AlertTriangle,
    Salad,
    Activity,
} from "lucide-react";

import api from "../api/client";
import LoadingSpinner from "../components/LoadingSpinner";
import EmptyState from "../components/EmptyState";
import QuickExamples from "../components/QuickExamples";

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

function ConclusionBanner({ data }) {
    const score = data?.health_score?.score ?? 0;
    const hasDisease = Boolean(data?.disease_name);

    let typeClass = "bg-sky-50 border-sky-200 text-sky-800";
    let title = "Đã phân tích xong";
    let desc = `Hệ thống đã nhận diện món ${data.food || "-"} từ câu hỏi của bạn.`;

    if (hasDisease) {
        typeClass = "bg-rose-50 border-rose-200 text-rose-800";
        title = "Cần thận trọng";
        desc = `Món ${data.food} cần được cân nhắc với bệnh ${data.disease_name}.`;

        if (score >= 85) {
            typeClass = "bg-emerald-50 border-emerald-200 text-emerald-800";
            title = "Mức phù hợp tốt";
            desc = `Món ${data.food} phù hợp với bệnh ${data.disease_name}.`;
        } else if (score >= 70) {
            typeClass = "bg-teal-50 border-teal-200 text-teal-800";
            title = "Có thể sử dụng";
            desc = `Món ${data.food} có thể sử dụng, cần theo dõi thêm.`;
        } else if (score >= 50) {
            typeClass = "bg-amber-50 border-amber-200 text-amber-800";
            title = "Cần cân nhắc";
            desc = `Món ${data.food} có một số điểm chưa tối ưu cho bệnh ${data.disease_name}.`;
        }
    }

    return (
        <div className={`rounded-3xl border p-5 ${typeClass}`}>
            <div className="text-lg font-semibold">{title}</div>
            <div className="text-sm mt-1">{desc}</div>
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
            subtitle="Đánh giá tổng quan"
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
            title="Biểu đồ dinh dưỡng"
            subtitle="Biểu diễn trực quan các thành phần nổi bật"
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
            subtitle="Các điểm cần lưu ý từ kết quả phân tích"
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

export default function AskPage() {
    const [question, setQuestion] = useState("");
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleAsk = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await api.post("/ask", { question });
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không xử lý được câu hỏi.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setQuestion("");
        setData(null);
        setError("");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat label="Chế độ" value="Hỏi đáp dinh dưỡng" color="emerald" />
                <SummaryStat label="Câu hỏi" value={question ? 1 : 0} color="blue" />
                <SummaryStat label="Cảnh báo" value={data?.warnings?.length || 0} color="amber" />
                <SummaryStat label="Trạng thái" value={data ? "Đã phân tích" : "Chờ nhập"} color="teal" />
            </div>

            <SectionCard
                icon={MessageSquareText}
                title="Hỏi đáp dinh dưỡng"
                subtitle="Nhập câu hỏi để hệ thống phân tích món ăn và bệnh lý liên quan"
            >
                <div className="space-y-5">
                    <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-700">
                            Câu hỏi của bạn
                        </label>
                        <textarea
                            className="w-full border border-slate-300 rounded-2xl p-4 outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
                            placeholder="Ví dụ: Người tăng huyết áp có nên ăn phở bò không?"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

                    <QuickExamples
                        title="Ví dụ gợi ý nhanh"
                        items={[
                            "Người tăng huyết áp có nên ăn phở bò không?",
                            "Cho tôi biết dinh dưỡng của phở bò",
                            "Người rối loạn lipid máu có nên ăn phở bò không?"
                        ]}
                        onPick={setQuestion}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleAsk}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Send size={18} />
                            Gửi câu hỏi
                        </button>

                        <button
                            onClick={clearForm}
                            className="px-5 py-3 rounded-2xl bg-slate-200 text-slate-700 font-medium hover:bg-slate-300"
                        >
                            Xóa
                        </button>
                    </div>
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}
            {!data && !loading && <EmptyState message="Nhập câu hỏi để bắt đầu phân tích." />}

            {data && (
                <>
                    <ConclusionBanner data={data} />

                    <SectionCard
                        icon={MessageSquareText}
                        title="Thông tin nhận diện"
                        subtitle="Kết quả hệ thống hiểu được từ câu hỏi của bạn"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div><strong>Câu hỏi:</strong> {data.question}</div>
                            <div><strong>Món ăn:</strong> {data.food || "-"}</div>
                            <div><strong>Bệnh lý:</strong> {data.disease_name || "Chưa xác định"}</div>
                        </div>
                    </SectionCard>

                    <HealthScoreBlock healthScore={data.health_score} />

                    <WarningPanel warnings={data.warnings || []} />

                    {data.nutrition && <NutritionChart nutrition={data.nutrition} />}

                    {data.nutrition && (
                        <SectionCard
                            icon={Salad}
                            title="Thành phần dinh dưỡng"
                            subtitle="Tổng hợp từ dữ liệu hiện có về món ăn"
                        >
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                                <div><strong>Món ăn:</strong> {data.food}</div>

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
                    )}

                    {data.evaluations?.length > 0 && (
                        <SectionCard
                            icon={Activity}
                            title="Đánh giá chi tiết"
                            subtitle="So sánh từng chỉ số với ngưỡng dinh dưỡng liên quan"
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
                    )}

                    {data.recommendations?.length > 0 && (
                        <SectionCard
                            icon={ShieldCheck}
                            title="Gợi ý món phù hợp hơn"
                            subtitle="Một số lựa chọn thay thế có mức phù hợp tốt hơn trong dữ liệu hiện có"
                        >
                            <div className="grid md:grid-cols-2 gap-4">
                                {data.recommendations.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="rounded-2xl border border-slate-200 p-4 bg-slate-50"
                                    >
                                        <div className="font-semibold text-slate-800">{item.food}</div>
                                        <div className="text-sm text-slate-600 mt-2">
                                            Điểm phù hợp: {item.health_score?.score} / 100
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            Mức đánh giá: {item.health_score?.level}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            Chỉ số cao: {item.high_violations}
                                        </div>
                                        <div className="text-sm text-slate-600">
                                            Chỉ số thấp: {item.low_violations}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </SectionCard>
                    )}

                    {data.advice && (
                        <SectionCard
                            icon={ShieldCheck}
                            title="Khuyến nghị"
                            subtitle="Tóm tắt ngắn gọn để người dùng dễ hiểu"
                        >
                            <p className="text-slate-700 leading-7">{data.advice}</p>
                        </SectionCard>
                    )}

                    {data.message && (
                        <SectionCard
                            icon={AlertTriangle}
                            title="Thông báo"
                            subtitle="Thông tin bổ sung từ hệ thống"
                        >
                            <p className="text-slate-700 leading-7">{data.message}</p>
                        </SectionCard>
                    )}
                </>
            )}
        </div>
    );
}