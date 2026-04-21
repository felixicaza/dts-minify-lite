import { defineConfig } from 'tsdown'
import { rolldownPluginDtsMinifyLite } from '../rolldown-plugin-dts-minify-lite/src/index.ts'

export default defineConfig({
  entry: 'src/index.ts',
  target: 'node24',
  minify: true,
  plugins: [rolldownPluginDtsMinifyLite({ keepJsDocs: true })]
})
