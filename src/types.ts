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

export type OgImageSource =
  | string
  | true
  | {
      logo?: string | false;
      template?: string;
      title?: string;
      description?: string;
    };

export type OgTemplateFont = {
  name: string;
  data: ArrayBuffer;
  weight?: number;
  style?: "normal" | "italic";
};

export type OgTemplateContext = {
  projectName: string;
  description: string;
  siteUrl: string;
  pathname: string;
  /** Data URI + natural dimensions of the OG logo (from `meta.og.logo` or top-level `logo`). */
  logo?: { src: string; width: number; height: number };
  hue: number;
  fonts: OgTemplateFont[];
};

export type OgTemplateFn = (ctx: OgTemplateContext) => unknown | Promise<unknown>;

export type DocsThemeConfig = SiteConfig & {
  /** Path to SVG file rendered as the header logo. Replaces the default project name text. */
  logo?: string;
  /** Show hue picker in header for interactive theme color customization. */
  huePicker?: boolean;
  /** Enable Astro View Transitions via ClientRouter. Default: true. */
  clientRouter?: boolean;
  /** Enable full-text search. Default: true. */
  search?: boolean;
  /** Theme customization. Consumed by CSS variables, fonts, custom CSS, and syntax highlighting. */
  theme?: {
    /** Base hue (0-360). Default: 180. */
    hue?: number;
    /** Shiki themes. Overrides the default adaptive hue-based theme. */
    shiki?: {
      light: string;
      dark: string;
    };
    /** Inject bundled Martian Grotesk + Mono fonts. Set false to opt out. Default: true. */
    fonts?: boolean;
    /** CSS files to inject into every page. Paths relative to project root. */
    customCss?: string[];
  };
  docs?: {
    /** Default: "src/content/docs". */
    directory?: string;
    /** Auto-inject the default [...slug] page. Default: true. */
    renderDefaultPage?: boolean;
    /** Header navigation links. Hrefs may be relative ("api") or absolute ("/api"). */
    navLinks?: NavItem[];
    /**
     * Path to a module (relative to project root) that default-exports
     * `ExtraEntry[]` or `() => Promise<ExtraEntry[]>`.
     * Entries are included in search index, llms.txt, and llms-full.txt.
     */
    extraEntries?: string;
  };
  meta?: {
    /** HTML lang attribute. Default: "en". */
    lang?: string;
    /** Appended as " | {suffix}" to sub-page titles. false = no suffix. Default: project.name. */
    titleSuffix?: string | false;
    /** Full <title> for the root/index page. Default: "{project.name} Documentation". */
    mainPageTitle?: string;
    /**
     * Source icon(s) for favicons, apple-touch-icon, and webmanifest icons.
     * String: single 512x512 PNG/SVG used for all sizes.
     * Object: separate sources — `favicon` for tiny renders (favicon.svg/ico),
     * `manifest` for 96px and up (apple-touch, web-app-manifest).
     */
    icon?: string | { favicon: string; manifest: string };
    /**
     * Open Graph image. Defaults to `true` (built-in template) when unset.
     * - string: path to a PNG file relative to project root (served as-is).
     * - true: built-in template, uses top-level `logo` if set.
     * - object: override template / logo / title / description. Omit `template` for built-in.
     */
    og?: {
      image?: OgImageSource;
      imageAlt?: string;
    };
    /** Twitter card metadata. Image defaults to og.image. */
    twitter?: {
      site?: string;
      creator?: string;
      image?: OgImageSource;
      imageAlt?: string;
    };
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
