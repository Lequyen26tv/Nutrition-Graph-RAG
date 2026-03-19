from pydantic import BaseModel, Field
from typing import List, Optional

class FoodRequest(BaseModel):
    food_name: str

class FoodDiseaseRequest(BaseModel):
    food_name: str
    disease_name: str

class QuestionRequest(BaseModel):
    question: str

class CustomIngredientItem(BaseModel):
    ingredient_name: str
    gram: float = Field(gt=0, description="Khối lượng nguyên liệu (gram)")

class CustomIngredientsRequest(BaseModel):
    items: List[CustomIngredientItem]

class RecommendationRequest(BaseModel):
    food_name: str
    disease_name: str
    limit: int = 5

class MealPlanRequest(BaseModel):
    disease_name: str
    breakfast_limit: int = 10
    lunch_limit: int = 10
    dinner_limit: int = 10