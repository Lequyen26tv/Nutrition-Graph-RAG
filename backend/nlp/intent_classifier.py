from nlp.text_normalizer import normalize_for_matching

INTENT_KEYWORDS = {
    "food_nutrition": [
        "bao nhieu",
        "dinh duong",
        "calo",
        "nang luong",
        "protein",
        "chat beo",
        "tinh bot",
        "thanh phan",
    ],
    "disease_analysis": [
        "an duoc khong",
        "co nen an",
        "co the an",
        "phu hop khong",
        "tot khong",
        "co hai khong",
        "co duoc khong",
    ],
    "recommendation": [
        "thay the",
        "mon nao tot hon",
        "goi y mon",
        "mon phu hop hon",
        "nen an gi thay",
    ],
    "meal_plan": [
        "thuc don",
        "1 ngay",
        "mot ngay",
        "bua sang",
        "bua trua",
        "bua toi",
        "len thuc don",
    ],
    "ingredient_lookup": [
        "nguyen lieu",
        "100g",
        "thanh phan cua",
    ],
    "custom_ingredients": [
        "toi sap nau",
        "nguyen lieu toi co",
        "tinh tong",
        "tong dinh duong",
        "cong thuc",
        "toi co",
    ],
}


def classify_intent(question: str) -> str:
    q = normalize_for_matching(question)

    # Ưu tiên intent đặc biệt trước
    for keyword in INTENT_KEYWORDS["meal_plan"]:
        if keyword in q:
            return "meal_plan"

    for keyword in INTENT_KEYWORDS["recommendation"]:
        if keyword in q:
            return "recommendation"

    for keyword in INTENT_KEYWORDS["custom_ingredients"]:
        if keyword in q:
            return "custom_ingredients"

    for keyword in INTENT_KEYWORDS["ingredient_lookup"]:
        if keyword in q:
            return "ingredient_lookup"

    for keyword in INTENT_KEYWORDS["disease_analysis"]:
        if keyword in q:
            return "disease_analysis"

    for keyword in INTENT_KEYWORDS["food_nutrition"]:
        if keyword in q:
            return "food_nutrition"

    return "general_question"