![rolldown-plugin-dts-minify-lite](https://raw.githubusercontent.com/felixicaza/dts-minify-lite/HEAD/.github/assets/rolldown-plugin-dts-minify-lite.jpg)

# 🔶 rolldown-plugin-dts-minify-lite

[![npm version](https://img.shields.io/npm/v/rolldown-plugin-dts-minify-lite?color=fb6239&logo=npm&logoColor=888888&labelColor=ffffff)](https://npmx.dev/package/rolldown-plugin-dts-minify-lite)
![GitHub actions workflow tests status](https://img.shields.io/github/actions/workflow/status/felixicaza/dts-minify-lite/tests.yml?color=fb6239&logo=rocket&logoColor=888888&label=tests&labelColor=ffffff)
[![license](https://img.shields.io/github/license/felixicaza/dts-minify-lite?color=fb6239&logo=googledocs&logoColor=888888&labelColor=ffffff)](https://github.com/felixicaza/dts-minify-lite/blob/main/LICENSE)

Rolldown plugin for [`dts-minify-lite`](https://npmx.dev/package/dts-minify-lite), a lightweight and zero dependency minifier for TypeScript declaration files (.d.ts).

## ✨ Features

- 🗜️ Minifies TypeScript declaration files (.d.ts) by removing unnecessary whitespace and comments.
- 🔧 Preserves the functionality of the original declaration files while optimizing their size.
- ⚡ Supports both `rolldown` and `tsdown` for seamless integration into your build process.
- 🗂️ Supports file extensions: `.d.ts`, `.d.mts`, `.d.cts`.
- 🗺️ Removes source mapping URLs from declaration files to prevent issues with source maps after minification.
- 🔤 Text encoding and decoding using UTF-8 to ensure proper handling of declaration file content.

## 📦 Installation

You can install [`rolldown-plugin-dts-minify-lite`](https://npmx.dev/package/rolldown-plugin-dts-minify-lite) using npm:

```sh
$ npm install rolldown-plugin-dts-minify-lite
```

<details>
  <summary>Using a different package manager?</summary>
  <br/>

  Using pnpm:
  ```sh
  $ pnpm add rolldown-plugin-dts-minify-lite
  ```

  Using yarn:
  ```sh
  $ yarn add rolldown-plugin-dts-minify-lite
  ```

  Using bun:
  ```sh
  $ bun add rolldown-plugin-dts-minify-lite
  ```
</details>

## ⚡ Usage

Add the plugin to your `rolldown.config.ts`:

```ts
// rolldown.config.ts
import { defineConfig } from 'rolldown';
import { rolldownPluginDtsMinifyLite } from 'rolldown-plugin-dts-minify-lite';

export default defineConfig({
  input: './src/index.ts',
  plugins: [rolldownPluginDtsMinifyLite()],
  output: [{ dir: 'dist', format: 'es' }],
});
```

Add the plugin to your `tsdown.config.ts`:

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown';
import { rolldownPluginDtsMinifyLite } from 'rolldown-plugin-dts-minify-lite';

export default defineConfig({
  entry: 'src/index.ts',
  target: 'node24',
  minify: true,
  plugins: [rolldownPluginDtsMinifyLite()],
});
```

### ⚙️ Options

Configuration options for the plugin.

#### `options` (object) — optional

An object containing configuration options for the minification process.

#### `options.keepJsDocs` (boolean)

Whether to keep JSDoc comments in the output. If set to `true`, all comments will be kept. Default to `false`.

<details>
  <summary>Example</summary>
  <br/>

  ```ts
  import { defineConfig } from 'rolldown';
  import { rolldownPluginDtsMinifyLite } from 'rolldown-plugin-dts-minify-lite';

  export default defineConfig({
    input: './src/index.ts',
    plugins: [rolldownPluginDtsMinifyLite({ keepJsDocs: true })],
    output: [{ dir: 'dist', format: 'es' }],
  });
  ```
</details>

## 📚 Related Projects

- [`dts-minify-lite`](https://npmx.dev/package/dts-minify-lite): A lightweight and zero dependency minifier for TypeScript declaration files (.d.ts).

## 🤝 Contributing

Contributions to this library are welcome! If you have any ideas for improvements or new features, please feel free to open an issue or submit a pull request. I appreciate your help in making [`rolldown-plugin-dts-minify-lite`](https://npmx.dev/package/rolldown-plugin-dts-minify-lite) better for everyone.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
