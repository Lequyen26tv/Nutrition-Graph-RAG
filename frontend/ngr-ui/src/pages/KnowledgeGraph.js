import NeoVis from "neovis.js"

export default function KnowledgeGraph() {

    const draw = () => {

        const config = {

            containerId: "viz",

            neo4j: {
                serverUrl: "bolt://localhost:7687",
                serverUser: "neo4j",
                serverPassword: "123456"
            },

            labels: {
                Ingredient: { caption: "name" },
                Nutrient: { caption: "name" },
                Disease: { caption: "name" }
            },

            relationships: {
                HAS_NUTRIENT: { caption: true },
                LIMIT: { caption: true }
            }

        }

        const viz = new NeoVis(config)

        viz.render()

    }

    return (

        <div>

            <h2>Knowledge Graph</h2>

            <button onClick={draw}>Load Graph</button>

            <div id="viz" style={{ height: "500px" }}></div>

        </div>

    )

}