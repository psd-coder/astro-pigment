declare module "virtual:pigment-config" {
  type SiteConfig = {
    github: {
      user?: string;
      organization?: string;
      repository: string;
    };
    project: {
      name: string;
      description: string;
      license: { name: string; url: string };
    };
    author?: {
      name: string;
      url: string;
      icon?: string;
    };
    credits?: Array<{
      name: string;
      url: string;
    }>;
  };

  type NavItem = {
    href: string;
    label: string;
  };

  type ResolvedImage =
    | { mode: "none"; alt: string; url: null }
    | { mode: "file"; filePath: string; alt: string; url: string }
    | {
        mode: "auto" | "template";
        templatePath: string | null;
        logoPath: string | null;
        title: string;
        description: string;
        alt: string;
        url: string;
      };

  export const siteConfig: SiteConfig;
  export const githubUrl: string;
  export const publicSiteUrl: string;
  export const logo: string | null;
  export const huePicker: boolean;
  export const clientRouter: boolean;
  export const search: boolean;
  export const theme: {
    hue: number;
  };
  export const docs: {
    directory: string;
    navLinks: NavItem[];
  };
  export const meta: {
    lang: string;
    titleSuffix: string | false;
    mainPageTitle: string;
    icon: {
      faviconPath: string | null;
      manifestIconPath: string | null;
    };
    og: {
      image: ResolvedImage;
      fontPaths: {
        sansRegular: string;
        sansBold: string;
        mono: string;
      };
    };
    twitter: {
      image: ResolvedImage;
      site: string | null;
      creator: string | null;
    };
  };
}

declare module "virtual:pigment-og-template" {
  type OgTemplateFn = (ctx: unknown) => unknown | Promise<unknown>;
  export const template: OgTemplateFn | null;
}

declare module "virtual:pigment-twitter-template" {
  type OgTemplateFn = (ctx: unknown) => unknown | Promise<unknown>;
  export const template: OgTemplateFn | null;
}

declare module "virtual:pigment-extra-entries" {
  type ExtraEntry = {
    id: string;
    title: string;
    description: string;
    order: number;
    body?: string;
    search?: boolean;
    llms?: boolean;
    llmsFull?: boolean;
  };

  export const extraEntries: ExtraEntry[];
}
