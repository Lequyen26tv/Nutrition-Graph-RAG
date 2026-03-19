import { useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

import AskPage from "./pages/AskPage";
import FoodAnalysisPage from "./pages/FoodAnalysisPage";
import DiseaseAnalysisPage from "./pages/DiseaseAnalysisPage";
import IngredientLookupPage from "./pages/IngredientLookupPage";
import CustomIngredientsPage from "./pages/CustomIngredientsPage";
import RecommendationPage from "./pages/RecommendationPage";
import MealPlanPage from "./pages/MealPlanPage";
import DashboardPage from "./pages/DashboardPage";
import { LayoutDashboard } from "lucide-react";
import {
  MessageSquareText,
  UtensilsCrossed,
  HeartPulse,
  Carrot,
  CookingPot,
  Sparkles,
  ClipboardList,
} from "lucide-react";

const tabs = [
  { key: "dashboard", label: "Tổng quan", icon: LayoutDashboard },
  { key: "ask", label: "Hỏi tự nhiên", icon: MessageSquareText },
  { key: "food", label: "Phân tích món ăn", icon: UtensilsCrossed },
  { key: "disease", label: "Theo bệnh", icon: HeartPulse },
  { key: "ingredient", label: "Tra cứu nguyên liệu", icon: Carrot },
  { key: "custom", label: "Tính từ nguyên liệu", icon: CookingPot },
  { key: "recommend", label: "Món thay thế", icon: Sparkles },
  { key: "mealplan", label: "Thực đơn 1 ngày", icon: ClipboardList },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeLabel = useMemo(
    () => tabs.find((t) => t.key === activeTab)?.label || "",
    [activeTab]
  );

  const renderPage = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardPage onNavigate={setActiveTab} />;
      case "ask":
        return <AskPage />;
      case "food":
        return <FoodAnalysisPage />;
      case "disease":
        return <DiseaseAnalysisPage />;
      case "ingredient":
        return <IngredientLookupPage />;
      case "custom":
        return <CustomIngredientsPage />;
      case "recommend":
        return <RecommendationPage />;
      case "mealplan":
        return <MealPlanPage />;
      default:
        return <DashboardPage onNavigate={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Header
        activeLabel={activeLabel}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4">
        <div className="grid lg:grid-cols-[280px_minmax(0,1fr)] gap-4 lg:gap-6">
          <Sidebar
            tabs={tabs}
            activeTab={activeTab}
            setActiveTab={(key) => {
              setActiveTab(key);
              setSidebarOpen(false);
            }}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />

          <main className="min-w-0">
            {renderPage()}
          </main>
        </div>
      </div>
    </div>
  );
}