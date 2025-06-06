import React, { useState, useEffect, useRef } from 'react';

interface ResizablePanelProps {
  leftPanel: React.ReactNode;
  rightPanel: React.ReactNode;
  initialSplit?: number;
  minLeftWidth?: number;
  maxLeftWidth?: number;
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({
  leftPanel,
  rightPanel,
  initialSplit = 40,
  minLeftWidth = 30,
  maxLeftWidth = 70,
}) => {
  const [leftWidth, setLeftWidth] = useState(initialSplit);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDraggingRef = useRef(false);
  const startPosRef = useRef(0);
  const startWidthRef = useRef(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isDraggingRef.current = true;
    startPosRef.current = e.clientX;
    startWidthRef.current = leftWidth;
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current || !containerRef.current) return;
      
      const containerWidth = containerRef.current.offsetWidth;
      const delta = e.clientX - startPosRef.current;
      const percentageDelta = (delta / containerWidth) * 100;
      
      let newLeftWidth = startWidthRef.current + percentageDelta;
      newLeftWidth = Math.max(minLeftWidth, Math.min(maxLeftWidth, newLeftWidth));
      
      setLeftWidth(newLeftWidth);
    };

    const handleMouseUp = () => {
      isDraggingRef.current = false;
      document.body.style.removeProperty('cursor');
      document.body.style.removeProperty('user-select');
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [minLeftWidth, maxLeftWidth]);

  return (
    <div ref={containerRef} className="flex h-full relative">
      <div 
        className="h-full overflow-hidden" 
        style={{ width: `${leftWidth}%` }}
      >
        {leftPanel}
      </div>
      
      <div 
        className="absolute top-0 bottom-0 w-1 bg-neutral-200 hover:bg-primary-400 hover:w-1 cursor-ew-resize z-10 transition-colors duration-200"
        style={{ left: `calc(${leftWidth}% - 2px)` }}
        onMouseDown={handleMouseDown}
      />
      
      <div 
        className="h-full overflow-hidden" 
        style={{ width: `${100 - leftWidth}%` }}
      >
        {rightPanel}
      </div>
    </div>
  );
};

export default ResizablePanel;