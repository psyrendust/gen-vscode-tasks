/**
 * Defaults from Prettier.
 * @see https://prettier.io/docs/en/options.html
 */
const prettierDefaults = {
  arrowParens: 'avoid',
  bracketSpacing: true,
  insertPragma: false,
  jsxBracketSameLine: false,
  jsxSingleQuote: false,
  printWidth: 80,
  quoteProps: 'as-needed',
  rangeEnd: Infinity,
  rangeStart: 0,
  requirePragma: false,
  semi: true,
  singleQuote: false,
  tabWidth: 2,
  trailingComma: 'none',
  useTabs: false,
};

/**
 * Custom config.
 */
const config = {
  printWidth: 120,
  singleQuote: true,
  trailingComma: 'es5',
  overrides: [
    {
      files: ['.eslintrc', '.babelrc'],
      options: {
        parser: 'json',
        semi: false,
        tabWidth: 2,
        trailingComma: 'none',
      },
    },
    {
      files: ['.editorconfig'],
      options: {
        parser: 'yaml',
      },
    },
  ],
};

/**
 * Prettier defaults with overrides.
 */
module.exports = {
  ...prettierDefaults,
  ...config,
};
