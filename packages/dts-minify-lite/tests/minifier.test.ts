import { describe, expect, test } from 'vitest'
import { createMinifier } from '../dist/index.mjs'

const minifier = createMinifier()

describe('minifier behavior', () => {
  test('removes regular comments and extra whitespace', () => {
    const input = [
      '/* top */',
      'declare namespace Lib {',
      '  // should be removed',
      '  interface Thing { value: string }',
      '}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toBe('declare namespace Lib{interface Thing{value:string}}')
  })

  test('preserves triple slash directives and their newline', () => {
    const input = '/// <reference types="node" />\r\nexport interface A {}'
    const result = minifier.minify(input)

    expect(result).toBe('/// <reference types="node" />\r\nexport interface A{}')
  })

  test('keeps jsdocs when keepJsDocs is true and normalizes leading spaces', () => {
    const input = [
      '/**',
      '     * hello',
      '   * world',
      ' */',
      'export interface A {}'
    ].join('\n')
    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toBe([
      '/**',
      ' * hello',
      ' * world',
      ' */export interface A{}'
    ].join('\n'))
  })

  test('strips jsdocs by default', () => {
    const input = [
      '/**',
      ' * hello',
      ' */',
      'export interface A {}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toBe('export interface A{}')
  })

  test('preserves spaces between adjacent alphanumeric tokens', () => {
    const input = 'declare interface Box { value: string }'
    const result = minifier.minify(input)

    expect(result).toBe('declare interface Box{value:string}')
  })

  test('inserts newline when ASI is probable between identifiers', () => {
    const input = [
      'interface A {',
      '  first: A',
      'second: B',
      '}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toBe('interface A{first:A\nsecond:B}')
  })

  test('does not insert newline after colon-separated line break', () => {
    const input = [
      'interface A {',
      '  value:',
      'string',
      '}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toBe('interface A{value:string}')
  })
})
