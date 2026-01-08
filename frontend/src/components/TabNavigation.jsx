import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Home, Footprints, Gamepad2, ShoppingBag, ArrowRightLeft } from "lucide-react";

export default function TabNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const tabs = [
    { id: "home", path: "/dashboard", icon: Home, label: "Home" },
    { id: "move", path: "/move", icon: Footprints, label: "Move" },
    { id: "play", path: "/play", icon: Gamepad2, label: "Play" },
    { id: "shop", path: "/shop", icon: ShoppingBag, label: "Shop" },
    { id: "swap", path: "/swap", icon: ArrowRightLeft, label: "Swap" },
  ];

  return (
    <nav className="tab-nav fixed bottom-0 left-0 right-0 px-4 py-2 z-50" data-testid="tab-navigation">
      <div className="flex justify-around items-center max-w-lg mx-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path;
          
          return (
            <button
              key={tab.id}
              data-testid={`tab-${tab.id}`}
              onClick={() => navigate(tab.path)}
              className={`tab-item flex flex-col items-center py-2 px-3 rounded-xl transition-all ${
                isActive ? "active" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
