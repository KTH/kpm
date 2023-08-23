import { RefObject, useEffect, useRef, MutableRefObject } from "react";
import { useLocation, useSearchParams } from "react-router-dom";

const KEY_ENTER = 13;
const KEY_ESC = 27;

function getKpmModal(el: HTMLElement | null): HTMLElement | null {
  while (el && el !== document.body) {
    if (el.classList.contains("kpm-modal")) {
      return el;
    }
    el = el.parentElement;
  }

  return null;
}

let _isOnMobileBp: boolean | undefined;
export function isOnMobileBp(): boolean | undefined {
  if (_isOnMobileBp === undefined) {
    const el = document.getElementById("kpm-6cf53");
    if (el !== null) {
      const tmp = window.getComputedStyle(el, ":before").content;
      _isOnMobileBp = tmp === '"mobile"';
    }
  }
  requestAnimationFrame(() => (_isOnMobileBp = undefined));
  return _isOnMobileBp;
}

function freezeParentModal(el: HTMLElement | null) {
  const kpmModalEl = getKpmModal(el);

  if (kpmModalEl) {
    // Only return scrollTop if we have overflow: hidden
    // which only happens on mobile when .freeze is set
    kpmModalEl.classList.add("freeze");
  }
}

function unfreezeParentModal(el: HTMLElement | null) {
  const kpmModalEl = getKpmModal(el);

  if (kpmModalEl) {
    kpmModalEl.classList.remove("freeze");
  }
}

export function useDropdownToggleListener(
  detailsRef: RefObject<HTMLElement | null>,
  summaryRef: RefObject<HTMLElement | null>,
  eventListenersSetRef: MutableRefObject<boolean | null>,
  isOpenRef: RefObject<boolean>,
  setOpen: Function
  // setSearchParams: Function
) {
  const location = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const _setOpen = (nextState: boolean) => {
    if (isOpenRef.current && !nextState) {
      // Closing
      // I initially used navigate(-1) but this fires more than once
      setSearchParams("", { replace: true });
      unfreezeParentModal(detailsRef.current);
    }
    if (!isOpenRef.current && nextState) {
      // Opening, do push
      freezeParentModal(detailsRef.current);
      setSearchParams("ddo");
    }
    setOpen(nextState);
  };

  function didKeyDownDetails(e: any) {
    // Always close on ESC if open
    if (e.which === KEY_ESC && isOpenRef.current) {
      e.preventDefault();
      _setOpen(false);
    }

    // Close on ENTER outside dropdown if open
    if (
      e.which === KEY_ENTER &&
      isOpenRef.current &&
      !detailsRef.current?.contains(e.target)
    ) {
      e.preventDefault();
      _setOpen(false);
    }

    // Only toggle if ENTER is fired when on or in <summary>
    if (e.which === KEY_ENTER) {
      if (summaryRef.current?.contains(e.target)) {
        e.preventDefault();
        _setOpen(!isOpenRef.current);
      }
    }
  }

  function didClick(e: any) {
    // Toggle when clicking summary
    if (summaryRef.current?.contains(e.target)) {
      const currentOpen = isOpenRef.current;
      // Click triggers <detail> open so we need the setTimeout workaround
      setTimeout(() => {
        e.preventDefault();
        _setOpen(!currentOpen);
      });
    }

    // Close if open and clicking somewhere else than dropdown
    if (isOpenRef.current && !detailsRef.current?.contains(e.target)) {
      e.preventDefault();
      _setOpen(false);
    }
  }

  useEffect(() => {
    if (eventListenersSetRef.current === null) {
      document.body.addEventListener("keydown", didKeyDownDetails);
      document.body.addEventListener("click", didClick);
      eventListenersSetRef.current = true;
    }
    return () => {
      document.body.removeEventListener("keydown", didKeyDownDetails);
      document.body.removeEventListener("click", didClick);
      eventListenersSetRef.current = false;
    };
  }, []);

  useEffect(() => {
    // Close on navigation (listens to changes of navigation)
    if (isOpenRef.current) {
      setOpen(false);
      unfreezeParentModal(detailsRef.current);
    }
    return () => {};
  }, [location]);
}

/**
 Adjust size of dropdown to avoid overflow and switch side (vertical only) to allow
 best use of available screen realestate.
 
 We do this continuosly on animation frame becuase there are lots of layout changes
 that can affect the placement and don't generate events.
 
 Currently we aren't aware of the menubar so the popup needs to be layered on top to make
 sure we don't hide it with the menubar. This looks wierd if we aren't in modal mode
 (default) but not worth pursuing a fix for now.
 */
const PADDING = 10; // This value is used in groups.scss, search for PADDING
export function usePositionDropdown(
  menuWrapperRef: RefObject<HTMLElement | null>,
  dropdownRef: RefObject<HTMLElement | null>,
  isOpenRef: RefObject<boolean>,
  toTop: boolean = false,
  toRight: boolean = false,
  callback: Function
) {
  const requestRef = useRef(0);

  const calculate = () => {
    if (isOnMobileBp()) {
      // We have a scrollTop value which means we are in fullscreen
      // mobile mode
      let scrollOffset = 0;
      const kpmModalEl = getKpmModal(menuWrapperRef.current);
      if (kpmModalEl) {
        scrollOffset = kpmModalEl.scrollTop;
      }
      callback({
        top: `${scrollOffset}px`,
        visibility: "visible",
        opacity: "1",
      });
      return (requestRef.current = requestAnimationFrame(calculate));
    }

    // Stop if unmounted
    const isOpen = isOpenRef.current || false;
    const outer = dropdownRef.current;
    const menu = menuWrapperRef.current;
    if (!isOpen || menu === null || outer === null) {
      callback(undefined);
      return (requestRef.current = requestAnimationFrame(calculate));
    }

    // 1. get viewport limits
    const viewport = window.visualViewport;
    const pageWidth = Math.round(viewport!.width);
    const pageHeight = Math.round(viewport!.height);
    // 2. get position and size of menu
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    const rect = outer.getBoundingClientRect();
    const elTop = Math.round(rect.top);
    const elBottom = Math.round(rect.bottom);
    const elLeft = Math.round(rect.left);
    const elRight = Math.round(rect.right);
    const elHeight = elBottom - elTop;
    const elWidth = elRight - elLeft;

    const menuWidth = menu.scrollWidth;
    const menuHeight = menu.scrollHeight;

    // 3. Adjust placement and size depending on available space
    const spaceTop = elTop;
    const spaceBottom = pageHeight - elBottom;
    const spaceLeft = elRight;
    const spaceRight = pageWidth - elLeft;

    // Should the menu open up or down? Depends on setting but also available space
    let placeTop;
    if (toTop) {
      if (
        spaceTop < menuHeight + PADDING &&
        spaceBottom > menuHeight + PADDING
      ) {
        // Flip to bottom because more space
        placeTop = false;
      } else {
        placeTop = true;
      }
    } else {
      if (
        spaceBottom < menuHeight + PADDING &&
        spaceTop > menuHeight + PADDING
      ) {
        // Flip to top beacuase more space
        placeTop = true;
      } else {
        placeTop = false;
      }
    }

    let deltaY; // may depend on actual height of menu
    if (spaceTop + spaceBottom < menuHeight + PADDING) {
      // Not enough space on on either end, fill page
      deltaY = -elTop - elHeight + PADDING;
    } else if (placeTop) {
      deltaY = -elHeight - menuHeight;
    } else {
      if (spaceBottom < menuHeight + PADDING) {
        // Move up to fit
        deltaY = spaceBottom - menuHeight - PADDING;
      } else {
        deltaY = 0;
      }
    }

    // Nudge placement on X axis depending on available space
    let placeRight;
    if (toRight) {
      if (spaceLeft < menuWidth + PADDING && spaceRight > menuWidth + PADDING) {
        // Flip to left aligned because more space
        placeRight = false;
      } else {
        placeRight = true;
      }
    } else {
      if (spaceRight < menuWidth + PADDING && spaceLeft > menuWidth + PADDING) {
        // Flip to right aligned because more space
        placeRight = true;
      } else {
        placeRight = false;
      }
    }

    let deltaX = placeRight ? elWidth - menuWidth : 0;
    if (toRight) {
      deltaX = menuWidth - elWidth;
    }

    let newTransform: any = {
      transform: `translate(${deltaX}px, ${deltaY}px)`,
      visibility: "visible",
      opacity: "1",
    };
    callback(newTransform);
    requestRef.current = requestAnimationFrame(calculate);
  };

  // Continue polling until unmounted
  useEffect(() => {
    requestRef.current = requestAnimationFrame(calculate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}
