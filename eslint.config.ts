import type { Linter } from 'eslint'

import { defineConfig, globalIgnores } from 'eslint/config'

import globals from 'globals'
import pluginJs from '@eslint/js'
import pluginPackageJson from 'eslint-plugin-package-json'
import pluginJsonc from 'eslint-plugin-jsonc'
import pluginYml from 'eslint-plugin-yml'
import neostandard, { plugins, resolveIgnoresFromGitignore } from 'neostandard'

/** @type {import('eslint').Linter.Config[]} */
export default defineConfig([
  globalIgnores([...resolveIgnoresFromGitignore(), 'pnpm-lock.yaml']),
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  neostandard({
    noJsx: true,
    ts: true
  }),
  plugins.promise.configs['flat/recommended'],
  plugins['@stylistic'].configs['recommended-flat'],
  pluginJsonc.configs['flat/recommended-with-jsonc'],
  pluginPackageJson.configs.stylistic,
  pluginPackageJson.configs.recommended,
  pluginPackageJson.configs['recommended-publishable'],
  pluginYml.configs['flat/recommended'],
  {
    rules: {
      '@stylistic/brace-style': ['error', '1tbs', { allowSingleLine: true }],
      '@stylistic/arrow-parens': ['error', 'always'],
      '@stylistic/quote-props': ['error', 'as-needed'],
      '@stylistic/comma-dangle': ['error', 'never'],
      '@stylistic/no-multi-spaces': ['error', { ignoreEOLComments: false }],

      'yml/indent': ['error', 3, { indicatorValueIndent: 2 }],
      'yml/quotes': ['error', { prefer: 'double' }]
    }
  }
]) as Linter.Config[]
