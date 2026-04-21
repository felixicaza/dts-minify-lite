import type { MinifyOptions } from 'dts-minify-lite'
import type { OutputAsset, OutputBundle, OutputChunk, Plugin } from 'rolldown'

import { createMinifier } from 'dts-minify-lite'

type Minifier = ReturnType<typeof createMinifier>
type BundleEntry = OutputAsset | OutputChunk

const DECLARATION_FILE_PATTERN = /\.d\.(?:cts|mts|ts)$/u
const DECLARATION_MAP_FILE_PATTERN = /\.d\.(?:cts|mts|ts)\.map$/u
const SOURCE_MAPPING_URL_PATTERN = /\r?\n\/\/# sourceMappingURL=.*$/u

const utf8Encoder = new TextEncoder()
const utf8Decoder = new TextDecoder()

function minifyDeclarationOutputs(bundle: OutputBundle, minifier: Minifier, options?: MinifyOptions) {
  for (const output of Object.values(bundle)) {
    if (isDeclarationChunk(output)) {
      output.code = minifyDeclarationText(output.code, minifier, options)
      continue
    }

    if (isDeclarationAsset(output)) {
      output.source = minifyDeclarationAssetSource(output.source, minifier, options)
    }
  }
}

function removeDeclarationMapFiles(bundle: OutputBundle) {
  for (const fileName of Object.keys(bundle)) {
    if (DECLARATION_MAP_FILE_PATTERN.test(fileName)) {
      delete bundle[fileName]
    }
  }
}

function isDeclarationFile(fileName: string) {
  return DECLARATION_FILE_PATTERN.test(fileName)
}

function isDeclarationChunk(output: BundleEntry): output is OutputChunk {
  return output.type === 'chunk' && isDeclarationFile(output.fileName)
}

function isDeclarationAsset(output: BundleEntry): output is OutputAsset {
  return output.type === 'asset' && isDeclarationFile(output.fileName)
}

function minifyDeclarationText(code: string, minifier: Minifier, options?: MinifyOptions) {
  return stripSourceMappingUrl(minifier.minify(code, options))
}

function stripSourceMappingUrl(code: string) {
  return code.replace(SOURCE_MAPPING_URL_PATTERN, '')
}

function minifyDeclarationAssetSource(source: OutputAsset['source'], minifier: Minifier, options?: MinifyOptions): OutputAsset['source'] {
  if (typeof source === 'string') {
    return minifyDeclarationText(source, minifier, options)
  }

  const minifiedText = minifyDeclarationText(utf8Decoder.decode(source), minifier, options)
  return utf8Encoder.encode(minifiedText)
}

export function rolldownPluginDtsMinifyLite(options?: MinifyOptions): Plugin {
  const minifier = createMinifier()

  return {
    name: 'rolldown-plugin-dts-minify-lite',
    generateBundle: {
      order: 'post',
      handler(_outputOptions, bundle) {
        minifyDeclarationOutputs(bundle, minifier, options)
        removeDeclarationMapFiles(bundle)
      }
    }
  }
}
