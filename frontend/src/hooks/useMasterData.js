import { useEffect, useState } from "react";
import api from "../api/client";

export default function useMasterData() {
    const [foods, setFoods] = useState([]);
    const [ingredients, setIngredients] = useState([]);
    const [diseases, setDiseases] = useState([]);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [foodsRes, ingredientsRes, diseasesRes] = await Promise.all([
                    api.get("/foods"),
                    api.get("/ingredients"),
                    api.get("/diseases"),
                ]);

                setFoods(foodsRes.data.foods || []);
                setIngredients(ingredientsRes.data.ingredients || []);
                setDiseases(diseasesRes.data.diseases || []);
            } catch (error) {
                console.error("Lỗi tải dữ liệu gợi ý:", error);
            } finally {
                setLoadingMasterData(false);
            }
        };

        loadMasterData();
    }, []);

    return {
        foods,
        ingredients,
        diseases,
        loadingMasterData,
    };
}