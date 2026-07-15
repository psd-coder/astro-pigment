export type HeadingNode = {
  readonly type: string;
  readonly value?: string;
  readonly children?: readonly HeadingNode[];
};

// Flatten a heading's inline content (text, inline code, links, emphasis) to plain
// text, used as the accessible name / anchor text on its self-link permalink.
export function headingText(node: HeadingNode): string {
  if (node.type === "text") return node.value ?? "";
  return (node.children ?? []).map(headingText).join("");
}
