"use client";

import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { TabNav, type TabType } from "@/components/layout/TabNav";
import { ScheduleContent } from "@/components/content/ScheduleContent";
import { InsightContent } from "@/components/content/InsightContent";
import { HistoryContent } from "@/components/content/HistoryContent";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<TabType>("schedule");
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  
  const handleAddSchedule = useCallback(() => {
    setActiveTab("schedule");
    setShowAddSchedule(true);
  }, []);
  
  const handleCloseAddSchedule = useCallback(() => {
    setShowAddSchedule(false);
  }, []);
  
  const renderContent = () => {
    switch (activeTab) {
      case "schedule":
        return (
          <ScheduleContent 
            showAddForm={showAddSchedule} 
            onCloseAddForm={handleCloseAddSchedule} 
          />
        );
      case "insight":
        return <InsightContent />;
      case "history":
        return <HistoryContent />;
      default:
        return null;
    }
  };
  
  return (
    <div className="min-h-screen">
      <Header onAddSchedule={handleAddSchedule} />
      <TabNav activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
