import { Bar } from "react-chartjs-2";

export default function NutritionChart() {

    const data = {
        labels: ["Carb", "Protein", "Fat", "Fiber"],
        datasets: [
            {
                label: "Nutrition",
                data: [40, 15, 10, 5]
            }
        ]
    }

    return (

        <div style={{ width: "500px" }}>

            <h2>Nutrition Chart</h2>

            <Bar data={data} />

        </div>

    )

}