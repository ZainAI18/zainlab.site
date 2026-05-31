export const NAVIGATE_EVENT = "zainlab:navigate";

export function navigateTo(path: string) {
  if (window.location.pathname === path) {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    return;
  }

  window.history.pushState({}, "", path);
  window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: path }));
}
