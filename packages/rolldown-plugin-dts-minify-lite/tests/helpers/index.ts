import type { OutputBundle, Plugin } from 'rolldown'

import { rolldownPluginDtsMinifyLite } from '../../src/index.ts'

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

export function createChunk(fileName: string, code: string) {
  return {
    type: 'chunk',
    fileName,
    code
  } as OutputBundle[string]
}

export function createAsset(fileName: string, source: string | Uint8Array) {
  return {
    type: 'asset',
    fileName,
    source
  } as OutputBundle[string]
}

export function runPlugin(bundle: OutputBundle, keepJsDocs = false) {
  const plugin = rolldownPluginDtsMinifyLite({ keepJsDocs })
  const handler = getGenerateBundleHandler(plugin)
  handler({}, bundle)
}
