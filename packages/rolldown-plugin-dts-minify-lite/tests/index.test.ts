import type { OutputBundle, Plugin } from 'rolldown'

import { describe, expect, test } from 'vitest'
import { rolldownPluginDtsMinifyLite } from '../src/index'

type GenerateBundleHandler = (outputOptions: unknown, bundle: OutputBundle) => void

function getGenerateBundleHandler(plugin: Plugin): GenerateBundleHandler {
  const generateBundle = plugin.generateBundle

  if (typeof generateBundle === 'function') {
    return generateBundle as GenerateBundleHandler
  }

  if (generateBundle && typeof generateBundle === 'object' && 'handler' in generateBundle && typeof generateBundle.handler === 'function') {
    return generateBundle.handler as GenerateBundleHandler
  }

  throw new Error('generateBundle handler is not available in plugin')
}

function createChunk(fileName: string, code: string) {
  return {
    type: 'chunk',
    fileName,
    code
  } as OutputBundle[string]
}

function createAsset(fileName: string, source: string | Uint8Array) {
  return {
    type: 'asset',
    fileName,
    source
  } as OutputBundle[string]
}

function runPlugin(bundle: OutputBundle, keepJsDocs = false) {
  const plugin = rolldownPluginDtsMinifyLite({ keepJsDocs })
  const handler = getGenerateBundleHandler(plugin)
  handler({}, bundle)
}

describe('rolldownPluginDtsMinifyLite', () => {
  test('exposes plugin metadata and post-order hook', () => {
    const plugin = rolldownPluginDtsMinifyLite()

    expect(plugin.name).toBe('rolldown-plugin-dts-minify-lite')

    const generateBundle = plugin.generateBundle

    if (generateBundle && typeof generateBundle === 'object' && 'order' in generateBundle) {
      expect(generateBundle.order).toBe('post')
    } else {
      throw new Error('Expected object-form generateBundle hook')
    }
  })

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
      expect(entry.code).toBe('export interface A{value:string}')
      expect(entry.code.includes('sourceMappingURL')).toBe(false)
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
      expect(entry.code).toBe([
        '/**',
        ' * API docs',
        ' */export interface A{value:string}'
      ].join('\n'))
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
      expect(entry.source).toBe('declare namespace N{interface X{id:number}}')
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
      expect(decoder.decode(entry.source as Uint8Array)).toBe('declare namespace B{interface C{}}')
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
      expect(entry.code).toBe('export interface A{}')
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

  test('does not touch non-declaration outputs', () => {
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
