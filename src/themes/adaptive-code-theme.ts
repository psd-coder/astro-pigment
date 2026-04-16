// Custom Shiki TextMate theme with CSS variable foregrounds.
// All colors derive from --theme-hue via OKLCH (defined in theme.css).
// Single theme handles both light/dark since CSS variables resolve per data-theme.
// Scope definitions based on Catppuccin's comprehensive mapping.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const adaptiveCodeTheme: any = {
  name: "adaptive-code",
  type: "light",
  colors: {
    "editor.foreground": "var(--code-text)",
    "editor.background": "var(--color-surface-4)",
  },
  tokenColors: [
    // --- Default text ---
    {
      scope: ["text", "source", "variable.other.readwrite", "punctuation.definition.variable"],
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: "variable.object.property",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: ["string.template variable", "string variable"],
      settings: { foreground: "var(--code-text)" },
    },

    // --- Punctuation & comments ---
    { scope: "punctuation", settings: { foreground: "var(--code-comment)" } },
    {
      scope: ["comment", "punctuation.definition.comment"],
      settings: { fontStyle: "italic", foreground: "var(--code-comment)" },
    },

    // --- Strings ---
    {
      scope: ["string", "punctuation.definition.string"],
      settings: { foreground: "var(--code-string)" },
    },

    // --- Escape characters ---
    {
      scope: "constant.character.escape",
      settings: { foreground: "var(--code-escape)" },
    },

    // --- Constants & numbers ---
    {
      scope: [
        "constant.numeric",
        "variable.other.constant",
        "entity.name.constant",
        "constant.language.boolean",
        "constant.language.false",
        "constant.language.true",
        "keyword.other.unit.user-defined",
        "keyword.other.unit.suffix.floating-point",
      ],
      settings: { foreground: "var(--code-constant)" },
    },

    // --- Keywords ---
    {
      scope: [
        "keyword",
        "keyword.operator.word",
        "keyword.operator.new",
        "variable.language.super",
        "support.type.primitive",
        "storage.type",
        "storage.modifier",
        "punctuation.definition.keyword",
      ],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "entity.name.tag.documentation",
      settings: { foreground: "var(--code-keyword)" },
    },
    { scope: "keyword.operator.new", settings: { fontStyle: "bold" } },

    // --- Operators & accessors ---
    {
      scope: [
        "keyword.operator",
        "punctuation.accessor",
        "punctuation.definition.generic",
        "meta.function.closure punctuation.section.parameters",
        "punctuation.definition.tag",
        "punctuation.separator.key-value",
      ],
      settings: { foreground: "var(--code-operator)" },
    },

    // --- Functions ---
    {
      scope: [
        "entity.name.function",
        "meta.function-call.method",
        "support.function",
        "support.function.misc",
        "variable.function",
      ],
      settings: { fontStyle: "italic", foreground: "var(--code-function)" },
    },

    // --- Types & classes ---
    {
      scope: [
        "entity.name.class",
        "entity.other.inherited-class",
        "support.class",
        "meta.function-call.constructor",
        "entity.name.struct",
      ],
      settings: { fontStyle: "italic", foreground: "var(--code-type)" },
    },
    {
      scope: "entity.name.enum",
      settings: { fontStyle: "italic", foreground: "var(--code-type)" },
    },
    {
      scope: ["meta.enum variable.other.readwrite", "variable.other.enummember"],
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "meta.property.object",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: ["meta.type", "meta.type-alias", "support.type", "entity.name.type"],
      settings: { fontStyle: "italic", foreground: "var(--code-type)" },
    },

    // --- Decorators & annotations ---
    {
      scope: [
        "meta.annotation variable.function",
        "meta.annotation variable.annotation.function",
        "meta.annotation punctuation.definition.annotation",
        "meta.decorator",
        "punctuation.decorator",
      ],
      settings: { foreground: "var(--code-constant)" },
    },

    // --- Parameters ---
    {
      scope: ["variable.parameter", "meta.function.parameters"],
      settings: { fontStyle: "italic", foreground: "var(--code-parameter)" },
    },

    // --- Language constants & builtins (tag role) ---
    {
      scope: ["constant.language", "support.function.builtin"],
      settings: { foreground: "var(--code-tag)" },
    },
    {
      scope: "entity.other.attribute-name.documentation",
      settings: { foreground: "var(--code-tag)" },
    },

    // --- Directives ---
    {
      scope: ["keyword.control.directive", "punctuation.definition.directive"],
      settings: { foreground: "var(--code-type)" },
    },

    // --- Type parameters ---
    {
      scope: "punctuation.definition.typeparameters",
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: "entity.name.namespace",
      settings: { foreground: "var(--code-type)" },
    },

    // --- CSS ---
    {
      scope: ["support.type.property-name.css", "support.type.property-name.less"],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: ["variable.language.this", "variable.language.this punctuation.definition.variable"],
      settings: { foreground: "var(--code-tag)" },
    },
    {
      scope: "source.css variable.parameter.url",
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: ["support.type.vendored.property-name"],
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: [
        "source.css meta.property-value variable",
        "source.css meta.property-value variable.other.less",
        "source.css meta.property-value variable.other.less punctuation.definition.variable.less",
        "meta.definition.variable.scss",
      ],
      settings: { foreground: "var(--code-parameter)" },
    },
    {
      scope: [
        "source.css meta.property-list variable",
        "meta.property-list variable.other.less",
        "meta.property-list variable.other.less punctuation.definition.variable.less",
      ],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: "keyword.other.unit.percentage.css",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: "source.css meta.attribute-selector",
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: "punctuation.separator.operator.css",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "source.css entity.other.attribute-name.pseudo-class",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "source.css constant.other.unicode-range",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: [
        "source.css entity.other.attribute-name.class.css",
        "entity.other.attribute-name.parent-selector.css punctuation.definition.entity.css",
      ],
      settings: { foreground: "var(--code-type)" },
    },

    // --- Data formats (JSON, YAML, TOML, INI) ---
    {
      scope: [
        "keyword.other.definition.ini",
        "punctuation.support.type.property-name.json",
        "support.type.property-name.json",
        "punctuation.support.type.property-name.toml",
        "support.type.property-name.toml",
        "entity.name.tag.yaml",
        "punctuation.support.type.property-name.yaml",
        "support.type.property-name.yaml",
      ],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: ["constant.language.json", "constant.language.yaml"],
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: ["entity.name.type.anchor.yaml", "variable.other.alias.yaml"],
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: ["support.type.property-name.table", "entity.name.section.group-title.ini"],
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: "constant.other.time.datetime.offset.toml",
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: ["punctuation.definition.anchor.yaml", "punctuation.definition.alias.yaml"],
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "entity.other.document.begin.yaml",
      settings: { foreground: "var(--code-escape)" },
    },

    // --- Diff ---
    {
      scope: "markup.changed.diff",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: [
        "meta.diff.header.from-file",
        "meta.diff.header.to-file",
        "punctuation.definition.from-file.diff",
        "punctuation.definition.to-file.diff",
      ],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: "markup.inserted.diff",
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: "markup.deleted.diff",
      settings: { foreground: "var(--code-tag)" },
    },

    // --- Environment ---
    {
      scope: ["variable.other.env"],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: ["string.quoted variable.other.env"],
      settings: { foreground: "var(--code-text)" },
    },

    // --- C++ ---
    {
      scope: "storage.modifier.specifier.extern.cpp",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: [
        "entity.name.scope-resolution.template.call.cpp",
        "entity.name.scope-resolution.parameter.cpp",
        "entity.name.scope-resolution.cpp",
        "entity.name.scope-resolution.function.definition.cpp",
      ],
      settings: { foreground: "var(--code-type)" },
    },
    { scope: "storage.type.class.doxygen", settings: { fontStyle: "" } },
    {
      scope: ["storage.modifier.reference.cpp"],
      settings: { foreground: "var(--code-operator)" },
    },

    // --- C# ---
    {
      scope: "meta.interpolation.cs",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: "comment.block.documentation.cs",
      settings: { foreground: "var(--code-text)" },
    },

    // --- GDScript ---
    {
      scope: "support.function.builtin.gdscript",
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: "constant.language.gdscript",
      settings: { foreground: "var(--code-constant)" },
    },

    // --- Go ---
    {
      scope: "comment meta.annotation.go",
      settings: { foreground: "var(--code-parameter)" },
    },
    {
      scope: "comment meta.annotation.parameters.go",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: "constant.language.go",
      settings: { foreground: "var(--code-constant)" },
    },

    // --- GraphQL ---
    { scope: "variable.graphql", settings: { foreground: "var(--code-text)" } },
    {
      scope: "string.unquoted.alias.graphql",
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "constant.character.enum.graphql",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "meta.objectvalues.graphql constant.object.key.graphql string.unquoted.graphql",
      settings: { foreground: "var(--code-escape)" },
    },

    // --- HTML / JSX / TSX ---
    {
      scope: [
        "keyword.other.doctype",
        "meta.tag.sgml.doctype punctuation.definition.tag",
        "meta.tag.metadata.doctype entity.name.tag",
        "meta.tag.metadata.doctype punctuation.definition.tag",
      ],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: ["entity.name.tag"],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: [
        "text.html constant.character.entity",
        "text.html constant.character.entity punctuation",
        "constant.character.entity.xml",
        "constant.character.entity.xml punctuation",
        "constant.character.entity.js.jsx",
        "constant.charactger.entity.js.jsx punctuation",
        "constant.character.entity.tsx",
        "constant.character.entity.tsx punctuation",
      ],
      settings: { foreground: "var(--code-tag)" },
    },
    {
      scope: ["entity.other.attribute-name"],
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: [
        "support.class.component",
        "support.class.component.jsx",
        "support.class.component.tsx",
        "support.class.component.vue",
      ],
      settings: { foreground: "var(--code-escape)" },
    },

    // --- Java ---
    {
      scope: ["punctuation.definition.annotation", "storage.type.annotation"],
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: "constant.other.enum.java",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "storage.modifier.import.java",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: "comment.block.javadoc.java keyword.other.documentation.javadoc.java",
      settings: { fontStyle: "" },
    },

    // --- JavaScript / TypeScript ---
    {
      scope: "meta.export variable.other.readwrite.js",
      settings: { foreground: "var(--code-parameter)" },
    },
    {
      scope: [
        "variable.other.constant.js",
        "variable.other.constant.ts",
        "variable.other.property.js",
        "variable.other.property.ts",
      ],
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: ["variable.other.jsdoc", "comment.block.documentation variable.other"],
      settings: { foreground: "var(--code-parameter)" },
    },
    { scope: "storage.type.class.jsdoc", settings: { fontStyle: "" } },
    {
      scope: "support.type.object.console.js",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: ["support.constant.node", "support.type.object.module.js"],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "storage.modifier.implements",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: [
        "constant.language.null.js",
        "constant.language.null.ts",
        "constant.language.undefined.js",
        "constant.language.undefined.ts",
        "support.type.builtin.ts",
      ],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "variable.parameter.generic",
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: ["keyword.declaration.function.arrow.js", "storage.type.function.arrow.ts"],
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "punctuation.decorator.ts",
      settings: { fontStyle: "italic", foreground: "var(--code-function)" },
    },
    {
      scope: [
        "keyword.operator.expression.in.js",
        "keyword.operator.expression.in.ts",
        "keyword.operator.expression.infer.ts",
        "keyword.operator.expression.instanceof.js",
        "keyword.operator.expression.instanceof.ts",
        "keyword.operator.expression.is",
        "keyword.operator.expression.keyof.ts",
        "keyword.operator.expression.of.js",
        "keyword.operator.expression.of.ts",
        "keyword.operator.expression.typeof.ts",
      ],
      settings: { foreground: "var(--code-keyword)" },
    },

    // --- Julia ---
    {
      scope: "support.function.macro.julia",
      settings: { fontStyle: "italic", foreground: "var(--code-operator)" },
    },
    {
      scope: "constant.language.julia",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: "constant.other.symbol.julia",
      settings: { foreground: "var(--code-parameter)" },
    },

    // --- LaTeX ---
    {
      scope: "text.tex keyword.control.preamble",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "text.tex support.function.be",
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: "constant.other.general.math.tex",
      settings: { foreground: "var(--code-escape)" },
    },

    // --- Liquid ---
    {
      scope: "variable.language.liquid",
      settings: { foreground: "var(--code-escape)" },
    },

    // --- Lua ---
    {
      scope: "comment.line.double-dash.documentation.lua storage.type.annotation.lua",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: [
        "comment.line.double-dash.documentation.lua entity.name.variable.lua",
        "comment.line.double-dash.documentation.lua variable.lua",
      ],
      settings: { foreground: "var(--code-text)" },
    },

    // --- Markdown headings ---
    {
      scope: [
        "heading.1.markdown punctuation.definition.heading.markdown",
        "heading.1.markdown",
        "heading.1.quarto punctuation.definition.heading.quarto",
        "heading.1.quarto",
        "markup.heading.atx.1.mdx",
        "markup.heading.atx.1.mdx punctuation.definition.heading.mdx",
        "markup.heading.setext.1.markdown",
        "markup.heading.heading-0.asciidoc",
      ],
      settings: { foreground: "var(--code-tag)" },
    },
    {
      scope: [
        "heading.2.markdown punctuation.definition.heading.markdown",
        "heading.2.markdown",
        "heading.2.quarto punctuation.definition.heading.quarto",
        "heading.2.quarto",
        "markup.heading.atx.2.mdx",
        "markup.heading.atx.2.mdx punctuation.definition.heading.mdx",
        "markup.heading.setext.2.markdown",
        "markup.heading.heading-1.asciidoc",
      ],
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: [
        "heading.3.markdown punctuation.definition.heading.markdown",
        "heading.3.markdown",
        "heading.3.quarto punctuation.definition.heading.quarto",
        "heading.3.quarto",
        "markup.heading.atx.3.mdx",
        "markup.heading.atx.3.mdx punctuation.definition.heading.mdx",
        "markup.heading.heading-2.asciidoc",
      ],
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: [
        "heading.4.markdown punctuation.definition.heading.markdown",
        "heading.4.markdown",
        "heading.4.quarto punctuation.definition.heading.quarto",
        "heading.4.quarto",
        "markup.heading.atx.4.mdx",
        "markup.heading.atx.4.mdx punctuation.definition.heading.mdx",
        "markup.heading.heading-3.asciidoc",
      ],
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: [
        "heading.5.markdown punctuation.definition.heading.markdown",
        "heading.5.markdown",
        "heading.5.quarto punctuation.definition.heading.quarto",
        "heading.5.quarto",
        "markup.heading.atx.5.mdx",
        "markup.heading.atx.5.mdx punctuation.definition.heading.mdx",
        "markup.heading.heading-4.asciidoc",
      ],
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: [
        "heading.6.markdown punctuation.definition.heading.markdown",
        "heading.6.markdown",
        "heading.6.quarto punctuation.definition.heading.quarto",
        "heading.6.quarto",
        "markup.heading.atx.6.mdx",
        "markup.heading.atx.6.mdx punctuation.definition.heading.mdx",
        "markup.heading.heading-5.asciidoc",
      ],
      settings: { foreground: "var(--code-property)" },
    },

    // --- Markdown formatting ---
    {
      scope: "markup.bold",
      settings: { fontStyle: "bold", foreground: "var(--code-tag)" },
    },
    {
      scope: "markup.italic",
      settings: { fontStyle: "italic", foreground: "var(--code-tag)" },
    },
    {
      scope: "markup.strikethrough",
      settings: {
        fontStyle: "strikethrough",
        foreground: "var(--code-comment)",
      },
    },
    {
      scope: ["punctuation.definition.link", "markup.underline.link"],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: [
        "text.html.markdown punctuation.definition.link.title",
        "text.html.quarto punctuation.definition.link.title",
        "string.other.link.title.markdown",
        "string.other.link.title.quarto",
        "markup.link",
        "punctuation.definition.constant.markdown",
        "punctuation.definition.constant.quarto",
        "constant.other.reference.link.markdown",
        "constant.other.reference.link.quarto",
        "markup.substitution.attribute-reference",
      ],
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: [
        "punctuation.definition.raw.markdown",
        "punctuation.definition.raw.quarto",
        "markup.inline.raw.string.markdown",
        "markup.inline.raw.string.quarto",
        "markup.raw.block.markdown",
        "markup.raw.block.quarto",
      ],
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: "fenced_code.block.language",
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: ["markup.fenced_code.block punctuation.definition", "markup.raw support.asciidoc"],
      settings: { foreground: "var(--code-comment)" },
    },
    {
      scope: ["markup.quote", "punctuation.definition.quote.begin"],
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "meta.separator.markdown",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: [
        "punctuation.definition.list.begin.markdown",
        "punctuation.definition.list.begin.quarto",
        "markup.list.bullet",
      ],
      settings: { foreground: "var(--code-operator)" },
    },
    { scope: "markup.heading.quarto", settings: { fontStyle: "bold" } },

    // --- Nix ---
    {
      scope: [
        "entity.other.attribute-name.multipart.nix",
        "entity.other.attribute-name.single.nix",
      ],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: "variable.parameter.name.nix",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: "meta.embedded variable.parameter.name.nix",
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: "string.unquoted.path.nix",
      settings: { foreground: "var(--code-escape)" },
    },

    // --- PHP ---
    {
      scope: ["support.attribute.builtin", "meta.attribute.php"],
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: "meta.function.parameters.php punctuation.definition.variable.php",
      settings: { foreground: "var(--code-parameter)" },
    },
    {
      scope: "constant.language.php",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "text.html.php support.function",
      settings: { foreground: "var(--code-property)" },
    },
    { scope: "keyword.other.phpdoc.php", settings: { fontStyle: "" } },

    // --- Python ---
    {
      scope: ["support.variable.magic.python", "meta.function-call.arguments.python"],
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: ["support.function.magic.python"],
      settings: { fontStyle: "italic", foreground: "var(--code-property)" },
    },
    {
      scope: [
        "variable.parameter.function.language.special.self.python",
        "variable.language.special.self.python",
      ],
      settings: { fontStyle: "italic", foreground: "var(--code-tag)" },
    },
    {
      scope: ["keyword.control.flow.python", "keyword.operator.logical.python"],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "storage.type.function.python",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: ["support.token.decorator.python", "meta.function.decorator.identifier.python"],
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: ["meta.function-call.python"],
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: ["entity.name.function.decorator.python", "punctuation.definition.decorator.python"],
      settings: { fontStyle: "italic", foreground: "var(--code-constant)" },
    },
    {
      scope: "constant.character.format.placeholder.other.python",
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: ["support.type.exception.python", "support.function.builtin.python"],
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: ["support.type.python"],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "constant.language.python",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: ["meta.indexed-name.python", "meta.item-access.python"],
      settings: { fontStyle: "italic", foreground: "var(--code-parameter)" },
    },
    {
      scope: "storage.type.string.python",
      settings: { fontStyle: "italic", foreground: "var(--code-string)" },
    },
    { scope: "meta.function.parameters.python", settings: { fontStyle: "" } },

    // --- R ---
    {
      scope: "meta.function-call.r",
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: "meta.function-call.arguments.r",
      settings: { foreground: "var(--code-text)" },
    },

    // --- Regexp ---
    {
      scope: [
        "string.regexp punctuation.definition.string.begin",
        "string.regexp punctuation.definition.string.end",
      ],
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "keyword.control.anchor.regexp",
      settings: { foreground: "var(--code-keyword)" },
    },
    { scope: "string.regexp.ts", settings: { foreground: "var(--code-text)" } },
    {
      scope: ["punctuation.definition.group.regexp", "keyword.other.back-reference.regexp"],
      settings: { foreground: "var(--code-string)" },
    },
    {
      scope: "punctuation.definition.character-class.regexp",
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: "constant.other.character-class.regexp",
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "constant.other.character-class.range.regexp",
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "keyword.operator.quantifier.regexp",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "constant.character.numeric.regexp",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: [
        "punctuation.definition.group.no-capture.regexp",
        "meta.assertion.look-ahead.regexp",
        "meta.assertion.negative-look-ahead.regexp",
      ],
      settings: { foreground: "var(--code-function)" },
    },

    // --- Rust ---
    {
      scope: [
        "meta.annotation.rust",
        "meta.annotation.rust punctuation",
        "meta.attribute.rust",
        "punctuation.definition.attribute.rust",
      ],
      settings: { fontStyle: "italic", foreground: "var(--code-type)" },
    },
    {
      scope: [
        "meta.attribute.rust string.quoted.double.rust",
        "meta.attribute.rust string.quoted.single.char.rust",
      ],
      settings: { fontStyle: "" },
    },
    {
      scope: [
        "entity.name.function.macro.rules.rust",
        "storage.type.module.rust",
        "storage.modifier.rust",
        "storage.type.struct.rust",
        "storage.type.enum.rust",
        "storage.type.trait.rust",
        "storage.type.union.rust",
        "storage.type.impl.rust",
        "storage.type.rust",
        "storage.type.function.rust",
        "storage.type.type.rust",
      ],
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "entity.name.type.numeric.rust",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "meta.generic.rust",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: "entity.name.impl.rust",
      settings: { fontStyle: "italic", foreground: "var(--code-type)" },
    },
    {
      scope: "entity.name.module.rust",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: "entity.name.trait.rust",
      settings: { fontStyle: "italic", foreground: "var(--code-type)" },
    },
    {
      scope: "storage.type.source.rust",
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: "entity.name.union.rust",
      settings: { foreground: "var(--code-type)" },
    },
    {
      scope: "meta.enum.rust storage.type.source.rust",
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: [
        "support.macro.rust",
        "meta.macro.rust support.function.rust",
        "entity.name.function.macro.rust",
      ],
      settings: { fontStyle: "italic", foreground: "var(--code-function)" },
    },
    {
      scope: ["storage.modifier.lifetime.rust", "entity.name.type.lifetime"],
      settings: { fontStyle: "italic", foreground: "var(--code-function)" },
    },
    {
      scope: "string.quoted.double.rust constant.other.placeholder.rust",
      settings: { foreground: "var(--code-escape)" },
    },
    {
      scope: "meta.function.return-type.rust meta.generic.rust storage.type.rust",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: "meta.function.call.rust",
      settings: { foreground: "var(--code-function)" },
    },
    {
      scope: "punctuation.brackets.angle.rust",
      settings: { foreground: "var(--code-property)" },
    },
    {
      scope: "constant.other.caps.rust",
      settings: { foreground: "var(--code-constant)" },
    },
    {
      scope: ["meta.function.definition.rust variable.other.rust"],
      settings: { foreground: "var(--code-parameter)" },
    },
    {
      scope: "meta.function.call.rust variable.other.rust",
      settings: { foreground: "var(--code-text)" },
    },
    {
      scope: "variable.language.self.rust",
      settings: { foreground: "var(--code-tag)" },
    },
    {
      scope: [
        "variable.other.metavariable.name.rust",
        "meta.macro.metavariable.rust keyword.operator.macro.dollar.rust",
      ],
      settings: { foreground: "var(--code-escape)" },
    },

    // --- Shell ---
    {
      scope: [
        "comment.line.shebang",
        "comment.line.shebang punctuation.definition.comment",
        "punctuation.definition.comment.shebang.shell",
        "meta.shebang.shell",
      ],
      settings: { fontStyle: "italic", foreground: "var(--code-escape)" },
    },
    {
      scope: "comment.line.shebang constant.language",
      settings: { fontStyle: "italic", foreground: "var(--code-operator)" },
    },
    {
      scope: [
        "meta.function-call.arguments.shell punctuation.definition.variable.shell",
        "meta.function-call.arguments.shell punctuation.section.interpolation",
      ],
      settings: { foreground: "var(--code-tag)" },
    },
    {
      scope: "meta.string meta.interpolation.parameter.shell variable.other.readwrite",
      settings: { fontStyle: "italic", foreground: "var(--code-constant)" },
    },
    {
      scope: [
        "source.shell punctuation.section.interpolation",
        "punctuation.definition.evaluation.backticks.shell",
      ],
      settings: { foreground: "var(--code-operator)" },
    },
    {
      scope: "entity.name.tag.heredoc.shell",
      settings: { foreground: "var(--code-keyword)" },
    },
    {
      scope: "string.quoted.double.shell variable.other.normal.shell",
      settings: { foreground: "var(--code-text)" },
    },

    // --- Typst ---
    {
      scope: ["markup.heading.typst"],
      settings: { foreground: "var(--code-tag)" },
    },
  ],
};
