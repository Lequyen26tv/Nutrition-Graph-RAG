import React from "react";

export default function Dashboard() {

    return (

        <div>

            <h1>Nutrition Graph AI</h1>

            <div style={{ display: "flex", gap: "20px" }}>

                <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "10px" }}>
                    <h3>Ingredients</h3>
                    <p>667</p>
                </div>

                <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "10px" }}>
                    <h3>Nutrients</h3>
                    <p>20+</p>
                </div>

                <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "10px" }}>
                    <h3>Diseases</h3>
                    <p>22</p>
                </div>

                <div style={{ background: "#f1f5f9", padding: "20px", borderRadius: "10px" }}>
                    <h3>Relationships</h3>
                    <p>7500+</p>
                </div>

            </div>

        </div>

    )

}