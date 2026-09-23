export type Heading = {
  depth: number;
  slug: string;
  text: string;
};

export function getTocHeadings(headings: Heading[]): Heading[] {
  return headings.filter((heading) => heading.depth === 2 || heading.depth === 3);
}
