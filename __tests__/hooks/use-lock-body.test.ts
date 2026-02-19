import { renderHook } from "@testing-library/react";
import { useLockBody } from "../../hooks/use-lock-body";

describe("useLockBody", () => {
  it("sets body overflow to hidden on mount", () => {
    document.body.style.overflow = "auto";
    renderHook(() => useLockBody());
    expect(document.body.style.overflow).toBe("hidden");
  });

  it("restores original overflow on unmount", () => {
    document.body.style.overflow = "auto";
    const { unmount } = renderHook(() => useLockBody());
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
    expect(document.body.style.overflow).toBe("auto");
  });

  it("handles no initial overflow style", () => {
    document.body.style.overflow = "";
    const { unmount } = renderHook(() => useLockBody());
    expect(document.body.style.overflow).toBe("hidden");
    unmount();
  });
});
