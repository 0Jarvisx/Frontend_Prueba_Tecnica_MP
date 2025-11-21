/**
 * Utility function to conditionally join class names
 * Similar to clsx/classnames but lightweight
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
