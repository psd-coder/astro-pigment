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
    author: {
      name: string;
      url: string;
      icon?: string;
    };
    credits?: Array<{
      name: string;
      url: string;
    }>;
  };

  export const siteConfig: SiteConfig;
  export const githubUrl: string;
  export const docsConfig: {
    directory: string;
    pattern: string;
    deepSections: string[];
  } | null;
  export const iconPath: string | null;
}
