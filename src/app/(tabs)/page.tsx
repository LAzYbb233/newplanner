"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { JournalPage } from "@/components/home/JournalPage";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export default function HomePage() {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [direction, setDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  
  const today = new Date();
  const isToday = formatDate(currentDate) === formatDate(today);
  const isFuture = currentDate > today;
  
  const goToPrevDay = useCallback(() => {
    if (isAnimating) return;
    setDirection("right");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate((d) => addDays(d, -1));
      setDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);
  
  const goToNextDay = useCallback(() => {
    if (isAnimating || isFuture) return;
    setDirection("left");
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentDate((d) => addDays(d, 1));
      setDirection(null);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating, isFuture]);
  
  // Touch handlers
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  }, []);
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  }, []);
  
  const handleTouchEnd = useCallback(() => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    
    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50;
    
    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // Swiped left -> next day
        goToNextDay();
      } else {
        // Swiped right -> prev day
        goToPrevDay();
      }
    }
    
    touchStartX.current = null;
    touchEndX.current = null;
  }, [goToNextDay, goToPrevDay]);
  
  const dateKey = formatDate(currentDate);
  
  return (
    <div className="relative h-full overflow-hidden bg-amber-50/30">
      {/* Page Container */}
      <div
        ref={containerRef}
        className="h-full overflow-y-auto px-12"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <div
          className={`transition-transform duration-300 ease-out ${
            direction === "left"
              ? "-translate-x-full opacity-0"
              : direction === "right"
              ? "translate-x-full opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >
          <JournalPage key={dateKey} date={dateKey} />
        </div>
      </div>
      
      {/* Navigation Buttons - 固定在顶部 */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-2 top-20 z-50 h-8 w-8 rounded-full bg-background/90 shadow-md backdrop-blur-sm hover:bg-background md:left-[calc(50%-14rem)]"
        onClick={goToPrevDay}
        disabled={isAnimating}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="fixed right-2 top-20 z-50 h-8 w-8 rounded-full bg-background/90 shadow-md backdrop-blur-sm hover:bg-background disabled:opacity-50 md:right-[calc(50%-14rem)]"
        onClick={goToNextDay}
        disabled={isAnimating || isFuture}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
      
      {/* Date Indicator (optional) */}
      {!isToday && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40">
          <Button
            variant="secondary"
            size="sm"
            className="rounded-full shadow-sm text-xs"
            onClick={() => {
              setCurrentDate(new Date());
            }}
          >
            回到今天
          </Button>
        </div>
      )}
    </div>
  );
}
