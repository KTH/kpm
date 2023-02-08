import React, {
  RefObject,
  useState,
  useEffect,
  useRef,
  MutableRefObject,
} from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { i18n } from "../i18n/i18n";

import "./groups.scss";

export function CollapsableGroup({
  title,
  children,
  defaultOpen = false,
}: any) {
  return (
    <details className="kpm-collapsable-group" open={defaultOpen}>
      <summary>{title}</summary>
      <ul className="kpm-link-list">{children}</ul>
    </details>
  );
}

type TStyle = Record<string, string | undefined> | undefined;

type TDropdownMenuGroupProps = {
  title: string;
  className?: string;
  children: any;
  revealUp?: boolean;
  alignRight?: boolean;
  defaultOpen?: boolean;
};

export function DropdownMenuGroup({
  title,
  className,
  children,
  revealUp = false,
  alignRight = false,
  defaultOpen = false,
}: TDropdownMenuGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpenRef = useRef(open);
  const [scrollOffset, setScrollOffset] = useState<number | null>(null);
  const scrollOffsetRef = useRef(scrollOffset);
  scrollOffsetRef.current = scrollOffset;
  const navigate = useNavigate();

  const [visiblyOpen, setVisiblyOpen] = useState(defaultOpen);
  const [dropdownStyle, setDropdownStyle]: [TStyle, Function] =
    useState(undefined);

  const detailsRef = useRef(null);
  const summaryRef = useRef(null);
  const dropdownRef = useRef(null);
  usePositionDropdown(
    detailsRef,
    summaryRef,
    dropdownRef,
    scrollOffsetRef,
    revealUp,
    alignRight,
    (newStyle: TStyle) => {
      if (newStyle === undefined || !isEqual(dropdownStyle, newStyle))
        setDropdownStyle(newStyle);
    }
  );

  const eventListenersSetRef = useRef(null);
  isOpenRef.current = open;
  useDropdownToggleListener(
    detailsRef,
    summaryRef,
    eventListenersSetRef,
    isOpenRef,
    setOpen,
    setScrollOffset
  );

  useEffect(() => {
    if (!open) {
      // Wait until animation has completed, NOTE! Hardcoded duration
      // TODO: This should only be done on mobile
      setTimeout(() => {
        setVisiblyOpen(false);
      }, 300);
    }

    if (open) {
      // Wait a tick to trigger animation
      requestAnimationFrame(() => {
        setVisiblyOpen(true);
      });
    }
  }, [open]);

  let innerCls = "kpm-link-list";
  if (open && visiblyOpen) {
    innerCls += " open";
  }
  const _inner = (
    <div style={dropdownStyle} className={innerCls}>
      <DropdownMobileHeader onBack={() => navigate(-1)} />
      <ul ref={dropdownRef}>{children}</ul>
    </div>
  );

  let cls = "kpm-dropdownmenu-group";
  if (className !== undefined) {
    cls += ` ${className}`;
  }

  return (
    <details ref={detailsRef} className={cls} open={open || visiblyOpen}>
      <summary ref={summaryRef}>{title}</summary>
      {_inner}
    </details>
  );
}

function isEqual(a: TStyle, b: TStyle): boolean {
  if (a === undefined || b === undefined) return a === b;
  const keys = { ...a, ...b };

  for (const key of Object.keys(keys)) {
    if (a[key] !== b[key]) {
      return false;
    }
  }

  return true;
}

export function GroupItem({ className, children }: any) {
  let cls = "item";
  if (className !== undefined) {
    cls += ` ${className}`;
  }
  return <li className={cls}>{children}</li>;
}

type TDropdownMobileHeaderProps = {
  onBack: () => void;
};

function DropdownMobileHeader({ onBack }: TDropdownMobileHeaderProps) {
  return (
    <a
      className="kpm-modal-back-button kpm-mobile"
      onClick={(e) => {
        e.preventDefault();
        onBack();
      }}
    >
      {i18n("Tillbaka")}
    </a>
  );
}

const KEY_ENTER = 13;
const KEY_ESC = 27;

function freezeParentModal(el: HTMLElement | null): number | null {
  let isKpmModal = false;
  while (el && el !== document.body) {
    isKpmModal = el.classList.contains("kpm-modal");
    if (isKpmModal) break;
    el = el.parentElement;
  }

  if (el && isKpmModal) {
    el.classList.add("freeze");

    // Only return scrollTop if we have overflow: hidden
    // which only happens on mobile
    const cs = window.getComputedStyle(el);
    if (cs.getPropertyValue("overflow") === "hidden") {
      return el.scrollTop;
    }
  }

  return null;
}

function unfreezeParentModal(el: HTMLElement | null) {
  let isKpmModal = false;
  while (el && el !== document.body) {
    isKpmModal = el.classList.contains("kpm-modal");
    if (isKpmModal) break;
    el = el.parentElement;
  }

  if (el && isKpmModal) {
    el.classList.remove("freeze");
  }
}

function useDropdownToggleListener(
  detailsRef: RefObject<HTMLElement | null>,
  summaryRef: RefObject<HTMLElement | null>,
  eventListenersSetRef: MutableRefObject<boolean | null>,
  isOpenRef: RefObject<boolean>,
  setOpen: Function,
  setScrollOffset: Function
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
      setTimeout(() => setScrollOffset(null), 300);
      return;
    }
    if (!isOpenRef.current && nextState) {
      // Opening, do push
      const scrollOffset = freezeParentModal(detailsRef.current);
      setScrollOffset(scrollOffset);
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
const PADDING = 10;
function usePositionDropdown(
  detailsRef: RefObject<HTMLElement | null>,
  summaryRef: RefObject<HTMLElement | null>,
  dropdownRef: RefObject<HTMLElement | null>,
  scrollOffsetRef: RefObject<number | null>,
  toTop: boolean = false,
  toRight: boolean = false,
  callback: Function
) {
  const requestRef = useRef(0);

  const calculate = () => {
    if (typeof scrollOffsetRef.current === "number") {
      // We have a scrollTop value which means we are in fullscreen
      // mobile mode
      callback({
        top: `${scrollOffsetRef.current}px`,
        visibility: "visible",
        opacity: "1",
      });
      return (requestRef.current = requestAnimationFrame(calculate));
    }
    // Stop if unmounted
    const isOpen =
      (detailsRef.current as unknown as HTMLDetailsElement)?.open || false;
    const outer = summaryRef.current;
    const dropdown = dropdownRef.current;
    if (!isOpen || dropdown === null || outer === null) {
      callback(undefined);
      return (requestRef.current = requestAnimationFrame(calculate));
    }

    // 1. get viewport limits
    const viewport = window.visualViewport;
    const pageWidth = Math.round(viewport!.width);
    const pageHeight = Math.round(viewport!.height);
    // 2. get position and size of dropdown
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect
    const rect = outer.getBoundingClientRect();
    const elTop = Math.round(rect.top);
    const elBottom = Math.round(rect.bottom);
    const elLeft = Math.round(rect.left);
    const elRight = Math.round(rect.right);

    const dropdownWidth = dropdown.scrollWidth;
    const dropdownHeight = dropdown.scrollHeight;

    // 3. Adjust placement and size depending on available space
    const spaceTop = elTop;
    const spaceBottom = pageHeight - elBottom;
    const spaceLeft = elRight;
    const spaceRight = pageWidth - elLeft;

    // Should the dropdown open up or down? Depends on setting but also available space
    let placeTop;
    if (toTop) {
      if (
        spaceTop < dropdownHeight + PADDING &&
        spaceBottom > dropdownHeight + PADDING
      ) {
        // Flip to bottom because more space
        placeTop = false;
      } else {
        placeTop = true;
      }
    } else {
      if (
        spaceBottom < dropdownHeight + PADDING &&
        spaceTop > dropdownHeight + PADDING
      ) {
        // Flip to top beacuase more space
        placeTop = true;
      } else {
        placeTop = false;
      }
    }

    let deltaY; // may depend on actual height of dropdown
    if (placeTop) {
      deltaY = elTop - dropdownHeight;
    } else {
      deltaY = elBottom;
    }

    // Nudge placement on X axis depending on available space
    let placeRight;
    if (toRight) {
      if (
        spaceLeft < dropdownWidth + PADDING &&
        spaceRight > dropdownWidth + PADDING
      ) {
        // Flip to left aligned because more space
        placeRight = false;
      } else {
        placeRight = true;
      }
    } else {
      if (
        spaceRight < dropdownWidth + PADDING &&
        spaceLeft > dropdownWidth + PADDING
      ) {
        // Flip to right aligned because more space
        placeRight = true;
      } else {
        placeRight = false;
      }
    }

    let deltaX = placeRight ? elRight - dropdownWidth : elLeft;
    if (toRight) {
      if (deltaX < 0) {
        deltaX = elRight >= 0 ? 0 : elRight; // perhaps we shouldn't let nudge so far
      } else if (deltaX + dropdownWidth > pageWidth) {
        deltaX = pageWidth - dropdownWidth;
        if (deltaX + dropdownWidth < elLeft) {
          deltaX = elLeft - dropdownWidth; // perhaps we shouldn't let nudge so far
        }
      }
    } else {
      if (deltaX < 0) {
        deltaX = -elLeft;
        if (deltaX > elRight) {
          deltaX = elRight; // perhaps we shouldn't let nudge so far
        }
      } else if (deltaX + dropdownWidth > pageWidth) {
        deltaX = pageWidth - dropdownWidth;
        if (deltaX + dropdownWidth < elLeft) {
          deltaX = elLeft - dropdownWidth; // perhaps we shouldn't let nudge so far
        }
      }
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
