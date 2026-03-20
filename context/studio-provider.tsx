"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useCallback,
  ReactNode,
} from "react";
import type {
  StudioState,
  StudioAction,
  StudioFile,
} from "@/types/studio";
import {
  createDefaultState,
  getAllSources,
  contentHash,
} from "@/types/studio";

const SESSION_KEY = "studio-workspace";
const PERSIST_DEBOUNCE_MS = 1000;
const SIZE_WARN_BYTES = 50_000;

// --- Reducer (exported for testing) ---

export function studioReducer(state: StudioState, action: StudioAction): StudioState {
  switch (action.type) {
    case "CREATE_FILE": {
      // Reject if name already exists
      const nameExists = Object.values(state.files).some(
        (f) => f.name === action.name
      );
      if (nameExists) return state;

      const id = crypto.randomUUID();
      const newFile: StudioFile = {
        id,
        name: action.name,
        content: action.content ?? "",
      };
      return {
        ...state,
        files: { ...state.files, [id]: newFile },
        openTabs: [...state.openTabs, { fileId: id }],
        activeTabId: id,
      };
    }

    case "RENAME_FILE": {
      const file = state.files[action.fileId];
      if (!file) return state;
      // Reject if target name exists (on a different file)
      const nameExists = Object.values(state.files).some(
        (f) => f.id !== action.fileId && f.name === action.newName
      );
      if (nameExists) return state;

      return {
        ...state,
        files: {
          ...state.files,
          [action.fileId]: { ...file, name: action.newName },
        },
      };
    }

    case "DELETE_FILE": {
      const fileIds = Object.keys(state.files);
      // Reject if only one file remains
      if (fileIds.length <= 1) return state;

      const { [action.fileId]: _, ...remainingFiles } = state.files;
      const newTabs = state.openTabs.filter((t) => t.fileId !== action.fileId);

      // Focus neighbor if active tab was deleted
      let newActiveId = state.activeTabId;
      if (state.activeTabId === action.fileId) {
        const oldIndex = state.openTabs.findIndex(
          (t) => t.fileId === action.fileId
        );
        if (newTabs.length > 0) {
          const neighborIndex = Math.min(oldIndex, newTabs.length - 1);
          newActiveId = newTabs[neighborIndex].fileId;
        } else {
          // No open tabs — pick the first remaining file
          newActiveId = Object.keys(remainingFiles)[0] || null;
        }
      }

      return {
        ...state,
        files: remainingFiles,
        openTabs: newTabs,
        activeTabId: newActiveId,
      };
    }

    case "UPDATE_FILE_CONTENT": {
      const file = state.files[action.fileId];
      if (!file) return state;
      return {
        ...state,
        files: {
          ...state.files,
          [action.fileId]: { ...file, content: action.content },
        },
      };
    }

    case "IMPORT_FILES": {
      let newFiles = { ...state.files };
      let newTabs = [...state.openTabs];
      let firstNewId: string | null = null;

      for (const { name, content } of action.files) {
        // Skip duplicates
        const exists = Object.values(newFiles).some((f) => f.name === name);
        if (exists) continue;

        const id = crypto.randomUUID();
        newFiles[id] = { id, name, content };
        newTabs.push({ fileId: id });
        if (!firstNewId) firstNewId = id;
      }

      return {
        ...state,
        files: newFiles,
        openTabs: newTabs,
        activeTabId: firstNewId || state.activeTabId,
      };
    }

    case "OPEN_TAB": {
      // Don't add duplicate tabs
      if (state.openTabs.some((t) => t.fileId === action.fileId)) {
        return { ...state, activeTabId: action.fileId };
      }
      return {
        ...state,
        openTabs: [...state.openTabs, { fileId: action.fileId }],
        activeTabId: action.fileId,
      };
    }

    case "CLOSE_TAB": {
      const newTabs = state.openTabs.filter(
        (t) => t.fileId !== action.fileId
      );
      let newActiveId = state.activeTabId;

      if (state.activeTabId === action.fileId) {
        const oldIndex = state.openTabs.findIndex(
          (t) => t.fileId === action.fileId
        );
        if (newTabs.length > 0) {
          const neighborIndex = Math.min(oldIndex, newTabs.length - 1);
          newActiveId = newTabs[neighborIndex].fileId;
        } else {
          newActiveId = null;
        }
      }

      return {
        ...state,
        openTabs: newTabs,
        activeTabId: newActiveId,
      };
    }

    case "SET_ACTIVE_TAB":
      return { ...state, activeTabId: action.fileId };

    case "SET_COMPILE_TARGET":
      return { ...state, compileTarget: action.target };

    case "SET_COMPILED_HASH":
      return { ...state, compiledContentHash: action.hash };

    case "TOGGLE_SIDEBAR":
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };

    case "TOGGLE_OUTPUT":
      return { ...state, outputVisible: !state.outputVisible };

    case "HYDRATE":
      return action.state;

    default:
      return state;
  }
}

// --- Context ---

interface StudioContextValue {
  state: StudioState;
  dispatch: React.Dispatch<StudioAction>;
  activeFile: StudioFile | null;
  allSources: Record<string, { content: string }>;
  isDirtySinceCompile: boolean;
  currentContentHash: string;
}

const StudioContext = createContext<StudioContextValue | null>(null);

export function useStudio(): StudioContextValue {
  const ctx = useContext(StudioContext);
  if (!ctx) throw new Error("useStudio must be used within StudioProvider");
  return ctx;
}

// --- Provider ---

export function StudioProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(studioReducer, null, () => {
    // Try hydrating from sessionStorage
    if (typeof window === "undefined") return createDefaultState();
    try {
      const stored = sessionStorage.getItem(SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Basic validation
        if (parsed.files && parsed.openTabs) {
          return { ...createDefaultState(), ...parsed } as StudioState;
        }
      }
    } catch {
      // Fall through to default
    }
    return createDefaultState();
  });

  // Debounced sessionStorage persistence
  const persistTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    persistTimerRef.current = setTimeout(() => {
      try {
        const serialized = JSON.stringify({
          files: state.files,
          openTabs: state.openTabs,
          activeTabId: state.activeTabId,
          sidebarCollapsed: state.sidebarCollapsed,
          outputVisible: state.outputVisible,
          compileTarget: state.compileTarget,
          // Don't persist compiledContentHash — artifacts aren't persisted
        });
        if (serialized.length > SIZE_WARN_BYTES) {
          console.warn(
            `[Studio] Workspace state is ${(serialized.length / 1024).toFixed(1)}KB`
          );
        }
        sessionStorage.setItem(SESSION_KEY, serialized);
      } catch {
        // sessionStorage full or unavailable
      }
    }, PERSIST_DEBOUNCE_MS);
    return () => {
      if (persistTimerRef.current) clearTimeout(persistTimerRef.current);
    };
  }, [state]);

  // Derived values
  const activeFile = state.activeTabId
    ? state.files[state.activeTabId] ?? null
    : null;

  const allSources = getAllSources(state.files);
  const currentContentHash = contentHash(allSources);

  const isDirtySinceCompile =
    state.compiledContentHash === null ||
    state.compiledContentHash !== currentContentHash;

  const value: StudioContextValue = {
    state,
    dispatch,
    activeFile,
    allSources,
    isDirtySinceCompile,
    currentContentHash,
  };

  return (
    <StudioContext.Provider value={value}>{children}</StudioContext.Provider>
  );
}
