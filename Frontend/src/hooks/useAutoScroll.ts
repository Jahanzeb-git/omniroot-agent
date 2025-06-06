import { useRef, useEffect, MutableRefObject } from 'react';

interface UseAutoScrollOptions {
  enabled: boolean;
  smooth?: boolean;
  offset?: number;
  threshold?: number;
  delay?: number;
}

export function useAutoScroll<T extends HTMLElement>(
  options: UseAutoScrollOptions = { enabled: true }
): MutableRefObject<T | null> {
  const { 
    enabled = true,
    smooth = true,
    offset = 0,
    threshold = 100,
    delay = 0
  } = options;
  
  const ref = useRef<T | null>(null);
  const shouldScrollRef = useRef(true);
  const lastScrollHeightRef = useRef(0);
  const scrollTimeoutRef = useRef<number | null>(null);

  // Handle checking if user has scrolled up manually
  const handleScroll = () => {
    if (!ref.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = ref.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    
    // Only update shouldScroll if user has scrolled significantly
    if (distanceFromBottom > threshold) {
      shouldScrollRef.current = false;
    } else if (distanceFromBottom <= threshold / 2) {
      shouldScrollRef.current = true;
    }
  };

  // Clean up scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // Set up scroll event listener
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    
    element.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      element.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Auto-scroll when content changes
  useEffect(() => {
    if (!enabled || !ref.current) return;
    
    const element = ref.current;
    const currentScrollHeight = element.scrollHeight;
    
    // Check if content has actually changed
    if (currentScrollHeight === lastScrollHeightRef.current) return;
    
    lastScrollHeightRef.current = currentScrollHeight;
    
    // Only auto-scroll if user hasn't scrolled up manually
    if (shouldScrollRef.current) {
      const scrollOptions: ScrollToOptions = {
        top: currentScrollHeight + offset,
        behavior: smooth ? 'smooth' : 'auto',
      };
      
      // Clear any existing timeout
      if (scrollTimeoutRef.current !== null) {
        window.clearTimeout(scrollTimeoutRef.current);
      }
      
      // Set new timeout for scrolling
      scrollTimeoutRef.current = window.setTimeout(() => {
        element.scrollTo(scrollOptions);
        scrollTimeoutRef.current = null;
      }, delay);
    }
  });

  return ref;
}