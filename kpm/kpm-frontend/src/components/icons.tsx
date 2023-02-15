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

type TIconProps = {
  title?: string | undefined;
  className?: string | undefined;
};

export function IconMail({
  href,
  target = undefined,
  title = undefined,
}: TLinkIconProps) {
  return (
    <a href={href} target={target}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 -100 1000 900"
        width="1em"
        height="1em"
        version="1.1"
      >
        <title>{i18n("KTH Webmail")}</title>
        <path
          fill="currentColor"
          d="M 30,54 Q -2,36 2,14 4,0 28,0 h 846 q 38,0 20,32 -8,14 -24,22 -14,6 -192,102 -178,96 -182,98 -16,10 -46,10 -28,0 -46,-10 -4,-2 -182,-98 Q 44,60 30,54 Z m 850,100 q 20,-10 20,10 v 368 q 0,16 -17,32 -17,16 -33,16 H 50 Q 34,580 17,564 0,548 0,532 V 164 q 0,-20 20,-10 l 384,200 q 18,10 46,10 28,0 46,-10 z"
        ></path>
      </svg>
    </a>
  );
}

export function IconNewsfeed({
  href,
  target = undefined,
  title = undefined,
}: TLinkIconProps) {
  return (
    <a href={href} target={target}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1"
        viewBox="0 -100 1000 900"
        width="1em"
        height="1em"
      >
        <title>{i18n("News feed")}</title>
        <desc>{i18n("News from your courses, groups and programmes")}</desc>
        <path
          fill="currentColor"
          d="M290 460h350l6-2h4v92q0 40-29 70t-71 30H300L150 800V650h-50q-40 0-70-30T0 550V250q0-42 30-71t70-29h190zm610-560q42 0 71 29t29 71v300q0 40-29 70t-71 30h-50v150L700 400H350V0q0-42 30-71t70-29z"
        ></path>
      </svg>
    </a>
  );
}

export function IconNotifications({ href, nNew }: TNotificationIconProps) {
  const has_new = nNew && nNew > 0 ? "icon kpm-has-new-notices" : undefined;
  const className =
    nNew === undefined
      ? "icon kpm-loading"
      : has_new
      ? "icon kpm-has-new-notices"
      : "icon";
  return (
    <a className={className} href={href}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        version="1"
        viewBox="0 -100 1000 900"
        width="1em"
        height="1em"
      >
        <title>{i18n("Direct notifications")}</title>
        <path
          fill="currentColor"
          d="M792 202q58 138 67 258t-39 140q-28 12-61-3t-65-40q-32-25-99-41t-149-8q-28 4-42 19t-6 37q22 56 46 108 4 10 24 22t24 20q14 34-22 46-50 22-102 40-30 10-54-42-32-76-58-132-6-12-34-17t-46-31l-38 14q-34 12-74-12t-54-60q-17-32-5-79t43-61q126-52 213-108t124-103q37-47 59-92t25-78q3-33 15-59t36-36q48-20 130 70t142 228zm-28 300q8-4 10-38t-11-98q-13-64-41-128-28-66-67-123t-67-84Q560 4 552 8t-10 42q-2 38 10 105t40 133q28 66 68 119t68 76q28 23 36 19z"
        ></path>
      </svg>
      {has_new && (
        <Fragment>
          <span className="kpm-notice-new">{nNew}</span>
          <span className="kpm-notice-new-trail">{i18n("dn-new")}</span>
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
    <svg
      onClick={onClick}
      className={starred ? "icon star active" : "icon star"}
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
  );
}
