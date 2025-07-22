// CustomScrollbar.tsx
import React, { useRef, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface CustomScrollbarProps {
  children: React.ReactNode;
  className?: string;
  thumbSizeRatio?: number;
}

const CustomScrollbar: React.FC<CustomScrollbarProps> = ({ 
  children, 
  className,
  thumbSizeRatio = 0.5,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  const [thumbHeight, setThumbHeight] = useState(20);
  const [thumbTop, setThumbTop] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startY, setStartY] = useState(0);
  const [startScrollTop, setStartScrollTop] = useState(0);

  const updateThumb = () => {
    const container = containerRef.current;
    const content = contentRef.current;
    if (!container || !content) return;

    const baseHeight = (container.clientHeight / content.scrollHeight) * container.clientHeight;
    
    const newHeight = Math.max(baseHeight * thumbSizeRatio, 20);
    setThumbHeight(newHeight);

    const scrollableDistance = content.scrollHeight - container.clientHeight;
    const thumbMovableDistance = container.clientHeight - newHeight;
    
    const newThumbTop = scrollableDistance > 0
      ? (content.scrollTop / scrollableDistance) * thumbMovableDistance
      : 0;

    setThumbTop(newThumbTop);
  };

  const handleScroll = () => {
    updateThumb();
  };

  const handleThumbMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setIsDragging(true);
    setStartY(clientY);
    setStartScrollTop(contentRef.current?.scrollTop || 0);
  };

  const handleMouseMove = (e: MouseEvent | TouchEvent) => {
    if (!isDragging || !contentRef.current || !containerRef.current) return;

    const clientY = 'touches' in e ? e.touches[0].clientY : (e as MouseEvent).clientY;
    const deltaY = clientY - startY;
    const scrollRatio = contentRef.current.scrollHeight / containerRef.current.clientHeight;
    contentRef.current.scrollTop = startScrollTop + deltaY * scrollRatio;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    updateThumb();
    const content = contentRef.current;
    if (content) {
      content.addEventListener('scroll', handleScroll);
    }
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('touchmove', handleMouseMove);
    window.addEventListener('touchend', handleMouseUp);

    return () => {
      if (content) {
        content.removeEventListener('scroll', handleScroll);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('touchmove', handleMouseMove);
      window.removeEventListener('touchend', handleMouseUp);
    };
  }, [isDragging, startY, startScrollTop]);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(updateThumb);
    if (contentRef.current) {
      resizeObserver.observe(contentRef.current);
    }
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={cn("relative w-full h-full overflow-hidden touch-none ", className)}>
      <div
        ref={contentRef}
        className="h-full pr-0 overflow-y-scroll scrollbar-hide" 
      >
        {children}
      </div>
      <div className="absolute right-[0px] top-0 w-2 h-full bg-[#21262F] rounded-full">
        {contentRef.current && containerRef.current && 
         contentRef.current.scrollHeight > containerRef.current.clientHeight && (
          <div
            className="bg-[#526985] rounded-full w-full cursor-pointer hover:bg-[#6B8EB8] active:bg-[#3A526D] transition-colors"
            style={{ 
              height: `${thumbHeight}px`,
              top: `${thumbTop}px`,
              position: 'absolute',
              width: '6px',
              left: '1px'
            }}
            onMouseDown={handleThumbMouseDown}
            onTouchStart={handleThumbMouseDown}
          />
        )}
      </div>
    </div>
  );
};

export default CustomScrollbar;