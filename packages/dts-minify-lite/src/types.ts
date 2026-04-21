export interface Minifier {
  /**
   * Minifies the provided TypeScript declaration file text.
   * @param {string} fileText - The text of the TypeScript declaration file to minify.
   * @param {object} options - Optional settings for the minification process.
   * @param {boolean} options.keepJsDocs - If true, JSDoc comments will be preserved in the minified output. Defaults to `false`.
   * @returns {string} The minified version of the provided TypeScript declaration file text.
   */
  minify(fileText: string, options?: MinifyOptions): string
}

/** Options for minifying. */
export interface MinifyOptions {
  /**
   * Does not remove the JS docs when true.
   * @default false
   */
  keepJsDocs?: boolean
}
