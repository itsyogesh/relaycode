import { renderHook } from "@testing-library/react";
import { useInterval } from "../../hooks/use-interval";

describe("useInterval", () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it("calls callback at the specified interval", () => {
    const callback = jest.fn();
    renderHook(() => useInterval(callback, 1000));
    expect(callback).not.toHaveBeenCalled();
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    jest.advanceTimersByTime(2000);
    expect(callback).toHaveBeenCalledTimes(3);
  });

  it("does not call when delay is null", () => {
    const callback = jest.fn();
    renderHook(() => useInterval(callback, null));
    jest.advanceTimersByTime(5000);
    expect(callback).not.toHaveBeenCalled();
  });

  it("cleans up on unmount", () => {
    const callback = jest.fn();
    const { unmount } = renderHook(() => useInterval(callback, 1000));
    jest.advanceTimersByTime(1000);
    expect(callback).toHaveBeenCalledTimes(1);
    unmount();
    jest.advanceTimersByTime(5000);
    expect(callback).toHaveBeenCalledTimes(1);
  });

  it("updates callback ref when callback changes", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { rerender } = renderHook(
      ({ cb }) => useInterval(cb, 1000),
      { initialProps: { cb: callback1 } }
    );
    jest.advanceTimersByTime(1000);
    expect(callback1).toHaveBeenCalledTimes(1);
    rerender({ cb: callback2 });
    jest.advanceTimersByTime(1000);
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it("does not restart interval when only callback changes", () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    const { rerender } = renderHook(
      ({ cb }) => useInterval(cb, 1000),
      { initialProps: { cb: callback1 } }
    );
    jest.advanceTimersByTime(500);
    rerender({ cb: callback2 });
    // Should fire after the remaining 500ms, not reset to 1000ms
    jest.advanceTimersByTime(500);
    expect(callback2).toHaveBeenCalledTimes(1);
    expect(callback1).toHaveBeenCalledTimes(0);
  });
});
