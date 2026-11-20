/**
 * Global reference-counted body scroll lock.
 * Allows multiple nested or consecutive modals/popups to safely lock body scroll
 * without overwriting or prematurely unlocking each other.
 */

let lockCount = 0;
let previousOverflow = "";

export function lockBodyScroll(): () => void {
  if (typeof document === "undefined") return () => {};

  if (lockCount === 0) {
    previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }
  lockCount++;

  let released = false;
  return () => {
    if (released) return;
    released = true;
    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
      document.body.style.overflow = previousOverflow || "";
    }
  };
}

export function isBodyScrollLocked(): boolean {
  if (typeof document === "undefined") return false;
  return lockCount > 0 || document.body.style.overflow === "hidden";
}
