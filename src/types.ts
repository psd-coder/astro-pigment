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

export type AlternateLink = {
  type: string;
  title: string;
  href: string;
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
    /** Required when url is not an x.com URL. Path to SVG file rendered inline in the header. */
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
  /** Path to SVG file rendered as the header logo. Replaces the default project name text. */
  logo?: string;
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
  docs?: {
    /** Default: "src/content/docs". */
    directory?: string;
    /** Auto-inject the default [...slug] page. Default: true. */
    renderDefaultPage?: boolean;
    /** Header navigation links. Hrefs may be relative ("api") or absolute ("/api"). */
    navLinks?: NavItem[];
  };
  /**
   * Path to a module (relative to project root) that default-exports
   * `ExtraEntry[]` or `() => Promise<ExtraEntry[]>`.
   * Entries are included in search index, llms.txt, and llms-full.txt.
   */
  extraEntries?: string;
  meta?: {
    /** HTML lang attribute. Default: "en". */
    lang?: string;
    /** Appended as " | {suffix}" to sub-page titles. false = no suffix. Default: project.name. */
    titleSuffix?: string | false;
    /** Full <title> for the root/index page. Default: "{project.name} Documentation". */
    mainPageTitle?: string;
  };
};

export type ExtraEntry = {
  /** URL path segment, used as pageId in search. E.g. "examples/counter" */
  id: string;
  title: string;
  description: string;
  /** Controls position relative to docs in search results and llms output. */
  order: number;
  /** Markdown body. Omit for pages with no textual content (e.g. index pages). */
  body?: string;
  /** Include in search index. Default: true. */
  search?: boolean;
  /** Include in llms.txt. Default: true. */
  llms?: boolean;
  /** Include in llms-full.txt. Default: true. */
  llmsFull?: boolean;
};

export type FileEntry = {
  name: string;
  type: "html" | "javascript" | "css" | "importmap";
  lang: "html" | "javascript" | "css";
  content: string;
};
