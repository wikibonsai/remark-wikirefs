# `remark-wikirefs`

[![A WikiBonsai Project](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)](https://github.com/wikibonsai/wikibonsai)

Following [convention](https://github.com/micromark/micromark/discussions/56), this repository contains **three separate `npm` packages** related to support [wikirefs](https://github.com/wikibonsai/wikirefs) (including [[wikilinks]]) for the `remark` Markdown parser.

* [`micromark-extension-wikirefs`](https://www.npmjs.com/package/micromark-extension-wikirefs) defines a new [syntax extension](https://github.com/micromark/micromark#syntaxextension) for `micromark`, which is responsible for converting markdown syntax to a token stream.
* [`mdast-util-wikirefs`](https://www.npmjs.com/package/mdast-util-wikirefs) describes how to convert tokens output by `micromark-extension-wikirefs` into either an HTML string or `mdast` syntax tree.
* [`remark-wikirefs`](https://www.npmjs.com/package/remark-wikirefs) encapsulates the above functionality into a `remark` plugin.

For more information, see the individual folders for each package.

🕸 Weave a semantic web in your [🎋 WikiBonsai](https://github.com/wikibonsai/wikibonsai) digital garden.

## Contributing

Pull requests for bugfixes or new features / options are welcome.  Be aware that changes to the syntax extension `micromark-extension-wikirefs` may also have an impact on the other two packages, and you will need to test all three.
