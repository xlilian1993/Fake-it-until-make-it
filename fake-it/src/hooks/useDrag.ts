'use client';

import { useState, useCallback, useRef } from 'react';

interface DragState {
  isDragging: boolean;
  dragId: string | null;
  position: { x: number; y: number } | null;
  isOverDropZone: boolean;
}

interface UseDragOptions {
  dropZoneRef: React.RefObject<HTMLElement>;
  onDrop: (id: string) => void;
}

export function useDrag({ dropZoneRef, onDrop }: UseDragOptions) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    dragId: null,
    position: null,
    isOverDropZone: false,
  });

  const startPos = useRef<{ x: number; y: number } | null>(null);
  const hasMoved = useRef(false);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent, id: string) => {
      // 记录起始位置
      startPos.current = { x: e.clientX, y: e.clientY };
      hasMoved.current = false;

      const onMove = (ev: PointerEvent) => {
        if (!startPos.current) return;

        const dx = Math.abs(ev.clientX - startPos.current.x);
        const dy = Math.abs(ev.clientY - startPos.current.y);

        // 移动超过 5px 才算拖拽（避免误触）
        if (dx > 5 || dy > 5) {
          hasMoved.current = true;
        }

        if (hasMoved.current) {
          // 检查是否在圆桌区域上方
          let overDrop = false;
          if (dropZoneRef.current) {
            const rect = dropZoneRef.current.getBoundingClientRect();
            overDrop =
              ev.clientX >= rect.left &&
              ev.clientX <= rect.right &&
              ev.clientY >= rect.top &&
              ev.clientY <= rect.bottom;
          }

          setDragState({
            isDragging: true,
            dragId: id,
            position: { x: ev.clientX, y: ev.clientY },
            isOverDropZone: overDrop,
          });
        }
      };

      const onUp = (ev: PointerEvent) => {
        if (hasMoved.current && dragState.dragId) {
          // 检查是否在圆桌区域松手
          let overDrop = false;
          if (dropZoneRef.current) {
            const rect = dropZoneRef.current.getBoundingClientRect();
            overDrop =
              ev.clientX >= rect.left &&
              ev.clientX <= rect.right &&
              ev.clientY >= rect.top &&
              ev.clientY <= rect.bottom;
          }

          if (overDrop) {
            onDrop(dragState.dragId);
          }
        }

        setDragState({
          isDragging: false,
          dragId: null,
          position: null,
          isOverDropZone: false,
        });

        startPos.current = null;
        hasMoved.current = false;

        document.removeEventListener('pointermove', onMove);
        document.removeEventListener('pointerup', onUp);
      };

      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', onUp);

      // 阻止默认行为（防止文本选中等）
      e.preventDefault();
    },
    [dropZoneRef, onDrop, dragState.dragId]
  );

  return { dragState, handlePointerDown };
}
