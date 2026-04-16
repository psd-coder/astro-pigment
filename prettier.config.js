/** @type {import("prettier").Config} */
export default {
  singleQuote: false,
  trailingComma: "all",
  printWidth: 100,
  plugins: ["prettier-plugin-astro", "@prettier/plugin-oxc"],
};
