from database.neo4j_driver import run_query


def get_food_disease_context(food_name: str, disease_name: str):
    query = """
    MATCH (f:Food {name: $food_name})-[r:CONTAINS]->(i:Ingredient)
    MATCH (d:Disease {name: $disease_name})
    RETURN f.name AS food,
           collect({
               ingredient: i.name,
               gram: r.gram,
               energy_kcal: i.energy_kcal,
               protein_g: i.protein_g,
               carb_g: i.carb_g,
               fat_g: i.fat_g,
               fiber_g: i.fiber_g,
               sodium_mg: i.sodium_mg,
               purine_mg: i.purine_mg,
               cholesterol_mg: i.cholesterol_mg,
               potassium_mg: i.potassium_mg,
               phosphorus_mg: i.phosphorus_mg
           }) AS ingredients,
           d.name AS disease,
           d.id AS disease_id,
           d.energy_kcal_min AS energy_kcal_min,
           d.energy_kcal_max AS energy_kcal_max,
           d.protein_g_min AS protein_g_min,
           d.protein_g_max AS protein_g_max,
           d.carb_g_min AS carb_g_min,
           d.carb_g_max AS carb_g_max,
           d.fat_g_min AS fat_g_min,
           d.fat_g_max AS fat_g_max,
           d.fiber_g_min AS fiber_g_min,
           d.fiber_g_max AS fiber_g_max,
           d.sodium_mg_max AS sodium_mg_max,
           d.sodium_mg_min AS sodium_mg_min,
           d.purine_mg_max AS purine_mg_max,
           d.purine_mg_min AS purine_mg_min,
           d.potassium_mg_max AS potassium_mg_max,
           d.potassium_mg_min AS potassium_mg_min,
           d.cholesterol_mg_min AS cholesterol_mg_min,
           d.phosphorus_mg_max AS phosphorus_mg_max
    """
    result = run_query(query, {"food_name": food_name, "disease_name": disease_name})
    return result[0] if result else None