// useIsMobile.test.jsx
import { renderHook, waitFor, act } from "@testing-library/react";
import { useIsMobile } from "@/hooks/use-mobile";

// Save the original window.matchMedia so we can restore it after tests.
const originalMatchMedia = window.matchMedia;

describe("useIsMobile", () => {
  // Variable to capture the "change" callback provided via addEventListener.
  let changeCallback = null;

  beforeEach(() => {
    // Setup a mock matchMedia implementation that captures the change callback.
    window.matchMedia = jest.fn().mockImplementation((query) => {
      return {
        matches: window.innerWidth < 768, // MOBILE_BREAKPOINT is 768
        media: query,
        onchange: null,
        addEventListener: (event, cb) => {
          if (event === "change") {
            changeCallback = cb;
          }
        },
        removeEventListener: jest.fn(),
        addListener: jest.fn(), // For older browsers
        removeListener: jest.fn(), // For older browsers
        dispatchEvent: jest.fn(),
      };
    });
  });

  afterEach(() => {
    // Restore the original window.matchMedia and reset the callback.
    window.matchMedia = originalMatchMedia;
    changeCallback = null;
  });

  test("returns true when window.innerWidth is less than MOBILE_BREAKPOINT", async () => {
    global.innerWidth = 500; // Simulate a mobile width (500 < 768)
    const { result } = renderHook(() => useIsMobile());

    // Wait for the effect to run and update state.
    await waitFor(() => result.current === true);
    expect(result.current).toBe(true);
  });

  test("returns false when window.innerWidth is greater than or equal to MOBILE_BREAKPOINT", async () => {
    global.innerWidth = 1024; // Simulate a desktop width (1024 >= 768)
    const { result } = renderHook(() => useIsMobile());

    // Wait for the effect to run and update state.
    await waitFor(() => result.current === false);
    expect(result.current).toBe(false);
  });

  test("updates state on media query change event using setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)", async () => {
    // Start with a desktop width.
    global.innerWidth = 1024;
    const { result } = renderHook(() => useIsMobile());

    // Confirm the initial state is false (desktop).
    await waitFor(() => result.current === false);
    expect(result.current).toBe(false);

    // Now, change to a mobile width.
    global.innerWidth = 500;

    // Simulate the media query change event.
    if (changeCallback) {
      act(() => {
        changeCallback({});
      });
    }

    // Wait for the hook's state to update.
    await waitFor(() => result.current === true);
    expect(result.current).toBe(true);
  });
});
