import { describe, expect, test } from 'vitest'
import { createMinifier } from '../src/minifier/create-minifier.ts'

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

    expect(result).toMatchSnapshot()
  })

  test('preserves triple slash directives and their newline', () => {
    const input = '/// <reference types="node" />\r\nexport interface A {}'
    const result = minifier.minify(input)

    expect(result).toMatchSnapshot()
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

    expect(result).toMatchSnapshot()
  })

  test('keeps regular block comments when keepJsDocs is true and separates declaration with newline', () => {
    const input = [
      '/* regular block comment */',
      'export interface A {}'
    ].join('\n')
    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })

  test('strips jsdocs by default', () => {
    const input = [
      '/**',
      ' * hello',
      ' */',
      'export interface A {}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toMatchSnapshot()
  })

  test('preserves spaces between adjacent alphanumeric tokens', () => {
    const input = 'declare interface Box { value: string }'
    const result = minifier.minify(input)

    expect(result).toMatchSnapshot()
  })

  test('inserts newline when ASI is probable between identifiers', () => {
    const input = [
      'interface A {',
      '  first: A',
      'second: B',
      '}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toMatchSnapshot()
  })

  test('does not insert newline after colon-separated line break', () => {
    const input = [
      'interface A {',
      '  value:',
      'string',
      '}'
    ].join('\n')
    const result = minifier.minify(input)

    expect(result).toMatchSnapshot()
  })

  test('keeps docs before interface members even in compact input', () => {
    const input = 'interface A{/** member doc */value:string;/* second */next:number;}'
    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })

  test('keeps docs in nested type literals', () => {
    const input = 'type A={nested:{/** inner */value:string;};};'
    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })

  test('keeps docs in nested namespaces', () => {
    const input = [
      'declare namespace A {',
      '  /** ns doc */',
      '  export namespace B {',
      '    /* block doc */',
      '    export interface C {}',
      '  }',
      '}'
    ].join('\n')

    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })

  test('handles mixed ///, /* */, /** */ and CRLF/LF sequences', () => {
    const input = [
      '/// <reference types="node" />\r\n/* block */',
      '/** docs */\r\nexport interface A {}'
    ].join('\n')

    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })

  test('handles already-minified declaration text without clear separators', () => {
    const input = '/** top */export interface A{/** member */value:string}'
    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })

  test('handles consecutive preserved comments before declaration', () => {
    const input = '/** first *//** second */export interface A{}'
    const result = minifier.minify(input, { keepJsDocs: true })

    expect(result).toMatchSnapshot()
  })
})
