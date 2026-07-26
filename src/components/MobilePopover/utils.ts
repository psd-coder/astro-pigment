/** Popover ids the mobile panels render with, keyed by the trigger Layout emits for them. */
export const MOBILE_POPOVERS = {
  nav: "mobile-nav",
  toc: "mobile-toc",
} as const;

export type MobilePopoverName = keyof typeof MOBILE_POPOVERS;

// The panels live inside Layout's sidebar slots while their triggers sit in one floating
// group Layout renders. Each panel registers itself as its slot renders, so Layout can emit
// the matching triggers once the awaited slots resolve — no props to keep in sync.
export const registerMobilePopover = (locals: App.Locals, popover: MobilePopoverName): void => {
  (locals.pigmentMobilePopovers ??= new Set()).add(popover);
};

export const hasMobilePopover = (locals: App.Locals, popover: MobilePopoverName): boolean =>
  locals.pigmentMobilePopovers?.has(popover) ?? false;
