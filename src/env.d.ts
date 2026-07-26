/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    /** Mobile popovers rendered by the current page. See `components/MobilePopover/utils`. */
    pigmentMobilePopovers?: Set<import("./components/MobilePopover/utils").MobilePopoverName>;
  }
}

declare module "*.astro" {
  type AstroComponentFactory = import("astro/runtime/server/index.js").AstroComponentFactory;
  const component: AstroComponentFactory;
  export default component;
}
