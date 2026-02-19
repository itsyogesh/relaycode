jest.mock("../../components/ui/toast", () => ({}));

import { reducer, useToast, toast } from "../../hooks/use-toast";
import { renderHook, act } from "@testing-library/react";

describe("toast reducer", () => {
  describe("ADD_TOAST", () => {
    it("adds a toast to empty state", () => {
      const state = { toasts: [] };
      const toast = { id: "1", title: "Test", open: true } as any;
      const result = reducer(state, { type: "ADD_TOAST", toast });
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("1");
    });

    it("prepends new toast and respects TOAST_LIMIT of 1", () => {
      const state = { toasts: [{ id: "1", title: "Old", open: true } as any] };
      const toast = { id: "2", title: "New", open: true } as any;
      const result = reducer(state, { type: "ADD_TOAST", toast });
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });
  });

  describe("UPDATE_TOAST", () => {
    it("updates matching toast by id", () => {
      const state = { toasts: [{ id: "1", title: "Old" } as any] };
      const result = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "1", title: "New" },
      });
      expect(result.toasts[0].title).toBe("New");
    });

    it("leaves non-matching toasts unchanged", () => {
      const state = {
        toasts: [
          { id: "1", title: "Keep" } as any,
          { id: "2", title: "Also keep" } as any,
        ],
      };
      const result = reducer(state, {
        type: "UPDATE_TOAST",
        toast: { id: "3", title: "New" },
      });
      expect(result.toasts[0].title).toBe("Keep");
      expect(result.toasts[1].title).toBe("Also keep");
    });
  });

  describe("DISMISS_TOAST", () => {
    beforeEach(() => jest.useFakeTimers());
    afterEach(() => jest.useRealTimers());

    it("sets open:false for specific toast", () => {
      const state = {
        toasts: [
          { id: "1", open: true } as any,
          { id: "2", open: true } as any,
        ],
      };
      const result = reducer(state, { type: "DISMISS_TOAST", toastId: "1" });
      expect(result.toasts[0].open).toBe(false);
      expect(result.toasts[1].open).toBe(true);
    });

    it("sets open:false for all toasts when no toastId", () => {
      const state = {
        toasts: [
          { id: "1", open: true } as any,
          { id: "2", open: true } as any,
        ],
      };
      const result = reducer(state, { type: "DISMISS_TOAST" });
      expect(result.toasts.every((t: any) => t.open === false)).toBe(true);
    });
  });

  describe("REMOVE_TOAST", () => {
    it("removes specific toast by id", () => {
      const state = { toasts: [{ id: "1" } as any, { id: "2" } as any] };
      const result = reducer(state, { type: "REMOVE_TOAST", toastId: "1" });
      expect(result.toasts).toHaveLength(1);
      expect(result.toasts[0].id).toBe("2");
    });

    it("clears all toasts when no toastId", () => {
      const state = { toasts: [{ id: "1" } as any, { id: "2" } as any] };
      const result = reducer(state, { type: "REMOVE_TOAST" });
      expect(result.toasts).toHaveLength(0);
    });
  });
});

describe("toast function", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("creates a toast and returns id, dismiss, update", () => {
    const result = toast({ title: "Hello" } as any);
    expect(result.id).toBeDefined();
    expect(typeof result.dismiss).toBe("function");
    expect(typeof result.update).toBe("function");
  });

  it("dismiss function dismisses the toast", () => {
    const { result } = renderHook(() => useToast());
    let toastResult: any;
    act(() => {
      toastResult = result.current.toast({ title: "Test" } as any);
    });
    expect(result.current.toasts.length).toBeGreaterThanOrEqual(1);
    act(() => {
      toastResult.dismiss();
    });
    expect(result.current.toasts[0]?.open).toBe(false);
  });

  it("update function updates the toast", () => {
    const { result } = renderHook(() => useToast());
    let toastResult: any;
    act(() => {
      toastResult = result.current.toast({ title: "Initial" } as any);
    });
    act(() => {
      toastResult.update({ id: toastResult.id, title: "Updated" } as any);
    });
    expect(result.current.toasts[0]?.title).toBe("Updated");
  });
});

describe("useToast hook", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("returns current toast state", () => {
    const { result } = renderHook(() => useToast());
    expect(result.current.toasts).toBeDefined();
    expect(typeof result.current.toast).toBe("function");
    expect(typeof result.current.dismiss).toBe("function");
  });

  it("dismiss function from hook dismisses all toasts", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: "Toast 1" } as any);
    });
    act(() => {
      result.current.dismiss();
    });
    expect(result.current.toasts.every((t: any) => t.open === false)).toBe(true);
  });

  it("onOpenChange callback dismisses toast when open is false", () => {
    const { result } = renderHook(() => useToast());
    act(() => {
      result.current.toast({ title: "Test" } as any);
    });
    const toastItem = result.current.toasts[0];
    act(() => {
      toastItem?.onOpenChange?.(false);
    });
    expect(result.current.toasts[0]?.open).toBe(false);
  });

  it("cleans up listener on unmount", () => {
    const { unmount } = renderHook(() => useToast());
    // Should not throw on unmount
    expect(() => unmount()).not.toThrow();
  });
});
