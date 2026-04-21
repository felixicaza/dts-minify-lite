import { readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'

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

function isErrnoException(error: unknown): error is NodeJS.ErrnoException {
  return typeof error === 'object' && error !== null && 'code' in error
}

async function collectFilesRecursively(rootDir: string, currentDir = rootDir): Promise<string[]> {
  const entries = await readdir(currentDir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const absolutePath = resolve(currentDir, entry.name)

    if (entry.isDirectory()) {
      const nested = await collectFilesRecursively(rootDir, absolutePath)
      files.push(...nested)
      continue
    }

    files.push(absolutePath)
  }

  return files
}

function resolveOutputDirectory(outputOptions: unknown) {
  if (!outputOptions || typeof outputOptions !== 'object') {
    return undefined
  }

  const candidate = outputOptions as { dir?: string, file?: string }

  if (typeof candidate.dir === 'string' && candidate.dir.length > 0) {
    return candidate.dir
  }

  if (typeof candidate.file === 'string' && candidate.file.length > 0) {
    return dirname(candidate.file)
  }

  return undefined
}

async function postProcessDeclarationFilesOnDisk(outputDir: string, minifier: Minifier, options?: MinifyOptions) {
  try {
    const files = await collectFilesRecursively(outputDir)

    await Promise.all(files.map(async (absolutePath) => {
      const normalizedPath = absolutePath.replaceAll('\\', '/')
      const fileName = normalizedPath.split('/').at(-1) ?? ''

      if (DECLARATION_MAP_FILE_PATTERN.test(fileName)) {
        await rm(absolutePath, { force: true })
        return
      }

      if (!DECLARATION_FILE_PATTERN.test(fileName)) {
        return
      }

      const originalText = await readFile(absolutePath, 'utf8')
      const minifiedText = minifyDeclarationText(originalText, minifier, options)

      if (minifiedText !== originalText) {
        await writeFile(absolutePath, minifiedText, 'utf8')
      }
    }))
  } catch (error) {
    if (isErrnoException(error) && error.code === 'ENOENT') {
      return
    }

    throw error
  }
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
    },
    writeBundle: {
      order: 'post',
      async handler(outputOptions) {
        const outputDir = resolveOutputDirectory(outputOptions)

        if (!outputDir) {
          return
        }

        await postProcessDeclarationFilesOnDisk(outputDir, minifier, options)
      }
    }
  }
}
