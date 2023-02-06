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
    revealUp,
    alignRight,
    (newStyle: TStyle) => {
      if (newStyle === undefined || !isEqual(dropdownStyle, newStyle))
        setDropdownStyle(newStyle);
    }
  );

  const eventListenersSetRef = useRef(null);
  const isOpenRef = useRef(open);
  isOpenRef.current = open;
  useDropdownToggleListener(
    detailsRef,
    summaryRef,
    eventListenersSetRef,
    isOpenRef,
    setOpen
  );

  useEffect(() => {
    if (!open) {
      // Wait until animation has completed, NOTE! Hardcoded duration
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

function useDropdownToggleListener(
  detailsRef: RefObject<HTMLElement | null>,
  summaryRef: RefObject<HTMLElement | null>,
  eventListenersSetRef: MutableRefObject<boolean | null>,
  isOpenRef: RefObject<boolean>,
  setOpen: Function
  // setSearchParams: Function
) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const _setOpen = (nextState: boolean) => {
    if (isOpenRef.current && !nextState) {
      // Closing, do pop if query param "open" exists
      if (searchParams.has("open")) {
        navigate(-1);
        return;
      }
    }
    if (!isOpenRef.current && nextState) {
      // Opening, do push
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
    if (isOpenRef.current && !searchParams.has("open")) {
      setOpen(false);
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
  toTop: boolean = false,
  toRight: boolean = false,
  callback: Function
) {
  const requestRef = useRef(0);

  const calculate = () => {
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
    const elHeight = Math.round(rect.height);
    const elWidth = Math.round(rect.width);

    const dropdownWidth = dropdown.scrollWidth;
    const dropdownHeight = dropdown.scrollHeight;

    // 3. Adjust placement and size depending on available space
    const spaceTop = elTop;
    const spaceBottom = pageHeight - elBottom;
    const spaceLeft = elRight;
    const spaceRight = pageWidth - elLeft;

    const cs = window.getComputedStyle(dropdown);
    const minHeight = getLargestCssValue(cs, ["min-height", "height"]) || 200;
    const minWidth = getLargestCssValue(cs, ["min-width", "width"]) || elWidth;

    // Should the dropdown open up or down? Depends on setting but also available space
    let placeTop;
    if (toTop) {
      if (spaceTop < minHeight + PADDING && spaceBottom > minHeight + PADDING) {
        // Flip to bottom because more space
        placeTop = false;
      } else {
        placeTop = true;
      }
    } else {
      if (spaceBottom < minHeight + PADDING && spaceTop > minHeight + PADDING) {
        // Flip to top beacuase more space
        placeTop = true;
      } else {
        placeTop = false;
      }
    }

    let deltaY; // may depend on actual height of dropdown
    let height = dropdownHeight;

    // Adjust size of dropdown if no space
    if (placeTop) {
      // Adjust space and placing for top position
      if (spaceTop < minHeight + PADDING) {
        height = minHeight;
      } else if (spaceTop < dropdownHeight + PADDING) {
        height = spaceTop - PADDING;
      }
      deltaY = elTop - height;
    } else {
      // Adjust space and placing for bottom position
      if (spaceBottom < minHeight + PADDING) {
        height = minHeight;
      } else if (spaceBottom < dropdownHeight + PADDING) {
        height = spaceBottom - PADDING;
      }
      deltaY = elBottom;
    }

    // Nudge placement on X axis depending on available space
    let placeRight;
    if (toRight) {
      if (spaceLeft < minWidth + PADDING && spaceRight > minWidth + PADDING) {
        // Flip to left aligned because more space
        placeRight = false;
      } else {
        placeRight = true;
      }
    } else {
      if (spaceRight < minWidth + PADDING && spaceLeft > minWidth + PADDING) {
        // Flip to right aligned because more space
        placeRight = true;
      } else {
        placeRight = false;
      }
    }

    let deltaX = placeRight ? elRight - dropdownWidth : elLeft;
    let width = minWidth;
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
    if (width !== undefined) {
      newTransform["width"] = `${width}px`;
    }
    if (height !== undefined) {
      newTransform["height"] = `${height}px`;
    }
    callback(newTransform);
    requestRef.current = requestAnimationFrame(calculate);
  };

  // Continue polling until unmounted
  useEffect(() => {
    requestRef.current = requestAnimationFrame(calculate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);
}

// Utils
function getLargestCssValue(cs: CSSStyleDeclaration, props: string[]) {
  let outp = 0;
  for (const p of props) {
    const tmp = parseFloat(cs.getPropertyValue(p)) || 0;
    outp = tmp > outp ? tmp : outp;
  }
  return outp;
}
