export default function PipelineCard() {
    const steps = [
        "Người dùng nhập câu hỏi hoặc chọn chức năng",
        "Hệ thống nhận diện món ăn, nguyên liệu, bệnh lý",
        "Backend truy vấn Neo4j Knowledge Graph",
        "Áp dụng rule dinh dưỡng theo bệnh",
        "Trả về cảnh báo, điểm sức khỏe và gợi ý"
    ];

    return (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
            <h3 className="text-lg font-semibold text-slate-800 mb-5">Quy trình hệ thống</h3>

            <div className="space-y-4">
                {steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            {index + 1}
                        </div>
                        <div className="text-slate-700">{step}</div>
                    </div>
                ))}
            </div>
        </div>
    );
}