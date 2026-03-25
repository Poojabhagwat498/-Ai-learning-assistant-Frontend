import React from "react";

const Tabs = ({ tabs, activeTab, setActiveTab }) => {
  return (
    <div className="w-full">
      {/* Tabs Header */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`relative px-4 py-3 text-sm font-semibold transition-all duration-200
                ${
                  activeTab === tab.name
                    ? "text-emerald-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
            >
              <span>{tab.label}</span>

              {/* Active underline */}
              {activeTab === tab.name && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-emerald-600 rounded-full" />
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {tabs.map((tab) =>
          tab.name === activeTab ? (
            <div key={tab.name} className="animate-fadeIn">
              {tab.content}
            </div>
          ) : null
        )}
      </div>
    </div>
  );
};

export default Tabs;
