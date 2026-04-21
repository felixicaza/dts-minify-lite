import { defineConfig } from 'tsdown'
import { rolldownPluginDtsMinifyLite } from './src/index.ts'

export default defineConfig({
  entry: 'src/index.ts',
  target: 'node24',
  minify: true,
  plugins: [rolldownPluginDtsMinifyLite({ keepJsDocs: true })]
})
