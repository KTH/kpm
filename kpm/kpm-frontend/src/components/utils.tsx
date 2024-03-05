export function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "kth-menu-item dropdown active" : "kth-menu-item dropdown";
}

export function formatDisplayName(name?: string) {
  return name?.split(" ")[0];
}
