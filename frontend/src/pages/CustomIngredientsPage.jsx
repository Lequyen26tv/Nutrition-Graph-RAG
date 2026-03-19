import { useState } from "react";
import {
    CookingPot,
    Plus,
    Trash2,
    Calculator,
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

function buildChartItems(totalNutrition) {
    return [
        { label: "Năng lượng", key: "energy_kcal", value: Number(totalNutrition?.energy_kcal || 0), color: "bg-emerald-500" },
        { label: "Protein", key: "protein_g", value: Number(totalNutrition?.protein_g || 0), color: "bg-teal-500" },
        { label: "Tinh bột", key: "carb_g", value: Number(totalNutrition?.carb_g || 0), color: "bg-amber-400" },
        { label: "Chất béo", key: "fat_g", value: Number(totalNutrition?.fat_g || 0), color: "bg-orange-400" },
        { label: "Natri", key: "sodium_mg", value: Number(totalNutrition?.sodium_mg || 0), color: "bg-rose-400" },
        { label: "Purin", key: "purine_mg", value: Number(totalNutrition?.purine_mg || 0), color: "bg-fuchsia-400" },
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

function ConclusionBanner() {
    return (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <div className="text-lg font-semibold">Đã tính tổng dinh dưỡng</div>
            <div className="text-sm mt-1">
                Hệ thống đã cộng tổng dinh dưỡng từ các nguyên liệu bạn chuẩn bị nấu.
            </div>
        </div>
    );
}

function SummaryBlock({ totalNutrition }) {
    if (!totalNutrition) return null;

    return (
        <SectionCard
            icon={ShieldCheck}
            title="Tóm tắt nhanh"
            subtitle="Các chỉ số nổi bật của món tự tạo từ danh sách nguyên liệu"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Năng lượng</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(totalNutrition.energy_kcal)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Protein</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(totalNutrition.protein_g)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Tinh bột</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(totalNutrition.carb_g)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Chất béo</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(totalNutrition.fat_g)}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function NutritionChart({ totalNutrition }) {
    const items = buildChartItems(totalNutrition);
    const maxValue = Math.max(...items.map((i) => i.value), 1);

    return (
        <SectionCard
            icon={Activity}
            title="Biểu đồ dinh dưỡng chính"
            subtitle="Biểu diễn trực quan tổng dinh dưỡng của món tự tạo"
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

export default function CustomIngredientsPage() {
    const { ingredients, loadingMasterData } = useMasterData();

    const [items, setItems] = useState([{ ingredient_name: "", gram: "" }]);
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleItemChange = (index, field, value) => {
        const next = [...items];
        next[index][field] = value;
        setItems(next);
    };

    const addRow = () => {
        setItems([...items, { ingredient_name: "", gram: "" }]);
    };

    const removeRow = (index) => {
        const next = items.filter((_, i) => i !== index);
        setItems(next.length ? next : [{ ingredient_name: "", gram: "" }]);
    };

    const setExampleRecipe = () => {
        setItems([
            { ingredient_name: "Thịt bò", gram: "100" },
            { ingredient_name: "Khoai tây lát chiên", gram: "50" },
        ]);
    };

    const handleAnalyze = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const payload = {
                items: items
                    .filter((item) => item.ingredient_name && item.gram)
                    .map((item) => ({
                        ingredient_name: item.ingredient_name,
                        gram: Number(item.gram),
                    })),
            };

            const res = await api.post("/analyze-custom-ingredients", payload);
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không tính được tổng dinh dưỡng.");
        } finally {
            setLoading(false);
        }
    };

    const clearAll = () => {
        setItems([{ ingredient_name: "", gram: "" }]);
        setData(null);
        setError("");
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat label="Nguyên liệu hiện có" value={ingredients.length} color="emerald" />
                <SummaryStat label="Số dòng nhập" value={items.length} color="blue" />
                <SummaryStat label="Không tìm thấy" value={data?.not_found_count ?? 0} color="amber" />
                <SummaryStat
                    label="Trạng thái"
                    value={data ? "Đã tính" : "Chờ nhập"}
                    color="teal"
                />
            </div>

            <SectionCard
                icon={CookingPot}
                title="Tính dinh dưỡng từ nguyên liệu"
                subtitle="Nhập danh sách nguyên liệu và khối lượng để tính tổng dinh dưỡng của món bạn sắp nấu"
            >
                <div className="space-y-5">
                    <QuickExamples
                        title="Ví dụ gợi ý nhanh"
                        items={["Công thức mẫu: Thịt bò 100g + Khoai tây lát chiên 50g"]}
                        onPick={setExampleRecipe}
                    />

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div
                                key={index}
                                className="rounded-2xl border border-slate-200 p-4 bg-slate-50 space-y-3"
                            >
                                <div className="grid lg:grid-cols-[1fr_180px_auto] gap-3 items-end">
                                    <AutocompleteInput
                                        label={`Nguyên liệu ${index + 1}`}
                                        value={item.ingredient_name}
                                        onChange={(value) => handleItemChange(index, "ingredient_name", value)}
                                        options={ingredients}
                                        placeholder="Nhập hoặc chọn nguyên liệu"
                                        listId={`ingredient-row-${index}`}
                                    />

                                    <div className="space-y-2">
                                        <label className="block text-sm font-semibold text-slate-700">
                                            Khối lượng (gram)
                                        </label>
                                        <input
                                            type="number"
                                            className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500"
                                            placeholder="Ví dụ: 100"
                                            value={item.gram}
                                            onChange={(e) => handleItemChange(index, "gram", e.target.value)}
                                        />
                                    </div>

                                    <button
                                        onClick={() => removeRow(index)}
                                        className="px-4 py-3 rounded-2xl bg-red-500 text-white hover:bg-red-600 flex items-center justify-center gap-2"
                                    >
                                        <Trash2 size={18} />
                                        Xóa dòng
                                    </button>
                                </div>

                                <DataHint
                                    value={item.ingredient_name}
                                    options={ingredients}
                                    label="Nguyên liệu"
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={addRow}
                            className="px-5 py-3 rounded-2xl bg-slate-700 text-white hover:bg-slate-800 flex items-center gap-2"
                        >
                            <Plus size={18} />
                            Thêm nguyên liệu
                        </button>

                        <button
                            onClick={handleAnalyze}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Calculator size={18} />
                            Tính tổng dinh dưỡng
                        </button>

                        <button
                            onClick={clearAll}
                            className="px-5 py-3 rounded-2xl bg-slate-200 text-slate-700 hover:bg-slate-300 flex items-center gap-2"
                        >
                            <Trash2 size={18} />
                            Xóa tất cả
                        </button>
                    </div>

                    {loadingMasterData && (
                        <p className="text-sm text-slate-500">
                            Đang tải danh sách nguyên liệu...
                        </p>
                    )}
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}

            {!loading && !error && !data && (
                <EmptyState message="Nhập nguyên liệu và khối lượng để bắt đầu tính toán." />
            )}

            {data && (
                <div className="space-y-6">
                    <ConclusionBanner />

                    <SummaryBlock totalNutrition={data.total_nutrition} />

                    <NutritionChart totalNutrition={data.total_nutrition} />

                    <SectionCard
                        icon={Salad}
                        title="Tổng dinh dưỡng món tự tạo"
                        subtitle="Tổng hợp dinh dưỡng từ toàn bộ nguyên liệu đã nhập"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div>Năng lượng: {formatNumber(data.total_nutrition.energy_kcal)}</div>
                            <div>Protein: {formatNumber(data.total_nutrition.protein_g)}</div>
                            <div>Tinh bột: {formatNumber(data.total_nutrition.carb_g)}</div>
                            <div>Chất béo: {formatNumber(data.total_nutrition.fat_g)}</div>
                            <div>Chất xơ: {formatNumber(data.total_nutrition.fiber_g)}</div>
                            <div>Purin: {formatNumber(data.total_nutrition.purine_mg)}</div>
                            <div>Natri: {formatNumber(data.total_nutrition.sodium_mg)}</div>
                            <div>Kali: {formatNumber(data.total_nutrition.potassium_mg)}</div>
                            <div>Cholesterol: {formatNumber(data.total_nutrition.cholesterol_mg)}</div>
                            <div>Phospho: {formatNumber(data.total_nutrition.phosphorus_mg)}</div>
                            <div>Canxi: {formatNumber(data.total_nutrition.calcium_mg)}</div>
                            <div>Sắt: {formatNumber(data.total_nutrition.iron_mg)}</div>
                        </div>
                    </SectionCard>

                    <SectionCard
                        icon={Activity}
                        title="Chi tiết theo từng nguyên liệu"
                        subtitle="Mức đóng góp dinh dưỡng của từng nguyên liệu trong công thức"
                    >
                        <div className="space-y-4">
                            {data.ingredients.map((item, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-2xl border border-slate-200 p-4 bg-slate-50"
                                >
                                    <div className="font-semibold text-slate-800">
                                        {item.ingredient_name} - {item.gram}g
                                    </div>
                                    <div className="text-sm text-slate-500 mt-1">
                                        Nhóm: {item.category || "-"}
                                    </div>

                                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-4 text-sm">
                                        <div>Năng lượng: {formatNumber(item.contribution.energy_kcal)}</div>
                                        <div>Protein: {formatNumber(item.contribution.protein_g)}</div>
                                        <div>Tinh bột: {formatNumber(item.contribution.carb_g)}</div>
                                        <div>Chất béo: {formatNumber(item.contribution.fat_g)}</div>
                                        <div>Chất xơ: {formatNumber(item.contribution.fiber_g)}</div>
                                        <div>Natri: {formatNumber(item.contribution.sodium_mg)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </SectionCard>

                    {data.not_found_count > 0 && (
                        <SectionCard
                            title="Nguyên liệu chưa có trong dữ liệu"
                            subtitle="Một số nguyên liệu chưa được hệ thống nhận diện"
                        >
                            <div className="flex flex-wrap gap-2">
                                {data.not_found_ingredients.map((name, idx) => (
                                    <span
                                        key={idx}
                                        className="inline-flex px-3 py-2 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-sm"
                                    >
                                        {name}
                                    </span>
                                ))}
                            </div>
                        </SectionCard>
                    )}
                </div>
            )}
        </div>
    );
}