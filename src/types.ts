export type IconName =
  | "check"
  | "chevron-left"
  | "copy"
  | "github"
  | "list"
  | "markdown"
  | "search"
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
  author: {
    name: string;
    url: string;
    icon?: IconName;
  };
  credits?: Array<{
    name: string;
    url: string;
  }>;
};

export type DocsThemeConfig = SiteConfig & {
  site?: string;
  /** Path to a 512x512 PNG or SVG icon. Generates favicons, apple-touch-icon, webmanifest icons. */
  icon?: string;
  /** Show hue slider in header for interactive theme color customization. */
  hueSlider?: boolean;
  /** Enable Astro View Transitions via ClientRouter. Default: true. */
  clientRouter?: boolean;
  shikiThemes?: {
    light: string;
    dark: string;
  };
  /** Enable full-text search. Requires `docs` config. Default: false. */
  search?: boolean;
  docs?: {
    directory: string;
    pattern?: string;
    deepSections?: string[];
  };
};

export type FileEntry = {
  name: string;
  type: "html" | "javascript" | "css" | "importmap";
  lang: "html" | "javascript" | "css";
  content: string;
};
