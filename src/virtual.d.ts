declare module "virtual:theme-integration-config" {
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

  export const siteConfig: SiteConfig;
  export const githubUrl: string;
  export const docsConfig: {
    directory: string;
    deepSections: string[];
  };
  export const faviconPath: string | null;
  export const manifestIconPath: string | null;
  export const huePicker: boolean;
  export const clientRouter: boolean;
  export const search: boolean;
  export const navLinks: NavItem[];
  export const tocItemsSelector: string;
}
