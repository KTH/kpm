export function linkClassName({ isActive }: { isActive: boolean }) {
  return isActive ? "active" : "";
}

export function formatDisplayName(name: string) {
  return name.split(" ")[0];
}
