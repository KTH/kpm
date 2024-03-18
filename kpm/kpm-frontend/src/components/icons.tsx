import React, { Fragment } from "react";
import { i18n } from "../i18n/i18n";
import "./icons.scss";

type TLinkIconProps = {
  href: string;
  target?: string | undefined;
  title?: string | undefined;
};
type TNotificationIconProps = {
  href: string;
  nNew?: number;
};

export function IconNotifications({ href, nNew }: TNotificationIconProps) {
  const has_new = nNew !== undefined && nNew > 0;
  const className =
    nNew === undefined
      ? "kpm-icon-button notifications kpm-loading"
      : has_new
      ? "kpm-icon-button notifications kpm-has-new-notices"
      : "kpm-icon-button notifications";

  return (
    <a className={className} href={href}>
      <span className="kth-visually-hidden">
        {i18n("Direct notifications")}
      </span>
      {has_new && (
        <Fragment>
          <span className="kpm-notice-new">{nNew}</span>
          <span className="kth-visually-hidden">{i18n("dn-new")}</span>
        </Fragment>
      )}
    </a>
  );
}

export function IconSettings({
  href,
  target = undefined,
  title = undefined,
}: TLinkIconProps) {
  return (
    <a className="icon" href={href} target={target}>
      <svg
        viewBox="0 0 86 86"
        xmlns="http://www.w3.org/2000/svg"
        width="1.2em"
        height="1.2em"
      >
        <title>
          Select how you are notified, how the schedule is displayed, or remove
          subscriptions.
        </title>
        <path
          d="M11.41 72.18a42.98 42.98 0 0 0 20.65 12.41A10.62 10.62 0 0 1 32 83.5a10.5 10.5 0 1 1 20.91 1.35 42.95 42.95 0 0 0 21.3-12.28 10.5 10.5 0 0 1 10.3-18.3 43.05 43.05 0 0 0 0-22.54 10.5 10.5 0 0 1-10.3-18.3A42.94 42.94 0 0 0 52 .94l.01.56a10.5 10.5 0 0 1-21 .2 43 43 0 0 0-19.59 12.12A10.49 10.49 0 0 1 1.38 32.16a43.07 43.07 0 0 0 0 21.68 10.5 10.5 0 0 1 10.04 18.34zM42 57.94a15 15 0 1 0 0-30 15 15 0 0 0 0 30z"
          fill="currentColor"
          fillRule="evenodd"
        ></path>
      </svg>
    </a>
  );
}

export type TStarProps = {
  kind: "group" | "program";
  slug: string;
  starred: boolean;
};

export function StarableItem({
  className,
  starred,
  children,
  onToggle,
}: {
  className?: string | null | undefined;
  starred: boolean;
  children: any;
  onToggle(): void;
}) {
  let cls = "starrable";
  if (starred) {
    cls += " active";
  }
  if (className) {
    cls = `${className} ${cls}`;
  }

  return (
    // TODO: Do we really need CSS class active?
    <li className={cls}>
      <IconStar starred={starred} onClick={() => onToggle()} />
      {children}
    </li>
  );
}

export function IconStar({
  starred,
  onClick,
}: {
  starred: boolean;
  onClick(e: any): void;
}) {
  return (
    <button className="icon star" onClick={onClick}>
      <svg
        className={starred ? "active" : undefined}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 20 19"
      >
        {starred && (
          <path
            d="M10,15.27l6.18,3.73-1.64-7.03,5.46-4.73-7.19-.62L10,0l-2.81,6.62L0,7.24l5.45,4.73-1.63,7.03,6.18-3.73Z"
            fill="currentColor"
          />
        )}
        {!starred && (
          <path
            d="M10,13.39l-3.76,2.27,.99-4.28-3.32-2.88,4.38-.37,1.71-4.04,1.71,4.04,4.38,.37-3.32,2.88,.99,4.28m6.24-8.42l-7.19-.61L10,0l-2.81,6.63L0,7.24l5.45,4.73-1.63,7.03,6.18-3.73,6.18,3.73-1.64-7.03s5.46-4.73,5.46-4.73Z"
            fill="currentColor"
          />
        )}
      </svg>
    </button>
  );
}
