export type IconName =
  | "check"
  | "chevron-left"
  | "copy"
  | "github"
  | "list"
  | "markdown"
  | "search"
  | "close"
  | "x"
  | "custom";

export type NavItem = {
  href: string;
  label: string;
};

export type SiteConfig = {
  project: {
    name: string;
    description: string;
    license: { name: string; url: string };
    github: {
      user?: string;
      organization?: string;
      repository: string;
    };
  };
  author?: {
    name: string;
    url: string;
    /** Required when url is not an x.com URL. Raw SVG markup rendered inline. */
    icon?: string;
  };
  credits?: Array<{
    name: string;
    url: string;
  }>;
};

export type DocsThemeConfig = SiteConfig & {
  site?: string;
  /**
   * Source icon(s) for favicons, apple-touch-icon, and webmanifest icons.
   * String: single 512x512 PNG/SVG used for all sizes.
   * Object: separate sources — `favicon` for tiny renders (favicon.svg/ico),
   * `manifest` for 96px and up (apple-touch, web-app-manifest).
   */
  icon?: string | { favicon: string; manifest: string };
  /** Show hue picker in header for interactive theme color customization. */
  huePicker?: boolean;
  /** Enable Astro View Transitions via ClientRouter. Default: true. */
  clientRouter?: boolean;
  shikiThemes?: {
    light: string;
    dark: string;
  };
  /** Enable full-text search. Default: true. */
  search?: boolean;
  /** Inject bundled Martian Grotesk + Mono fonts. Set false to opt out. Default: true. */
  fonts?: boolean;
  /** CSS files to inject into every page. Paths relative to project root. */
  customCss?: string[];
  /** Header navigation links. Hrefs may be relative ("api") or absolute ("/api"). */
  navLinks?: NavItem[];
  docs?: {
    /** Default: "src/content/docs". */
    directory?: string;
    deepSections?: string[];
    /** Auto-inject the default [...slug] page. Default: true. */
    renderDefaultPage?: boolean;
    /** TOC active-item selector used by the default page. Default: ".prose :is(h2, h3)[id]". */
    tocItemsSelector?: string;
  };
};

export type FileEntry = {
  name: string;
  type: "html" | "javascript" | "css" | "importmap";
  lang: "html" | "javascript" | "css";
  content: string;
};
