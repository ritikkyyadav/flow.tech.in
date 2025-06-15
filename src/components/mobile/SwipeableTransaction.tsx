import { useState, useRef, TouchEvent } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SwipeableTransactionProps {
  children: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  className?: string;
}

export const SwipeableTransaction = ({
  children,
  onEdit,
  onDelete,
  className
}: SwipeableTransactionProps) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwipeActive, setIsSwipeActive] = useState(false);
  const startX = useRef(0);
  const currentX = useRef(0);

  const handleTouchStart = (e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    setIsSwipeActive(true);
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isSwipeActive) return;
    
    currentX.current = e.touches[0].clientX;
    const diff = startX.current - currentX.current;
    
    // Only allow left swipe (positive diff)
    if (diff > 0 && diff <= 120) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    setIsSwipeActive(false);
    
    // If swiped more than 60px, keep it open, otherwise close
    if (swipeOffset > 60) {
      setSwipeOffset(120);
    } else {
      setSwipeOffset(0);
    }
  };

  const resetSwipe = () => {
    setSwipeOffset(0);
  };

  return (
    <div className="relative overflow-hidden">
      {/* Action buttons revealed on swipe */}
      <div 
        className={cn(
          "absolute right-0 top-0 h-full flex items-center gap-2 px-2 transition-opacity duration-200",
          swipeOffset > 0 ? "opacity-100" : "opacity-0"
        )}
        style={{ width: `${Math.min(swipeOffset, 120)}px` }}
      >
        {onEdit && swipeOffset > 40 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onEdit();
              resetSwipe();
            }}
            className="h-8 w-8 p-0 bg-blue-500 text-white border-blue-500"
          >
            <Edit className="w-4 h-4" />
          </Button>
        )}
        
        {onDelete && swipeOffset > 80 && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              onDelete();
              resetSwipe();
            }}
            className="h-8 w-8 p-0 bg-red-500 text-white border-red-500"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Main content */}
      <div
        className={cn(
          "transition-transform duration-200 touch-pan-y",
          className
        )}
        style={{ 
          transform: `translateX(-${swipeOffset}px)`,
          cursor: isSwipeActive ? 'grabbing' : 'grab'
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={swipeOffset > 0 ? resetSwipe : undefined}
      >
        {children}
      </div>
    </div>
  );
};
