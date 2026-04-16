// CodeMirror theme using the same --code-* CSS variables as the Shiki adaptive theme.
// Since colors are CSS variables, the theme auto-updates on light/dark switch
// without JS reconfiguration.

import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { EditorView } from "@codemirror/view";
import type { Extension } from "@codemirror/state";

const editorTheme = EditorView.theme({
  "&": {
    backgroundColor: "var(--color-surface-4)",
    color: "var(--code-text)",
    height: "100%",
  },
  ".cm-scroller": {
    fontFamily: "var(--font-mono)",
    fontSize: "13px",
    overflow: "auto",
  },
  ".cm-content": {
    caretColor: "var(--code-text)",
  },
  ".cm-cursor, .cm-dropCursor": {
    borderLeftColor: "var(--code-text)",
  },
  "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection": {
    backgroundColor: "var(--color-accent-focus)",
  },
  ".cm-panels": {
    backgroundColor: "var(--color-surface-3)",
    color: "var(--code-text)",
  },
  ".cm-panels.cm-panels-top": {
    borderBottom: "1px solid var(--color-border)",
  },
  ".cm-panels.cm-panels-bottom": {
    borderTop: "1px solid var(--color-border)",
  },
  ".cm-searchMatch": {
    backgroundColor: "var(--color-accent-focus)",
  },
  ".cm-searchMatch.cm-searchMatch-selected": {
    backgroundColor: "var(--color-accent-focus)",
  },
  ".cm-activeLine": {
    backgroundColor: "color-mix(in oklch, var(--color-surface-4) 90%, var(--code-text))",
  },
  ".cm-selectionMatch": {
    backgroundColor: "var(--color-accent-focus)",
  },
  ".cm-matchingBracket, .cm-nonmatchingBracket": {
    outline: "1px solid var(--code-comment)",
  },
  ".cm-gutters": {
    backgroundColor: "var(--color-surface-3)",
    color: "var(--code-comment)",
    borderRight: "1px solid var(--color-border)",
  },
  ".cm-activeLineGutter": {
    backgroundColor: "color-mix(in oklch, var(--color-surface-3) 90%, var(--code-text))",
  },
  ".cm-foldPlaceholder": {
    backgroundColor: "transparent",
    border: "none",
    color: "var(--code-comment)",
  },
  ".cm-tooltip": {
    backgroundColor: "var(--color-surface-2)",
    border: "1px solid var(--color-border)",
  },
  ".cm-tooltip .cm-tooltip-arrow:before": {
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
  },
  ".cm-tooltip .cm-tooltip-arrow:after": {
    borderTopColor: "var(--color-surface-2)",
    borderBottomColor: "var(--color-surface-2)",
  },
  ".cm-tooltip-autocomplete": {
    "& > ul > li[aria-selected]": {
      backgroundColor: "var(--color-accent-focus)",
    },
  },
});

const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: "var(--code-keyword)" },
  { tag: tags.controlKeyword, color: "var(--code-keyword)" },
  { tag: tags.operatorKeyword, color: "var(--code-keyword)" },
  { tag: tags.definitionKeyword, color: "var(--code-keyword)" },
  { tag: tags.moduleKeyword, color: "var(--code-keyword)" },

  {
    tag: tags.function(tags.variableName),
    color: "var(--code-function)",
    fontStyle: "italic",
  },
  {
    tag: tags.function(tags.propertyName),
    color: "var(--code-function)",
    fontStyle: "italic",
  },

  { tag: tags.string, color: "var(--code-string)" },
  { tag: tags.special(tags.string), color: "var(--code-string)" },
  { tag: tags.regexp, color: "var(--code-escape)" },

  { tag: tags.number, color: "var(--code-constant)" },
  { tag: tags.bool, color: "var(--code-constant)" },
  { tag: tags.literal, color: "var(--code-constant)" },
  { tag: tags.null, color: "var(--code-keyword)" },
  { tag: tags.atom, color: "var(--code-constant)" },

  { tag: tags.typeName, color: "var(--code-type)", fontStyle: "italic" },
  { tag: tags.className, color: "var(--code-type)", fontStyle: "italic" },
  { tag: tags.namespace, color: "var(--code-type)" },

  { tag: tags.tagName, color: "var(--code-function)" },
  { tag: tags.attributeName, color: "var(--code-type)" },
  { tag: tags.attributeValue, color: "var(--code-string)" },

  { tag: tags.self, color: "var(--code-tag)" },

  { tag: tags.definition(tags.variableName), color: "var(--code-text)" },
  { tag: tags.definition(tags.propertyName), color: "var(--code-text)" },
  { tag: tags.variableName, color: "var(--code-text)" },
  { tag: tags.propertyName, color: "var(--code-text)" },

  {
    tag: tags.local(tags.variableName),
    color: "var(--code-parameter)",
    fontStyle: "italic",
  },

  { tag: tags.operator, color: "var(--code-operator)" },
  { tag: tags.separator, color: "var(--code-comment)" },
  { tag: tags.punctuation, color: "var(--code-comment)" },
  { tag: tags.bracket, color: "var(--code-comment)" },
  { tag: tags.angleBracket, color: "var(--code-operator)" },
  { tag: tags.squareBracket, color: "var(--code-comment)" },
  { tag: tags.paren, color: "var(--code-comment)" },
  { tag: tags.brace, color: "var(--code-comment)" },

  { tag: tags.escape, color: "var(--code-escape)" },
  { tag: tags.color, color: "var(--code-constant)" },

  { tag: tags.comment, color: "var(--code-comment)", fontStyle: "italic" },
  { tag: tags.lineComment, color: "var(--code-comment)", fontStyle: "italic" },
  { tag: tags.blockComment, color: "var(--code-comment)", fontStyle: "italic" },
  { tag: tags.docComment, color: "var(--code-comment)", fontStyle: "italic" },

  { tag: tags.meta, color: "var(--code-escape)" },
  { tag: tags.annotation, color: "var(--code-constant)" },
  { tag: tags.modifier, color: "var(--code-keyword)" },

  { tag: tags.invalid, color: "var(--code-tag)" },

  { tag: tags.emphasis, fontStyle: "italic" },
  { tag: tags.strong, fontWeight: "bold" },
  {
    tag: tags.link,
    color: "var(--code-property)",
    textDecoration: "underline",
  },
  { tag: tags.heading, color: "var(--code-tag)", fontWeight: "bold" },
  { tag: tags.strikethrough, textDecoration: "line-through" },
]);

export const adaptiveCodeMirrorTheme: Extension = [editorTheme, syntaxHighlighting(highlightStyle)];
