import type { OutputBundle } from 'rolldown'

import { describe, expect, test } from 'vitest'
import { createChunk, createAsset, runPlugin } from './helpers/index.ts'

describe('rolldownPluginDtsMinifyLite', () => {
  test('minifies declaration chunks and strips sourceMappingURL comment', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        [
          '/**',
          ' * Keep me only with keepJsDocs',
          ' */',
          'export interface A { value: string }',
          '//# sourceMappingURL=index.d.ts.map'
        ].join('\n')
      )
    }

    runPlugin(bundle)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code.includes('sourceMappingURL')).toBe(false)
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('respects minifier options passed to the plugin', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        [
          '/**',
          ' * API docs',
          ' */',
          'export interface A { value: string }'
        ].join('\n')
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('minifies declaration assets with string source', () => {
    const bundle: OutputBundle = {
      'types.d.mts': createAsset('types.d.mts', 'declare namespace N { interface X { id: number } }')
    }

    runPlugin(bundle)

    const entry = bundle['types.d.mts']

    expect(entry.type).toBe('asset')

    if (entry.type === 'asset') {
      expect(typeof entry.source).toBe('string')
      expect(entry.source).toMatchSnapshot()
    }
  })

  test('minifies declaration assets with Uint8Array source and keeps binary format', () => {
    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const bundle: OutputBundle = {
      'types.d.cts': createAsset(
        'types.d.cts',
        encoder.encode('declare namespace B { interface C {} }\n//# sourceMappingURL=types.d.cts.map')
      )
    }

    runPlugin(bundle)

    const entry = bundle['types.d.cts']

    expect(entry.type).toBe('asset')

    if (entry.type === 'asset') {
      expect(entry.source instanceof Uint8Array).toBe(true)
      expect(decoder.decode(entry.source as Uint8Array)).toMatchSnapshot()
    }
  })

  test('supports CRLF sourceMappingURL removal', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        'export interface A {}\r\n//# sourceMappingURL=index.d.ts.map'
      )
    }

    runPlugin(bundle)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('keeps docs before interface members in compact declaration chunks', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        'export interface A{/** member doc */value:string;/* second */next:number;}'
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('keeps docs in nested type literals for declaration chunks', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        'export type A={nested:{/** inner */value:string;};};'
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('keeps docs in nested namespaces for declaration chunks', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        [
          'declare namespace A {',
          '  /** ns doc */',
          '  export namespace B {',
          '    /* block doc */',
          '    export interface C {}',
          '  }',
          '}'
        ].join('\n')
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('handles mixed directives and CRLF LF sequences in declaration chunks', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        [
          '/// <reference types="node" />\r\n/* block */',
          '/** docs */\r\nexport interface A {}',
          '//# sourceMappingURL=index.d.ts.map'
        ].join('\n')
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code.includes('sourceMappingURL')).toBe(false)
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('handles already minified declaration text without clear separators', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        '/** top */export interface A{/** member */value:string}'
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('handles consecutive preserved comments before declaration', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk(
        'index.d.ts',
        '/** first *//** second */export interface A{}'
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['index.d.ts']

    expect(entry.type).toBe('chunk')

    if (entry.type === 'chunk') {
      expect(entry.code).toMatchSnapshot()
    }
  })

  test('applies keepJsDocs edge behavior to declaration assets with string source', () => {
    const bundle: OutputBundle = {
      'types.d.ts': createAsset(
        'types.d.ts',
        '/** top */export interface A{/** member */value:string}'
      )
    }

    runPlugin(bundle, true)

    const entry = bundle['types.d.ts']

    expect(entry.type).toBe('asset')

    if (entry.type === 'asset') {
      expect(typeof entry.source).toBe('string')
      expect(entry.source).toMatchSnapshot()
    }
  })

  test('removes only declaration map files from bundle', () => {
    const bundle: OutputBundle = {
      'index.d.ts': createChunk('index.d.ts', 'export interface A {}'),
      'index.d.ts.map': createAsset('index.d.ts.map', '{}'),
      'types.d.mts.map': createAsset('types.d.mts.map', '{}'),
      'types.d.cts.map': createAsset('types.d.cts.map', '{}'),
      'main.js.map': createAsset('main.js.map', '{}'),
      'types.ts.map': createAsset('types.ts.map', '{}')
    }

    runPlugin(bundle)

    expect(bundle['index.d.ts']).toBeDefined()
    expect(bundle['index.d.ts.map']).toBeUndefined()
    expect(bundle['types.d.mts.map']).toBeUndefined()
    expect(bundle['types.d.cts.map']).toBeUndefined()
    expect(bundle['main.js.map']).toBeDefined()
    expect(bundle['types.ts.map']).toBeDefined()
  })

  test('does not touch non declaration outputs', () => {
    const jsChunkCode = 'export const value = 1;'
    const cssAssetSource = 'body { color: red; }'

    const bundle: OutputBundle = {
      'index.js': createChunk('index.js', jsChunkCode),
      'style.css': createAsset('style.css', cssAssetSource)
    }

    runPlugin(bundle)

    const jsEntry = bundle['index.js']

    expect(jsEntry.type).toBe('chunk')

    if (jsEntry.type === 'chunk') {
      expect(jsEntry.code).toBe(jsChunkCode)
    }

    const cssEntry = bundle['style.css']

    expect(cssEntry.type).toBe('asset')

    if (cssEntry.type === 'asset') {
      expect(cssEntry.source).toBe(cssAssetSource)
    }
  })
})
