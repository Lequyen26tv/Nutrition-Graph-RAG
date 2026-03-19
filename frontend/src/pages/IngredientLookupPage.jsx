import { useMemo, useState } from "react";
import {
    Carrot,
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

function buildChartItems(ingredient) {
    return [
        {
            label: "Năng lượng",
            key: "energy_kcal",
            value: Number(ingredient?.energy_kcal || 0),
            color: "bg-emerald-500",
        },
        {
            label: "Protein",
            key: "protein_g",
            value: Number(ingredient?.protein_g || 0),
            color: "bg-teal-500",
        },
        {
            label: "Tinh bột",
            key: "carb_g",
            value: Number(ingredient?.carb_g || 0),
            color: "bg-amber-400",
        },
        {
            label: "Chất béo",
            key: "fat_g",
            value: Number(ingredient?.fat_g || 0),
            color: "bg-orange-400",
        },
        {
            label: "Natri",
            key: "sodium_mg",
            value: Number(ingredient?.sodium_mg || 0),
            color: "bg-rose-400",
        },
        {
            label: "Purin",
            key: "purine_mg",
            value: Number(ingredient?.purine_mg || 0),
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

function ConclusionBanner({ ingredient }) {
    return (
        <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-800">
            <div className="text-lg font-semibold">Đã tìm thấy nguyên liệu</div>
            <div className="text-sm mt-1">
                Hệ thống đã tải thông tin dinh dưỡng hiện có của nguyên liệu{" "}
                <strong>{ingredient?.name}</strong>.
            </div>
        </div>
    );
}

function IngredientSummaryBlock({ ingredient }) {
    if (!ingredient) return null;

    return (
        <SectionCard
            icon={ShieldCheck}
            title="Tóm tắt nhanh"
            subtitle="Các chỉ số nổi bật của nguyên liệu trên 100g"
        >
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Năng lượng</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(ingredient.energy_kcal)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Protein</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(ingredient.protein_g)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Tinh bột</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(ingredient.carb_g)}
                    </div>
                </div>

                <div className="rounded-2xl bg-slate-50 p-4">
                    <div className="text-sm text-slate-500">Chất béo</div>
                    <div className="text-xl font-bold text-slate-800 mt-1">
                        {formatNumber(ingredient.fat_g)}
                    </div>
                </div>
            </div>
        </SectionCard>
    );
}

function IngredientChart({ ingredient }) {
    const items = useMemo(() => buildChartItems(ingredient), [ingredient]);
    const maxValue = Math.max(...items.map((i) => i.value), 1);

    return (
        <SectionCard
            icon={Activity}
            title="Biểu đồ dinh dưỡng chính"
            subtitle="Biểu diễn trực quan các thành phần nổi bật của nguyên liệu"
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

export default function IngredientLookupPage() {
    const { ingredients, loadingMasterData } = useMasterData();

    const [ingredientName, setIngredientName] = useState("");
    const [data, setData] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLookup = async () => {
        setLoading(true);
        setError("");
        setData(null);

        try {
            const res = await api.get(
                `/ingredient-nutrition/${encodeURIComponent(ingredientName)}`
            );
            setData(res.data);
        } catch (err) {
            setError(err?.response?.data?.detail || "Không tra cứu được nguyên liệu.");
        } finally {
            setLoading(false);
        }
    };

    const clearForm = () => {
        setIngredientName("");
        setData(null);
        setError("");
    };

    const ingredient = data?.ingredient;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                <SummaryStat
                    label="Nguyên liệu hiện có"
                    value={ingredients.length}
                    color="emerald"
                />
                <SummaryStat
                    label="Chế độ"
                    value="Xem dinh dưỡng nguyên liệu"
                    color="blue"
                />
                <SummaryStat
                    label="Dữ liệu nhập"
                    value={ingredientName ? 1 : 0}
                    color="amber"
                />
                <SummaryStat
                    label="Trạng thái"
                    value={ingredient ? "Đã tìm thấy" : "Chờ nhập"}
                    color="teal"
                />
            </div>

            <SectionCard
                icon={Carrot}
                title="Xem dinh dưỡng nguyên liệu"
                subtitle="Chọn nguyên liệu để xem thông tin dinh dưỡng hiện có trong dữ liệu"
            >
                <div className="space-y-5">
                    <AutocompleteInput
                        label="Nguyên liệu"
                        value={ingredientName}
                        onChange={setIngredientName}
                        options={ingredients}
                        placeholder="Nhập hoặc chọn nguyên liệu"
                        listId="ingredient-lookup-list"
                    />

                    <DataHint
                        value={ingredientName}
                        options={ingredients}
                        label="Nguyên liệu"
                    />

                    <QuickExamples
                        title="Ví dụ gợi ý nhanh"
                        items={[
                            "Khoai tây lát chiên",
                            "Thịt bò",
                            "Rau muống",
                            "Cà chua",
                        ]}
                        onPick={setIngredientName}
                    />

                    <div className="flex flex-wrap gap-3">
                        <button
                            onClick={handleLookup}
                            className="px-5 py-3 rounded-2xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 flex items-center gap-2"
                        >
                            <Search size={18} />
                            Tra cứu
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
                            Đang tải danh sách nguyên liệu...
                        </p>
                    )}
                </div>
            </SectionCard>

            {loading && <LoadingSpinner />}
            {error && <div className="text-rose-600 font-medium">{error}</div>}

            {!loading && !error && !ingredient && (
                <EmptyState message="Chọn nguyên liệu để bắt đầu tra cứu." />
            )}

            {ingredient && (
                <div className="space-y-6">
                    <ConclusionBanner ingredient={ingredient} />

                    <IngredientSummaryBlock ingredient={ingredient} />

                    <IngredientChart ingredient={ingredient} />

                    <SectionCard
                        icon={Salad}
                        title="Thành phần dinh dưỡng"
                        subtitle="Thông tin hiện có của nguyên liệu theo 100g"
                    >
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                            <div><strong>ID:</strong> {ingredient.id}</div>
                            <div><strong>Tên:</strong> {ingredient.name}</div>
                            <div><strong>Nhóm:</strong> {ingredient.category || "-"}</div>

                            <div>Năng lượng: {formatNumber(ingredient.energy_kcal)}</div>
                            <div>Protein: {formatNumber(ingredient.protein_g)}</div>
                            <div>Tinh bột: {formatNumber(ingredient.carb_g)}</div>
                            <div>Chất béo: {formatNumber(ingredient.fat_g)}</div>
                            <div>Chất xơ: {formatNumber(ingredient.fiber_g)}</div>
                            <div>Purin: {formatNumber(ingredient.purine_mg)}</div>
                            <div>Natri: {formatNumber(ingredient.sodium_mg)}</div>
                            <div>Kali: {formatNumber(ingredient.potassium_mg)}</div>
                            <div>Cholesterol: {formatNumber(ingredient.cholesterol_mg)}</div>
                            <div>Phospho: {formatNumber(ingredient.phosphorus_mg)}</div>
                            <div>Canxi: {formatNumber(ingredient.calcium_mg)}</div>
                            <div>Sắt: {formatNumber(ingredient.iron_mg)}</div>
                            <div>Vitamin C: {formatNumber(ingredient.vitamin_c_mg)}</div>
                            <div>Nước: {formatNumber(ingredient.water_g)}</div>
                        </div>
                    </SectionCard>
                </div>
            )}
        </div>
    );
}