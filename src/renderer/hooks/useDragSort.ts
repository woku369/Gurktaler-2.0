/**
 * Custom Hook für Drag & Drop Sortierung von Karten-Grids
 * 
 * Verwendung:
 * ```tsx
 * const { draggedIndex, dragOverIndex, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = 
 *   useDragSort(items, onReorder);
 * 
 * // Im JSX:
 * <div
 *   draggable
 *   onDragStart={() => handleDragStart(index)}
 *   onDragEnd={handleDragEnd}
 *   onDragOver={(e) => handleDragOver(e, index)}
 *   onDrop={(e) => handleDrop(e, index)}
 *   className={draggedIndex === index ? 'opacity-50' : ''}
 * >
 * ```
 */

import { useState } from 'react';

interface UseDragSortReturn {
  draggedIndex: number | null;
  dragOverIndex: number | null;
  handleDragStart: (index: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDrop: (e: React.DragEvent, targetIndex: number) => void;
}

export function useDragSort<T extends { id: string }>(
  items: T[],
  onReorder: (itemId: string, newIndex: number) => void
): UseDragSortReturn {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === targetIndex) {
      handleDragEnd();
      return;
    }

    const draggedItem = items[draggedIndex];
    if (draggedItem) {
      onReorder(draggedItem.id, targetIndex);
    }

    handleDragEnd();
  };

  return {
    draggedIndex,
    dragOverIndex,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDrop,
  };
}
