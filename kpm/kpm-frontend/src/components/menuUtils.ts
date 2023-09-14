import { RefObject, useEffect, useRef } from "react";

export function useOverflowClipOnDemand(elRef: RefObject<HTMLElement | null>) {
  const requestRef = useRef(0);

  const action = () => {
    // If element is max size vertically, set overflow to auto
    // otherwise leave it unset. This allows dropdowns to be
    // visible outside of modals when they extend beyond the
    // bottom of the modal.
    if (elRef.current !== null) {
      const el = elRef.current;
      const viewportHeight = window.visualViewport?.height ?? 0;
      const rect = el.getBoundingClientRect();
      const cs = window.getComputedStyle(el);
      const elContentHeight = el.scrollHeight;
      const elTop = rect.top;
      const elMarginBottom = parseInt(cs.marginBottom || "0", 10);
      if (elContentHeight + elTop + elMarginBottom >= viewportHeight) {
        if (cs.overflowY !== "auto") {
          el.style.overflowY = "auto";
        }
      } else {
        if (cs.overflowY !== "unset") {
          el.style.overflowY = "unset";
        }
      }
    }
    requestRef.current = requestAnimationFrame(action);
  };
  // Continue polling until unmounted
  useEffect(() => {
    requestRef.current = requestAnimationFrame(action);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}
