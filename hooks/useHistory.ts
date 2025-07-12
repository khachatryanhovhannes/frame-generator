/**
 * Custom hook for managing banner editor history (undo/redo functionality)
 * Implements a history stack with navigation capabilities
 */

import { useState, useCallback } from "react";
import { Layer, HistoryState } from "../models/banner";

interface UseHistoryReturn {
  history: HistoryState[];
  historyIndex: number;
  canUndo: boolean;
  canRedo: boolean;
  recordHistory: (layers: Layer[], activeLayerId: string | null, canvasWidth: number, canvasHeight: number) => void;
  undo: () => HistoryState | null;
  redo: () => HistoryState | null;
  clearHistory: () => void;
}

export function useHistory(): UseHistoryReturn {
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const recordHistory = useCallback((
    layers: Layer[],
    activeLayerId: string | null,
    canvasWidth: number,
    canvasHeight: number
  ) => {
    const newState: HistoryState = {
      layers: JSON.parse(JSON.stringify(layers)), // Deep clone
      activeLayerId,
      canvasWidth,
      canvasHeight,
    };

    setHistory(prev => {
      const newHistory = prev.slice(0, historyIndex + 1);
      newHistory.push(newState);
      return newHistory;
    });
    
    setHistoryIndex(prev => prev + 1);
  }, [historyIndex]);

  const undo = useCallback((): HistoryState | null => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [history, historyIndex]);

  const redo = useCallback((): HistoryState | null => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      return history[newIndex];
    }
    return null;
  }, [history, historyIndex]);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setHistoryIndex(-1);
  }, []);

  return {
    history,
    historyIndex,
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
    recordHistory,
    undo,
    redo,
    clearHistory,
  };
}
