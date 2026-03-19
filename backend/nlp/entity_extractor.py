from database.neo4j_driver import run_query

def normalize_text(text: str) -> str:
    return text.strip().lower()

def get_all_food_names():
    query = """
    MATCH (f:Food)
    RETURN f.name AS name
    ORDER BY name
    """
    results = run_query(query)
    return [r["name"] for r in results if r.get("name")]

def get_all_disease_names():
    query = """
    MATCH (d:Disease)
    RETURN d.name AS name
    ORDER BY name
    """
    results = run_query(query)
    return [r["name"] for r in results if r.get("name")]

def extract_entities(question: str):
    text = normalize_text(question)

    food_found = None
    disease_found = None

    foods = get_all_food_names()
    diseases = get_all_disease_names()

    # ưu tiên match chuỗi dài hơn trước
    foods_sorted = sorted(foods, key=lambda x: len(x), reverse=True)
    diseases_sorted = sorted(diseases, key=lambda x: len(x), reverse=True)

    for food in foods_sorted:
        if normalize_text(food) in text:
            food_found = food
            break

    for disease in diseases_sorted:
        if normalize_text(disease) in text:
            disease_found = disease
            break

    return {
        "food": food_found,
        "disease": disease_found
    }