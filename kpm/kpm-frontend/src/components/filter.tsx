import React from "react";
import "./filter.scss";

export function TabFilter({ children }: any) {
  return (
    <nav className="kpm-tab-filter">
      <ul>{children}</ul>
    </nav>
  );
}

type TOptionProps<T> = {
  value: T;
  filter: T;
  children: string;
  onSelect(value: any): void;
};

export function FilterOption<T = any>({
  value,
  filter,
  children,
  onSelect,
}: TOptionProps<T>) {
  return (
    <li className={filter === value ? "active" : undefined}>
      <button onClick={() => onSelect(value)}>{children}</button>
    </li>
  );
}
