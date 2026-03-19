from difflib import get_close_matches
from typing import Optional

from database.neo4j_driver import run_query
from nlp.text_normalizer import normalize_for_matching
from nlp.synonyms import FOOD_SYNONYMS, DISEASE_SYNONYMS, INGREDIENT_SYNONYMS


def _fetch_all_names(label: str) -> list[str]:
    query = f"""
    MATCH (n:{label})
    WHERE n.name IS NOT NULL
    RETURN n.name AS name
    ORDER BY name
    """
    results = run_query(query)
    return [row["name"] for row in results if row.get("name")]


def _build_normalized_lookup(names: list[str]) -> dict[str, str]:
    """
    Tạo map:
    normalize_for_matching(name) -> name gốc trong DB
    """
    lookup = {}
    for name in names:
        key = normalize_for_matching(name)
        if key and key not in lookup:
            lookup[key] = name
    return lookup


def _resolve_name(
    raw_text: str,
    synonyms_map: dict[str, str],
    candidates: list[str],
    fuzzy_cutoff: float = 0.75,
) -> Optional[str]:
    """
    Ưu tiên:
    1. synonym map
    2. exact normalized match với DB
    3. fuzzy match gần đúng
    """
    if not raw_text:
        return None

    normalized_input = normalize_for_matching(raw_text)
    if not normalized_input:
        return None

    # 1. synonym
    if normalized_input in synonyms_map:
        return synonyms_map[normalized_input]

    # 2. exact normalized DB match
    lookup = _build_normalized_lookup(candidates)
    if normalized_input in lookup:
        return lookup[normalized_input]

    # 3. fuzzy match
    normalized_candidates = list(lookup.keys())
    matched = get_close_matches(normalized_input, normalized_candidates, n=1, cutoff=fuzzy_cutoff)
    if matched:
        return lookup[matched[0]]

    return None


def resolve_food_name(raw_text: str) -> Optional[str]:
    foods = _fetch_all_names("Food")
    return _resolve_name(raw_text, FOOD_SYNONYMS, foods)


def resolve_disease_name(raw_text: str) -> Optional[str]:
    diseases = _fetch_all_names("Disease")
    return _resolve_name(raw_text, DISEASE_SYNONYMS, diseases)


def resolve_ingredient_name(raw_text: str) -> Optional[str]:
    ingredients = _fetch_all_names("Ingredient")
    return _resolve_name(raw_text, INGREDIENT_SYNONYMS, ingredients)


def resolve_entities(
    food_name: Optional[str] = None,
    disease_name: Optional[str] = None,
    ingredient_name: Optional[str] = None,
) -> dict:
    return {
        "food_name": resolve_food_name(food_name) if food_name else None,
        "disease_name": resolve_disease_name(disease_name) if disease_name else None,
        "ingredient_name": resolve_ingredient_name(ingredient_name) if ingredient_name else None,
    }