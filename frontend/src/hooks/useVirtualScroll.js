import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Virtual Scrolling Hook
 * Efficiently renders large lists by only rendering visible items
 */

export const useVirtualScroll = (
  items,
  {
    itemHeight = 100,
    containerHeight = 600,
    buffer = 5,
  } = {}
) => {
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef(null);

  const visibleRange = Math.ceil(containerHeight / itemHeight);
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - buffer);
  const endIndex = Math.min(items.length, startIndex + visibleRange + buffer * 2);

  const visibleItems = items.slice(startIndex, endIndex);

  const handleScroll = useCallback((e) => {
    setScrollTop(e.target.scrollTop);
  }, []);

  const offsetY = startIndex * itemHeight;
  const containerInnerHeight = items.length * itemHeight;

  return {
    containerRef,
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    containerInnerHeight,
    handleScroll,
    scrollTop,
  };
};

/**
 * Virtual List Component
 */
export const VirtualList = ({
  items = [],
  itemHeight = 100,
  containerHeight = 600,
  renderItem,
  buffer = 5,
  className = '',
}) => {
  const {
    containerRef,
    visibleItems,
    startIndex,
    offsetY,
    containerInnerHeight,
    handleScroll,
  } = useVirtualScroll(items, {
    itemHeight,
    containerHeight,
    buffer,
  });

  return (
    <div
      ref={containerRef}
      className={`overflow-auto ${className}`}
      style={{ height: containerHeight }}
      onScroll={handleScroll}
    >
      <div style={{ height: containerInnerHeight }}>
        <div style={{ transform: `translateY(${offsetY}px)` }}>
          {visibleItems.map((item, index) => (
            <div key={startIndex + index} style={{ height: itemHeight }}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Infinite Scroll Hook
 * Loads more items as user scrolls to bottom
 */
export const useInfiniteScroll = (
  loadMoreFn,
  {
    threshold = 0.8,
    hasMore = true,
    isLoading = false,
  } = {}
) => {
  const observerTarget = useRef(null);

  useEffect(() => {
    if (!hasMore || isLoading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMoreFn();
        }
      },
      {
        threshold,
      }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [loadMoreFn, hasMore, isLoading, threshold]);

  return {
    observerTarget,
  };
};

/**
 * Lazy Loading Hook
 * Defers rendering of offscreen items
 */
export const useLazyLoadItems = (items, batchSize = 20) => {
  const [visibleCount, setVisibleCount] = useState(batchSize);

  const visibleItems = items.slice(0, visibleCount);
  const hasMore = visibleCount < items.length;

  const loadMore = useCallback(() => {
    setVisibleCount((prev) => Math.min(prev + batchSize, items.length));
  }, [items.length, batchSize]);

  return {
    visibleItems,
    hasMore,
    loadMore,
    totalCount: items.length,
  };
};
