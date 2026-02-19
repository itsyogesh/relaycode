import { renderHook, act } from "@testing-library/react";
import useScroll from "../../hooks/use-scroll";

describe("useScroll", () => {
  const removeSpy = jest.spyOn(window, "removeEventListener");

  beforeEach(() => {
    Object.defineProperty(window, "pageYOffset", {
      writable: true,
      value: 0,
    });
  });

  it("returns false initially when not scrolled past threshold", () => {
    const { result } = renderHook(() => useScroll(100));
    expect(result.current).toBe(false);
  });

  it("returns true when scrolled past threshold", () => {
    const { result } = renderHook(() => useScroll(100));
    act(() => {
      Object.defineProperty(window, "pageYOffset", {
        writable: true,
        value: 150,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);
  });

  it("returns false when scrolled back under threshold", () => {
    const { result } = renderHook(() => useScroll(100));
    act(() => {
      Object.defineProperty(window, "pageYOffset", {
        writable: true,
        value: 150,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(true);
    act(() => {
      Object.defineProperty(window, "pageYOffset", {
        writable: true,
        value: 50,
      });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(result.current).toBe(false);
  });

  it("cleans up scroll listener on unmount", () => {
    const { unmount } = renderHook(() => useScroll(100));
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
  });
});
