from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.schemas import (
    FoodRequest,
    FoodDiseaseRequest,
    QuestionRequest,
    CustomIngredientsRequest,
    RecommendationRequest,
    MealPlanRequest
)
from database.neo4j_driver import run_query
from nlp.entity_extractor import extract_entities


from nlp.entity_mapper import (
    resolve_food_name,
    resolve_disease_name,
    resolve_ingredient_name,
)

from nlp.intent_classifier import classify_intent

from reasoning.graph_context import get_food_disease_context
from reasoning.context_builder import build_graph_context_text
app = FastAPI(
    title="NGR Backend",
    version="3.0.0",
    description="Patient Nutrition Knowledge Graph System"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LABEL_MAP = {
    "energy_kcal": "Năng lượng",
    "protein_g": "Protein",
    "fat_g": "Chất béo",
    "carb_g": "Carbohydrate",
    "fiber_g": "Chất xơ",
    "purine_mg": "Purin",
    "sodium_mg": "Natri",
    "potassium_mg": "Kali",
    "cholesterol_mg": "Cholesterol",
    "phosphorus_mg": "Phospho"
}

SUPPORTED_DISEASE_PREFIXES = ("DD", "GU", "TM", "NK")


def to_number(value):
    if value is None:
        return None
    try:
        return float(value)
    except (TypeError, ValueError):
        return None


def is_supported_disease(disease: dict) -> bool:
    disease_id = disease.get("id")
    if not disease_id:
        return False
    return disease_id.startswith(SUPPORTED_DISEASE_PREFIXES)


def get_food_nutrition(food_name: str):
    query = """
    MATCH (f:Food {name: $food_name})-[r:CONTAINS]->(i:Ingredient)
    RETURN f.name AS food,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.energy_kcal), 0)) AS energy_kcal,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.protein_g), 0)) AS protein_g,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.carb_g), 0)) AS carb_g,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.fat_g), 0)) AS fat_g,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.fiber_g), 0)) AS fiber_g,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.purine_mg), 0)) AS purine_mg,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.sodium_mg), 0)) AS sodium_mg,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.potassium_mg), 0)) AS potassium_mg,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.cholesterol_mg), 0)) AS cholesterol_mg,
           sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.phosphorus_mg), 0)) AS phosphorus_mg
    """
    result = run_query(query, {"food_name": food_name})
    if not result or result[0]["food"] is None:
        return None
    return result[0]


def get_disease_rule(disease_name: str):
    query = """
    MATCH (d:Disease {name: $disease_name})
    RETURN d.id AS id,
           d.name AS name,
           d.energy_kcal_min AS energy_kcal_min,
           d.energy_kcal_max AS energy_kcal_max,
           d.protein_g_min AS protein_g_min,
           d.protein_g_max AS protein_g_max,
           d.fat_g_min AS fat_g_min,
           d.fat_g_max AS fat_g_max,
           d.carb_g_min AS carb_g_min,
           d.carb_g_max AS carb_g_max,
           d.fiber_g_min AS fiber_g_min,
           d.fiber_g_max AS fiber_g_max,
           d.purine_mg_min AS purine_mg_min,
           d.purine_mg_max AS purine_mg_max,
           d.sodium_mg_min AS sodium_mg_min,
           d.sodium_mg_max AS sodium_mg_max,
           d.potassium_mg_min AS potassium_mg_min,
           d.potassium_mg_max AS potassium_mg_max,
           d.cholesterol_mg_min AS cholesterol_mg_min,
           d.phosphorus_mg_max AS phosphorus_mg_max
    """
    result = run_query(query, {"disease_name": disease_name})
    if not result:
        return None
    return result[0]


def get_ingredient_nutrition(ingredient_name: str):
    query = """
    MATCH (i:Ingredient {name: $ingredient_name})
    RETURN i.id AS id,
           i.name AS name,
           i.category AS category,
           i.energy_kcal AS energy_kcal,
           i.protein_g AS protein_g,
           i.carb_g AS carb_g,
           i.fat_g AS fat_g,
           i.fiber_g AS fiber_g,
           i.purine_mg AS purine_mg,
           i.sodium_mg AS sodium_mg,
           i.potassium_mg AS potassium_mg,
           i.cholesterol_mg AS cholesterol_mg,
           i.phosphorus_mg AS phosphorus_mg,
           i.calcium_mg AS calcium_mg,
           i.iron_mg AS iron_mg,
           i.vitamin_c_mg AS vitamin_c_mg,
           i.water_g AS water_g
    """
    result = run_query(query, {"ingredient_name": ingredient_name})
    if not result:
        return None
    return result[0]


def get_all_food_nutrition(limit: int = 200):
    query = """
    MATCH (f:Food)-[r:CONTAINS]->(i:Ingredient)
    WITH f,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.energy_kcal), 0)) AS energy_kcal,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.protein_g), 0)) AS protein_g,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.carb_g), 0)) AS carb_g,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.fat_g), 0)) AS fat_g,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.fiber_g), 0)) AS fiber_g,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.purine_mg), 0)) AS purine_mg,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.sodium_mg), 0)) AS sodium_mg,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.potassium_mg), 0)) AS potassium_mg,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.cholesterol_mg), 0)) AS cholesterol_mg,
         sum(toFloat(r.gram)/100.0 * coalesce(toFloat(i.phosphorus_mg), 0)) AS phosphorus_mg
    RETURN f.name AS food,
           energy_kcal, protein_g, carb_g, fat_g, fiber_g,
           purine_mg, sodium_mg, potassium_mg, cholesterol_mg, phosphorus_mg
    LIMIT $limit
    """
    return run_query(query, {"limit": limit})


def compare_nutrition_with_disease(nutrition: dict, disease: dict):
    warnings = []
    evaluations = []

    def add_check(label, actual, min_val=None, max_val=None, skip_zero=False):
        actual_num = to_number(actual)
        min_num = to_number(min_val)
        max_num = to_number(max_val)

        if actual_num is None:
            return

        if skip_zero:
            if min_num == 0:
                min_num = None
            if max_num == 0:
                max_num = None

        status = "normal"
        display_label = LABEL_MAP.get(label, label)

        if min_num is not None and actual_num < min_num:
            status = "low"
            warnings.append(f"{display_label} thấp hơn ngưỡng cho bệnh {disease['name']}")

        if max_num is not None and actual_num > max_num:
            status = "high"
            warnings.append(f"{display_label} vượt ngưỡng cho bệnh {disease['name']}")

        evaluations.append({
            "nutrient": label,
            "label": display_label,
            "actual": actual_num,
            "min": min_num,
            "max": max_num,
            "status": status
        })

    add_check("energy_kcal", nutrition["energy_kcal"], disease["energy_kcal_min"], disease["energy_kcal_max"])
    add_check("protein_g", nutrition["protein_g"], disease["protein_g_min"], disease["protein_g_max"])
    add_check("fat_g", nutrition["fat_g"], disease["fat_g_min"], disease["fat_g_max"])
    add_check("carb_g", nutrition["carb_g"], disease["carb_g_min"], disease["carb_g_max"])
    add_check("fiber_g", nutrition["fiber_g"], disease["fiber_g_min"], disease["fiber_g_max"], skip_zero=True)
    add_check("purine_mg", nutrition["purine_mg"], disease["purine_mg_min"], disease["purine_mg_max"], skip_zero=True)
    add_check("sodium_mg", nutrition["sodium_mg"], disease["sodium_mg_min"], disease["sodium_mg_max"], skip_zero=True)
    add_check("potassium_mg", nutrition["potassium_mg"], disease["potassium_mg_min"], disease["potassium_mg_max"], skip_zero=True)

    cholesterol_min = to_number(disease["cholesterol_mg_min"])
    cholesterol_actual = to_number(nutrition["cholesterol_mg"])
    if cholesterol_min is not None and cholesterol_min > 0 and cholesterol_actual is not None:
        status = "normal"
        if cholesterol_actual < cholesterol_min:
            status = "low"
            warnings.append(f"{LABEL_MAP['cholesterol_mg']} thấp hơn ngưỡng cho bệnh {disease['name']}")
        evaluations.append({
            "nutrient": "cholesterol_mg",
            "label": LABEL_MAP["cholesterol_mg"],
            "actual": cholesterol_actual,
            "min": cholesterol_min,
            "max": None,
            "status": status
        })

    phosphorus_max = to_number(disease["phosphorus_mg_max"])
    phosphorus_actual = to_number(nutrition["phosphorus_mg"])
    if phosphorus_max is not None and phosphorus_max > 0 and phosphorus_actual is not None:
        status = "normal"
        if phosphorus_actual > phosphorus_max:
            status = "high"
            warnings.append(f"{LABEL_MAP['phosphorus_mg']} vượt ngưỡng cho bệnh {disease['name']}")
        evaluations.append({
            "nutrient": "phosphorus_mg",
            "label": LABEL_MAP["phosphorus_mg"],
            "actual": phosphorus_actual,
            "min": None,
            "max": phosphorus_max,
            "status": status
        })

    return {
        "evaluations": evaluations,
        "warnings": warnings
    }


def calculate_health_score(evaluations: list):
    score = 100
    high_count = 0
    low_count = 0
    normal_count = 0

    for item in evaluations:
        status = item.get("status")
        if status == "high":
            score -= 20
            high_count += 1
        elif status == "low":
            score -= 10
            low_count += 1
        else:
            normal_count += 1

    if score < 0:
        score = 0

    if score >= 85:
        level = "Tốt"
    elif score >= 70:
        level = "Khá"
    elif score >= 50:
        level = "Trung bình"
    else:
        level = "Kém"

    return {
        "score": score,
        "level": level,
        "normal_count": normal_count,
        "low_count": low_count,
        "high_count": high_count
    }


def count_violations(evaluations: list):
    high_count = sum(1 for e in evaluations if e.get("status") == "high")
    low_count = sum(1 for e in evaluations if e.get("status") == "low")
    return high_count, low_count


def recommendation_distance(evaluations: list):
    total = 0.0
    for e in evaluations:
        actual = e.get("actual")
        min_val = e.get("min")
        max_val = e.get("max")
        status = e.get("status")

        if actual is None:
            continue

        if status == "low" and min_val is not None and min_val > 0:
            total += (min_val - actual) / min_val
        elif status == "high" and max_val is not None and max_val > 0:
            total += (actual - max_val) / max_val

    return round(total, 4)


def recommend_alternative_foods(current_food: str, disease: dict, limit: int = 5):
    foods = get_all_food_nutrition(limit=300)
    candidates = []

    for food in foods:
        if food["food"] == current_food:
            continue

        comparison = compare_nutrition_with_disease(food, disease)
        score = calculate_health_score(comparison["evaluations"])
        high_count, low_count = count_violations(comparison["evaluations"])
        distance = recommendation_distance(comparison["evaluations"])

        candidates.append({
            "food": food["food"],
            "nutrition": food,
            "warnings": comparison["warnings"],
            "evaluations": comparison["evaluations"],
            "health_score": score,
            "high_violations": high_count,
            "low_violations": low_count,
            "distance": distance
        })

    # Ưu tiên ít vi phạm high, rồi ít vi phạm low, rồi score cao, rồi distance nhỏ
    candidates.sort(
        key=lambda x: (
            x["high_violations"],
            x["low_violations"],
            -x["health_score"]["score"],
            x["distance"]
        )
    )

    return candidates[:limit]


def build_daily_meal_plan(disease: dict, breakfast_limit=10, lunch_limit=10, dinner_limit=10):
    foods = get_all_food_nutrition(limit=300)

    enriched = []
    for food in foods:
        comparison = compare_nutrition_with_disease(food, disease)
        score = calculate_health_score(comparison["evaluations"])
        high_count, low_count = count_violations(comparison["evaluations"])
        distance = recommendation_distance(comparison["evaluations"])

        enriched.append({
            "food": food["food"],
            "nutrition": food,
            "evaluations": comparison["evaluations"],
            "warnings": comparison["warnings"],
            "health_score": score,
            "high_violations": high_count,
            "low_violations": low_count,
            "distance": distance
        })

    enriched.sort(
        key=lambda x: (
            x["high_violations"],
            x["low_violations"],
            -x["health_score"]["score"],
            x["distance"]
        )
    )

    breakfast_candidates = enriched[:breakfast_limit]
    lunch_candidates = enriched[:lunch_limit]
    dinner_candidates = enriched[:dinner_limit]

    best_plan = None
    best_plan_score = None

    for b in breakfast_candidates:
        for l in lunch_candidates:
            if l["food"] == b["food"]:
                continue
            for d in dinner_candidates:
                if d["food"] in {b["food"], l["food"]}:
                    continue

                total = {
                    "energy_kcal": b["nutrition"]["energy_kcal"] + l["nutrition"]["energy_kcal"] + d["nutrition"]["energy_kcal"],
                    "protein_g": b["nutrition"]["protein_g"] + l["nutrition"]["protein_g"] + d["nutrition"]["protein_g"],
                    "carb_g": b["nutrition"]["carb_g"] + l["nutrition"]["carb_g"] + d["nutrition"]["carb_g"],
                    "fat_g": b["nutrition"]["fat_g"] + l["nutrition"]["fat_g"] + d["nutrition"]["fat_g"],
                    "fiber_g": b["nutrition"]["fiber_g"] + l["nutrition"]["fiber_g"] + d["nutrition"]["fiber_g"],
                    "purine_mg": b["nutrition"]["purine_mg"] + l["nutrition"]["purine_mg"] + d["nutrition"]["purine_mg"],
                    "sodium_mg": b["nutrition"]["sodium_mg"] + l["nutrition"]["sodium_mg"] + d["nutrition"]["sodium_mg"],
                    "potassium_mg": b["nutrition"]["potassium_mg"] + l["nutrition"]["potassium_mg"] + d["nutrition"]["potassium_mg"],
                    "cholesterol_mg": b["nutrition"]["cholesterol_mg"] + l["nutrition"]["cholesterol_mg"] + d["nutrition"]["cholesterol_mg"],
                    "phosphorus_mg": b["nutrition"]["phosphorus_mg"] + l["nutrition"]["phosphorus_mg"] + d["nutrition"]["phosphorus_mg"]
                }

                comparison = compare_nutrition_with_disease(total, disease)
                score = calculate_health_score(comparison["evaluations"])
                high_count, low_count = count_violations(comparison["evaluations"])
                distance = recommendation_distance(comparison["evaluations"])

                ranking_tuple = (
                    high_count,
                    low_count,
                    -score["score"],
                    distance
                )

                if best_plan is None or ranking_tuple < best_plan_score:
                    best_plan = {
                        "breakfast": b["food"],
                        "lunch": l["food"],
                        "dinner": d["food"],
                        "total_nutrition": {k: round(v, 4) for k, v in total.items()},
                        "evaluations": comparison["evaluations"],
                        "warnings": comparison["warnings"],
                        "health_score": score
                    }
                    best_plan_score = ranking_tuple

    return best_plan


def generate_advice(food_name: str, disease_name: str | None, warnings: list[str]):
    if disease_name:
        if warnings:
            return (
                f"Món {food_name} cần thận trọng đối với bệnh {disease_name}. "
                f"Hệ thống phát hiện {len(warnings)} cảnh báo dinh dưỡng."
            )
        return (
            f"Món {food_name} hiện không vượt các ngưỡng kiểm soát chính đối với bệnh {disease_name} "
            f"trong dữ liệu hiện có."
        )
    return f"Đã phân tích dinh dưỡng cho món {food_name}."


@app.get("/")
def root():
    return {"message": "Backend OK"}


@app.get("/test-db")
def test_db():
    query = "MATCH (f:Food) RETURN count(f) AS total_food"
    result = run_query(query)
    return result[0]


@app.get("/supported-diseases")
def supported_diseases():
    query = """
    MATCH (d:Disease)
    RETURN d.id AS id, d.name AS name
    ORDER BY d.id
    """
    diseases = run_query(query)
    supported = [d for d in diseases if d.get("id") and d["id"].startswith(SUPPORTED_DISEASE_PREFIXES)]

    return {
        "message": "Danh sách bệnh hiện được hỗ trợ trong phạm vi đồ án",
        "total": len(supported),
        "diseases": supported
    }


@app.get("/ingredient-nutrition/{ingredient_name}")
def ingredient_nutrition(ingredient_name: str):
    ingredient = get_ingredient_nutrition(ingredient_name)
    if ingredient is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy nguyên liệu")

    return {
        "message": f"Tra cứu thành phần dinh dưỡng của nguyên liệu {ingredient_name}",
        "ingredient": ingredient
    }


@app.post("/analyze-food")
def analyze_food(req: FoodRequest):
    nutrition = get_food_nutrition(req.food_name)
    if nutrition is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")
    return nutrition


@app.post("/analyze-food-with-disease")
def analyze_food_with_disease(req: FoodDiseaseRequest):
    nutrition = get_food_nutrition(req.food_name)
    if nutrition is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")

    disease = get_disease_rule(req.disease_name)
    if disease is None:
        raise HTTPException(status_code=404, detail="Bệnh này chưa có trong cơ sở tri thức hiện tại")

    if not is_supported_disease(disease):
        raise HTTPException(status_code=400, detail="Bệnh này hiện chưa nằm trong phạm vi hỗ trợ của đồ án")

    comparison = compare_nutrition_with_disease(nutrition, disease)
    advice = generate_advice(nutrition["food"], disease["name"], comparison["warnings"])
    health_score = calculate_health_score(comparison["evaluations"])

    return {
        "food": nutrition["food"],
        "disease_id": disease["id"],
        "disease_name": disease["name"],
        "nutrition": nutrition,
        "evaluations": comparison["evaluations"],
        "warnings": comparison["warnings"],
        "health_score": health_score,
        "advice": advice
    }


@app.post("/recommend-food")
def recommend_food(req: RecommendationRequest):
    nutrition = get_food_nutrition(req.food_name)
    if nutrition is None:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")

    disease = get_disease_rule(req.disease_name)
    if disease is None:
        raise HTTPException(status_code=404, detail="Bệnh này chưa có trong cơ sở tri thức hiện tại")

    if not is_supported_disease(disease):
        raise HTTPException(status_code=400, detail="Bệnh này hiện chưa nằm trong phạm vi hỗ trợ của đồ án")

    current_comparison = compare_nutrition_with_disease(nutrition, disease)
    current_health_score = calculate_health_score(current_comparison["evaluations"])

    recommendations = recommend_alternative_foods(
        current_food=req.food_name,
        disease=disease,
        limit=req.limit
    )

    return {
        "message": f"Gợi ý món thay thế phù hợp hơn cho bệnh {disease['name']}",
        "current_food": req.food_name,
        "current_food_health_score": current_health_score,
        "current_food_warnings": current_comparison["warnings"],
        "recommendations": recommendations
    }


@app.post("/meal-plan")
def meal_plan(req: MealPlanRequest):
    disease = get_disease_rule(req.disease_name)
    if disease is None:
        raise HTTPException(status_code=404, detail="Bệnh này chưa có trong cơ sở tri thức hiện tại")

    if not is_supported_disease(disease):
        raise HTTPException(status_code=400, detail="Bệnh này hiện chưa nằm trong phạm vi hỗ trợ của đồ án")

    plan = build_daily_meal_plan(
        disease=disease,
        breakfast_limit=req.breakfast_limit,
        lunch_limit=req.lunch_limit,
        dinner_limit=req.dinner_limit
    )

    if plan is None:
        raise HTTPException(status_code=404, detail="Chưa tìm được thực đơn phù hợp")

    return {
        "message": f"Gợi ý thực đơn 1 ngày cho bệnh {disease['name']}",
        "disease_id": disease["id"],
        "disease_name": disease["name"],
        "meal_plan": plan
    }


@app.post("/analyze-custom-ingredients")
def analyze_custom_ingredients(req: CustomIngredientsRequest):
    if not req.items:
        raise HTTPException(status_code=400, detail="Danh sách nguyên liệu đang trống")

    item_results = []
    not_found = []

    total = {
        "energy_kcal": 0.0,
        "protein_g": 0.0,
        "carb_g": 0.0,
        "fat_g": 0.0,
        "fiber_g": 0.0,
        "purine_mg": 0.0,
        "sodium_mg": 0.0,
        "potassium_mg": 0.0,
        "cholesterol_mg": 0.0,
        "phosphorus_mg": 0.0,
        "calcium_mg": 0.0,
        "iron_mg": 0.0,
        "vitamin_c_mg": 0.0
    }

    nutrient_keys = list(total.keys())

    for item in req.items:
        ingredient = get_ingredient_nutrition(item.ingredient_name)
        if ingredient is None:
            not_found.append(item.ingredient_name)
            continue

        gram = float(item.gram)
        contribution = {}

        for key in nutrient_keys:
            per_100g = to_number(ingredient.get(key)) or 0.0
            value = gram / 100.0 * per_100g
            contribution[key] = round(value, 4)
            total[key] += value

        item_results.append({
            "ingredient_name": ingredient["name"],
            "gram": gram,
            "category": ingredient.get("category"),
            "nutrition_per_100g": {
                key: to_number(ingredient.get(key)) or 0.0 for key in nutrient_keys
            },
            "contribution": contribution
        })

    total = {k: round(v, 4) for k, v in total.items()}

    return {
        "message": "Đã tính tổng dinh dưỡng từ danh sách nguyên liệu người dùng chuẩn bị nấu",
        "items_count": len(req.items),
        "found_count": len(item_results),
        "not_found_count": len(not_found),
        "not_found_ingredients": not_found,
        "ingredients": item_results,
        "total_nutrition": total
    }

@app.get("/foods")
def get_foods():
    query = """
    MATCH (f:Food)
    RETURN f.name AS name
    ORDER BY name
    """
    foods = run_query(query)
    return {"foods": [f["name"] for f in foods if f.get("name")]}


@app.get("/ingredients")
def get_ingredients():
    query = """
    MATCH (i:Ingredient)
    RETURN i.name AS name
    ORDER BY name
    """
    ingredients = run_query(query)
    return {"ingredients": [i["name"] for i in ingredients if i.get("name")]}


@app.get("/diseases")
def get_diseases():
    query = """
    MATCH (d:Disease)
    RETURN d.id AS id, d.name AS name
    ORDER BY d.id
    """
    diseases = run_query(query)
    return {"diseases": diseases}
@app.post("/ask")
def ask_question(req: QuestionRequest):
    intent = classify_intent(req.question)
    entities = extract_entities(req.question)

    resolved_food_name = resolve_food_name(entities.get("food")) if entities.get("food") else None
    resolved_disease_name = resolve_disease_name(entities.get("disease")) if entities.get("disease") else None
    resolved_ingredient_name = resolve_ingredient_name(entities.get("ingredient")) if entities.get("ingredient") else None

    # =========================
    # 1. INGREDIENT LOOKUP
    # =========================
    if intent == "ingredient_lookup":
        if not resolved_ingredient_name:
            raise HTTPException(status_code=400, detail="Không nhận diện được nguyên liệu")

        ingredient = get_ingredient_nutrition(resolved_ingredient_name)
        if not ingredient:
            raise HTTPException(status_code=404, detail="Không tìm thấy nguyên liệu")

        return {
            "intent": intent,
            "ingredient": ingredient,
            "message": f"Đã tra cứu nguyên liệu {resolved_ingredient_name}"
        }

    # =========================
    # 2. MEAL PLAN
    # =========================
    if intent == "meal_plan":
        if not resolved_disease_name:
            raise HTTPException(status_code=400, detail="Không nhận diện được bệnh")

        disease = get_disease_rule(resolved_disease_name)
        if not disease:
            raise HTTPException(status_code=404, detail="Không tìm thấy bệnh")

        plan = build_daily_meal_plan(disease=disease)

        return {
            "intent": intent,
            "disease_name": resolved_disease_name,
            "meal_plan": plan
        }

    # =========================
    # 3. RECOMMENDATION
    # =========================
    if intent == "recommendation":
        if not resolved_food_name or not resolved_disease_name:
            raise HTTPException(status_code=400, detail="Thiếu món ăn hoặc bệnh")

        nutrition = get_food_nutrition(resolved_food_name)
        disease = get_disease_rule(resolved_disease_name)

        comparison = compare_nutrition_with_disease(nutrition, disease)
        health_score = calculate_health_score(comparison["evaluations"])

        recommendations = recommend_alternative_foods(
            current_food=resolved_food_name,
            disease=disease,
            limit=3
        )

        return {
            "intent": intent,
            "food": resolved_food_name,
            "disease_name": resolved_disease_name,
            "health_score": health_score,
            "warnings": comparison["warnings"],
            "recommendations": recommendations
        }

    # =========================
    # 4. MẶC ĐỊNH: PHẢI CÓ FOOD
    # =========================
    if not resolved_food_name:
        raise HTTPException(status_code=400, detail="Không nhận diện được món ăn")
    nutrition = get_food_nutrition(resolved_food_name)
    if not nutrition:
        raise HTTPException(status_code=404, detail="Không tìm thấy món ăn")

    # =========================
    # 5. DISEASE ANALYSIS
    # =========================
    if resolved_disease_name or intent == "disease_analysis":

        if not resolved_disease_name:
            raise HTTPException(status_code=400, detail="Không nhận diện được bệnh")

        disease = get_disease_rule(resolved_disease_name)

        comparison = compare_nutrition_with_disease(nutrition, disease)
        health_score = calculate_health_score(comparison["evaluations"])

        # 🔥 GRAPH CONTEXT
        graph_context = get_food_disease_context(resolved_food_name, resolved_disease_name)

        context_text = build_graph_context_text(
            graph_context=graph_context,
            nutrition=nutrition,
            comparison=comparison,
            health_score=health_score,
            warnings=comparison["warnings"]
        )

        advice = generate_advice(
            resolved_food_name,
            resolved_disease_name,
            comparison["warnings"]
        )

        return {
            "intent": "disease_analysis",
            "food": resolved_food_name,
            "disease_name": resolved_disease_name,
            "nutrition": nutrition,
            "evaluations": comparison["evaluations"],
            "warnings": comparison["warnings"],
            "health_score": health_score,
            "advice": advice,
            "context_text": context_text
        }

    # =========================
    # 6. FOOD NUTRITION
    # =========================
    return {
        "intent": intent,
        "food": resolved_food_name,
        "nutrition": nutrition
    }
@app.get("/debug/context")
def debug_context(food: str, disease: str):

    food_name = resolve_food_name(food)
    disease_name = resolve_disease_name(disease)

    nutrition = get_food_nutrition(food_name)
    disease_data = get_disease_rule(disease_name)

    comparison = compare_nutrition_with_disease(nutrition, disease_data)
    health_score = calculate_health_score(comparison["evaluations"])

    graph_context = get_food_disease_context(food_name, disease_name)

    context_text = build_graph_context_text(
        graph_context,
        nutrition,
        comparison,
        health_score,
        comparison["warnings"]
    )

    return {
        "food": food_name,
        "disease": disease_name,
        "context_text": context_text
    }