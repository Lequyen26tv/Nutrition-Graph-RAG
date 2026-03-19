def get_priority_nutrients_by_disease(disease_name: str) -> list[str]:
    name = (disease_name or "").lower()

    if "huyết áp" in name:
        return ["sodium_mg", "cholesterol_mg", "fat_g"]
    if "gút" in name:
        return ["purine_mg", "protein_g"]
    if "đái tháo đường" in name or "tieu duong" in name:
        return ["carb_g", "energy_kcal"]
    if "thận" in name:
        return ["protein_g", "potassium_mg", "phosphorus_mg"]
    return ["energy_kcal", "protein_g", "carb_g", "fat_g"]


def build_graph_context_text(
    graph_context: dict,
    nutrition: dict,
    comparison: dict,
    health_score: dict | None = None,
    warnings: list | None = None,
) -> str:
    if not graph_context:
        return ""

    warnings = warnings or []
    disease_name = graph_context.get("disease", "")
    priority_nutrients = get_priority_nutrients_by_disease(disease_name)

    lines = []
    lines.append(f"Món ăn: {graph_context.get('food')}")
    lines.append(f"Bệnh lý: {graph_context.get('disease')} ({graph_context.get('disease_id')})")
    lines.append("")

    lines.append("Nguyên liệu chính:")
    for item in graph_context.get("ingredients", []):
        nutrient_parts = []
        for key in priority_nutrients:
            if key in item and item[key] is not None:
                nutrient_parts.append(f"{key}={item[key]}")
        nutrient_text = ", ".join(nutrient_parts)
        lines.append(f"- {item.get('ingredient')} ({item.get('gram')}g): {nutrient_text}")
    lines.append("")

    lines.append("Tổng dinh dưỡng món ăn:")
    for k, v in nutrition.items():
        if k != "food":
            lines.append(f"- {k}: {v}")
    lines.append("")

    lines.append("Đánh giá theo bệnh lý:")
    for e in comparison.get("evaluations", []):
        lines.append(
            f"- {e.get('label')}: actual={e.get('actual')}, min={e.get('min')}, max={e.get('max')}, status={e.get('status')}"
        )
    lines.append("")

    if health_score:
        lines.append(f"Điểm phù hợp: {health_score.get('score')}/100 - {health_score.get('level')}")
        lines.append("")

    if warnings:
        lines.append("Cảnh báo:")
        for w in warnings:
            lines.append(f"- {w}")

    return "\n".join(lines)