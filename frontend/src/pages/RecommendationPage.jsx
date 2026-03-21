import { useState } from "react";
import {
    Sparkles,
    Search,
    Trash2,
    ShieldCheck,
    AlertTriangle,
    UtensilsCrossed,
    HeartPulse,
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
    return (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <div className="text-lg font-semibold">Đã tìm thấy món phù hợp hơn</div>
            <div className="text-sm mt-1">
                Hệ thống đã so sánh món <strong>{data?.current_food}</strong> với các lựa chọn khác
                để gợi ý món phù hợp hơn với bệnh lý hiện tại.
            </div>
        </div>
    );
}

function ScoreBadge({ score, level }) {
    return (
        <div className="rounded-2xl bg-white border border-slate-200 px-4 py-3">
            <div className="text-xs text-slate-500">Điểm phù hợp</div>
            <div className="text-2xl font-bold text-slate-800">{score ?? "-"}</div>
            <div className="text-sm text-slate-500">{level || "-"}</div>
        </div>
    );
}

function CurrentFoodBlock({ data }) {
    return (
        <SectionCard
            icon={UtensilsCrossed}
            title="Món ăn hiện tại"
            subtitle="Thông tin món ăn đang được dùng để so sánh"
        >
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                <div><strong>Tên món:</strong> {data.current_food}</div>
                <div><strong>Điểm phù hợp:</strong> {data.current_food_health_score?.score}</div>
                <div><strong>Mức đánh giá:</strong> {data.current_food_health_score?.level}</div>
            </div>
        </SectionCard>
    );
}

function WarningPanel({ warnings = [] }) {
    return (
        <SectionCard
            icon={AlertTriangle}
            title="Các điểm cần lưu ý"
            subtitle="Những lý do khiến món ăn hiện tại chưa thật sự tối ưu"
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

export default function RecommendationPage() {
    const { foods, diseases, loadingMasterData } = useMasterData();

    const [foodName, setFoodName] = useState("");
    const [diseaseName, setDiseaseName] = useState("");
    const [limit, setLimit] = useState(5);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleRecommend = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await api.post("/recommend-food", {
                food_name: foodName,
                disease_name: diseaseName,
                limit: Number(limit),
            });
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không gợi ý được món phù hợp.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setFoodName("");
        setDiseaseName("");
        setLimit(5);
        setData(null);
        setError("");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat label="Món ăn hiện có" value={foods.length} color="emerald" />
                <SummaryStat label="Bệnh hỗ trợ" value={diseases.length} color="blue" />
                <SummaryStat label="Số gợi ý" value={limit} color="amber" />
                <SummaryStat
                    label="Trạng thái"
                    value={data ? "Đã gợi ý" : "Chờ nhập"}
                    color="teal"
                />
            </div>

            <SectionCard
                icon={Sparkles}
                title="Gợi ý món phù hợp hơn"
                subtitle="So sánh món ăn hiện tại với các lựa chọn khác để tìm món phù hợp hơn với bệnh lý"
            >
                <div className="space-y-5">
                    <div className="grid lg:grid-cols-[1fr_1fr_140px] gap-4">
                        <AutocompleteInput
                            label="Món ăn hiện tại"
                            value={foodName}
                            onChange={setFoodName}
                            options={foods}
                            placeholder="Nhập hoặc chọn món ăn"
                            listId="recommend-food-list"
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

                        <div className="space-y-2">
                            <label className="block text-sm font-semibold text-slate-700">
                                Số lượng
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="10"
                                className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                value={limit}
                                onChange={(e) => setLimit(e.target.value)}
                            />
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
                            onClick={handleRecommend}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Search size={18} />
                            Gợi ý món
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
                        <p className="text-sm text-slate-500">
                            Đang tải dữ liệu món ăn và bệnh lý...
                        </p>
                    )}
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}

            {!loading && !error && !data && (
                <EmptyState message="Chọn món ăn và bệnh lý để nhận gợi ý phù hợp hơn." />
            )}

            {data && (
                <div className="space-y-6">
                    <ConclusionBanner data={data} />

                    <CurrentFoodBlock data={data} />

                    <WarningPanel warnings={data.current_food_warnings || []} />

                    <SectionCard
                        icon={HeartPulse}
                        title="Danh sách món phù hợp hơn"
                        subtitle="Các món được sắp xếp theo mức độ phù hợp tốt hơn trong dữ liệu hiện có"
                    >
                        <div className="grid md:grid-cols-2 gap-4">
                            {data.recommendations?.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-3"
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div>
                                            <div className="font-semibold text-slate-800">{item.food}</div>
                                            <div className="text-sm text-slate-500 mt-1">
                                                Chỉ số cao: {item.high_violations} · Chỉ số thấp: {item.low_violations}
                                            </div>
                                        </div>

                                        <ScoreBadge
                                            score={item.health_score?.score}
                                            level={item.health_score?.level}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                                        <div>Năng lượng: {formatNumber(item.nutrition?.energy_kcal)}</div>
                                        <div>Protein: {formatNumber(item.nutrition?.protein_g)}</div>
                                        <div>Tinh bột: {formatNumber(item.nutrition?.carb_g)}</div>
                                        <div>Chất béo: {formatNumber(item.nutrition?.fat_g)}</div>
                                    </div>

                                    {item.warnings?.length > 0 && (
                                        <div className="space-y-2">
                                            {item.warnings.slice(0, 3).map((warning, wIdx) => (
                                                <div
                                                    key={wIdx}
                                                    className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                                                >
                                                    {warning}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
}
