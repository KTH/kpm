import React, { MutableRefObject, useState, useEffect, useRef } from "react";

import "./groups.scss";

export function CollapsableGroup({
  title,
  children,
  defaultOpen = false,
}: any) {
  return (
    <details className="kpm-collapsable-group">
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
  modal?: boolean; // Will not allow other interactions until closed
};

export function DropdownMenuGroup({
  title,
  className,
  children,
  revealUp = false,
  alignRight = false,
  defaultOpen = false,
  modal = true,
}: TDropdownMenuGroupProps) {
  const [open, setOpen] = useState(defaultOpen);
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

  let cls = "kpm-dropdownmenu-group";
  if (className !== undefined) {
    cls += ` ${className}`;
  }

  return (
    <details
      ref={detailsRef}
      className={cls}
      open={open}
      onClick={(e) => {
        e.preventDefault();
        setOpen(!open);
      }}
    >
      <summary ref={summaryRef}>{title}</summary>
      {modal && (
        <div
          className="kpm-dropdownmeny-backdrop"
          onClick={(e) => {
            //e.preventDefault();
            setOpen(false);
          }}
        ></div>
      )}
      <div style={dropdownStyle} className="kpm-link-list">
        <ul ref={dropdownRef}>{children}</ul>
      </div>
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

const PADDING = 10;

/**
  Adjust size of dropdown to avoid overflow and switch side (vertical only) to allow
  best use of available screen realestate.

  We do this continuosly on animation frame becuase there are lots of layout changes
  that can affect the placement and don't generate events.

  Currently we aren't aware of the menubar so the popup needs to be layered on top to make
  sure we don't hide it with the menubar. This looks wierd if we aren't in modal mode
  (default) but not worth pursuing a fix for now.
 */
function usePositionDropdown(
  detailsRef: MutableRefObject<HTMLElement | null>,
  summaryRef: MutableRefObject<HTMLElement | null>,
  dropdownRef: MutableRefObject<HTMLElement | null>,
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

    const cs = window.getComputedStyle(dropdown);
    const minHeight = parseFloat(cs.getPropertyValue("min-height")) || 200;

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
    let deltaX = toRight ? elRight - dropdownWidth : elLeft;
    let width = elWidth;
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
