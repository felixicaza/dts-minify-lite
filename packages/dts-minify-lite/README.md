![dts-minify-lite](https://raw.githubusercontent.com/felixicaza/dts-minify-lite/HEAD/.github/assets/dts-minify-lite.jpg)

# 🗜️ dts-minify-lite

[![npm version](https://img.shields.io/npm/v/dts-minify-lite?color=0574ce&logo=npm&logoColor=888888&labelColor=ffffff)](https://npmx.dev/package/dts-minify-lite)
![GitHub actions workflow tests status](https://img.shields.io/github/actions/workflow/status/felixicaza/dts-minify-lite/tests.yml?color=0574ce&logo=rocket&logoColor=888888&label=tests&labelColor=ffffff)
[![license](https://img.shields.io/github/license/felixicaza/dts-minify-lite?color=0574ce&logo=googledocs&logoColor=888888&labelColor=ffffff)](https://github.com/felixicaza/dts-minify-lite/blob/main/LICENSE)

A lightweight and zero dependency minifier for TypeScript declaration files (.d.ts).

### Why?

This library was rewritten to remove the TypeScript dependency found in [`dts-minify`](https://github.com/dsherret/dts-minify). This was done to reduce the disk install size and improve performance, as the TypeScript dependency is very weighty.

## ✨ Features

- 🗜️ Minifies TypeScript declaration files (.d.ts) by removing unnecessary whitespace and comments.
- 🔧 Preserves the functionality of the original declaration files while optimizing their size.
- ⚡ Zero dependencies, making it lightweight and easy to integrate into any project.

## 📦 Installation

You can install [`dts-minify-lite`](https://npmx.dev/package/dts-minify-lite) using npm:

```sh
$ npm install dts-minify-lite
```

<details>
  <summary>Using a different package manager?</summary>
  <br/>

  Using pnpm:
  ```sh
  $ pnpm add dts-minify-lite
  ```

  Using yarn:
  ```sh
  $ yarn add dts-minify-lite
  ```

  Using bun:
  ```sh
  $ bun add dts-minify-lite
  ```
</details>

## ⚡ Usage

[`dts-minify-lite`](https://npmx.dev/package/dts-minify-lite) uses the same API as [`dts-minify`](https://github.com/dsherret/dts-minify), so you can simply replace the import and remove TypeScript from your dependencies.

Example:

```js
import { createMinifier } from "dts-minify-lite";

const minifier = createMinifier();

const input = `/** This is a comment that should be removed
 *
 */
    declare namespace Lib {
      // should be removed
      interface Thing { value: string }
}`;

const output = minifier.minify(input);

console.log(output);

// declare namespace Lib{interface Thing{value:string;}}
```

### ⚙️ Options

The `.minify()` function parameters.

#### `fileText` (string) — required

The text of the declaration file (.d.ts) to be minified.

#### `options` (object) — optional

An object containing configuration options for the minification process.

#### `options.keepJsDocs` (boolean)

Whether to keep JSDoc comments in the output. If set to `true`, all comments will be kept. Default to `false`.

<details>
  <summary>Example</summary>
  <br/>

  ```js
  const output = minifier.minify(input, { keepJsDocs: true });

  // /** This is a comment that should be removed
  //  *
  //  */declare namespace Lib{interface Thing{value:string;}}
  ```
</details>

## 📚 Related Projects

- [`rolldown-plugin-dts-minify-lite`](https://npmx.dev/package/rolldown-plugin-dts-minify-lite): Rolldown plugin for [`dts-minify-lite`](https://npmx.dev/package/dts-minify-lite), a lightweight and zero dependency minifier for TypeScript declaration files (.d.ts).

## 🏆 Credits

This project is highly inspired by the original [`dts-minify`](https://github.com/dsherret/dts-minify). Thanks for the great work on that project.

## 🤝 Contributing

Contributions to this library are welcome! If you have any ideas for improvements or new features, please feel free to open an issue or submit a pull request. I appreciate your help in making [`dts-minify-lite`](https://npmx.dev/package/dts-minify-lite) better for everyone.

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](../../LICENSE) file for details.
