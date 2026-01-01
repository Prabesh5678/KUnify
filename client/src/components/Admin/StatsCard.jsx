import React from "react";

const StatsCard = ({ title, value, icon, color = "blue" }) => {
  const colorMap = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    green: "bg-green-50 text-green-600",
    orange: "bg-orange-50 text-orange-600",
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm flex items-center gap-4">
      {icon && (
        <div
          className={`p-3 rounded-lg text-2xl ${colorMap[color]}`}
        >
          {icon}
        </div>
      )}

      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    </div>
  );
};

export default StatsCard;
