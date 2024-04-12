export function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive
    ? "kpm-menu-item kth-menu-item dropdown active"
    : "kpm-menu-item kth-menu-item dropdown";
}

export function formatDisplayName(name?: string) {
  return name?.split(" ")[0];
}
