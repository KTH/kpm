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

function getFocusableElements(el: HTMLElement): HTMLElement[] | undefined {
  const focusableElements = el.querySelectorAll(
    "a[href]:not([disabled]), button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), summary, audio, video, form"
  );
  if (focusableElements.length === 0) {
    return;
  }

  const outp = [];
  for (let el of focusableElements) {
    const cs = window.getComputedStyle(el);
    if (cs.display !== "none" && cs.visibility !== "hidden") {
      outp.push(el as HTMLElement);
    }
  }

  return outp;
}

export function useFocusTrap(elRef: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const el = elRef.current;
      if (el === null) {
        return;
      }

      const els = getFocusableElements(el);
      const lastEl: HTMLElement | undefined = els?.[
        els.length - 1
      ] as HTMLElement;
      const firstEl: HTMLElement | undefined = els?.[0] as HTMLElement;
      const activeEl = document.activeElement;

      if (e.key === "Tab") {
        if (!e.shiftKey && (!el.contains(activeEl) || activeEl === lastEl)) {
          e.preventDefault();
          firstEl?.focus();
        } else if (
          e.shiftKey &&
          (!el.contains(activeEl) || activeEl === firstEl)
        ) {
          e.preventDefault();
          lastEl?.focus();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [elRef]);
}
