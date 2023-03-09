# `mdast-util-wikirefs`

![[A WikiBonsai Project](https://github.com/wikibonsai/wikibonsai)](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)
[![NPM package](https://img.shields.io/npm/v/mdast-util-wikirefs)](https://npmjs.org/package/mdast-util-wikirefs)

Extension for [`mdast-util-from-markdown`](https://github.com/syntax-tree/mdast-util-from-markdown) and
[`mdast-util-to-markdown`](https://github.com/syntax-tree/mdast-util-to-markdown) to support [wikirefs](https://github.com/wikibonsai/wikirefs) (including `[[wikilinks]]`). Converts the token stream produced by [`micromark-extension-wikirefs`](https://github.com/wikibonsai/remark-wikirefs/tree/master/micromark-extension-wikirefs) into an abstract syntax tree.

Note that this plugin only parses the input -- it is up to you to assign appropriate linking information and/or index relationships between files.

Using [`remark`](https://github.com/remarkjs/remark)?  You probably shouldn’t use this package directly, but instead use [`remark-wikirefs`](https://github.com/wikibonsai/remark-wikirefs/tree/master/remark-wikirefs).  See [`wikirefs-spec`](https://github.com/wikibonsai/wikirefs/blob/main/wikirefs/spec) for a full description of the supported syntax.

🕸 Weave a semantic web in your [🎋 WikiBonsai](https://github.com/wikibonsai/wikibonsai) digital garden.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Install [`mdast-util-wikirefs`]() on `npm`.

```
npm install mdast-util-wikirefs
```

## Use

### Markdown to AST

#### WikiRefs (MKDN -> AST)

To use all wiki constructs, use `wikirefs`:

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { syntaxWikiRefs } from 'micromark-extension-wikirefs'
import { fromMarkdownWikiRefs } from 'mdast-util-wikirefs'

let ast = fromMarkdown('[[fname]]', {
  extensions: [syntaxWikiRefs],
  mdastExtensions: [fromMarkdownWikiRefs]
})
```

See specific abstract syntax tree node forms below...

#### WikiAttrs (MKDN -> AST)

The corresponding `wikiattr` node for...

```markdown
':attrtype::[[fname]]\n'
```

...in the abstract syntax tree has the form below, where:

* `data.items` contains the original markdown source parsed into the individual components of the wikiattr.

```json
{
  "type": "attrbox",
  "data": {
    "items": {
      "attrtype": [
        {
          "type": "wiki",
          "doctype": "",
          "filename": "fname",
          "htmlHref": "/fname-url",
          "htmlText": "title",
          "baseUrl": "",
        }
      ],
    },
    "hName": "aside",
    "hProperties": {
      "className": ["attrbox"],
    },
  },
  "children": [{
      "type": "attrbox-title",
      "data": {
        "hName": "span",
        "hProperties": {
          "className": ["attrbox-title"],
        },
      },
      "children": [{
        "type": "text",
        "value": "attrtype",
      }],
    }, {
      "type": "attrbox-list",
      "data": { "hName": "dl" },
      "children": [
        {
          "type": "attr-key",
          "data": { "hName": "dt" },
          "children": [{
            "type": "text",
            "value": "attrtype",
          }],
        }, {
          "type": "attr-val",
          "data": { "hName": "dd" },
          "children": [
            {
              "type": "wikiattr",
              "children": [{
                "type": "text",
                "value": "title",
              }],
              "data": {
                "hName": "a",
                "hProperties": {
                  "className": ["attr", "wiki", "reftype__attrtype"],
                  "dataHref": "/fname-url",
                  "href": "/fname-url",
                },
              }
            },
          ],
        },
      ],
    },
  ],
}
```

To use only the wikiattr construct:

```javascript
import fromMarkdown from 'mdast-util-from-markdown';
import { syntaxWikiAttrs } from 'micromark-extension-wikirefs';
import { fromMarkdownWikiAttrs } from 'mdast-util-wikirefs';

let ast = fromMarkdown(':attrtype::[[fname]]\n', {
  extensions: [syntaxWikiAttrs],
  mdastExtensions: [fromMarkdownWikiAttrs]
});
```

#### WikiLinks (MKDN -> AST)

The corresponding `wikilink` node for...

```markdown
[[fname]]
```

...in the abstract syntax tree has the form below, where:

* `data.item` contains the original markdown source parsed into the individual components of the wikilink. 

```json
{
  "type": "wikilink",
  "children": [{
    "type": "text",
    "value": "title",
  }],
  "data": {
    "item": {
      "filename": "fname",
      "doctype": "",
      "label": "",
      "linktype": "reftype__linktype",
    },
    "hName": "a",
    "hProperties": {
      "className": ["wiki", "link"],
      "dataHref": "/fname-url",
      "href": "/fname-url",
    },
  }
}
```

To use only the wikilink construct:

```javascript
import fromMarkdown from 'mdast-util-from-markdown';
import { syntaxWikiLinks } from 'micromark-extension-wikirefs';
import { fromMarkdownWikiLinks } from 'mdast-util-wikirefs';

let ast = fromMarkdown('[[fname]]', {
  extensions: [syntaxWikiLinks],
  mdastExtensions: [fromMarkdownWikiLinks]
});
```

#### WikiEmbeds (MKDN -> AST)

The corresponding `wikiembed` node for...

```markdown
![[fname]]
![[audio.mp3]]
![[image.png]]
![[video.mp4]]
```

...in the abstract syntax tree has the form below, where:

* `data.item` contains the original markdown source parsed into the individual components of the wikilink.

```json
{
  "type": "wikiembed",
  "data": {
    "item": {
      "doctype": "",
      "filename": "embed-doc",
    },
    "hName": "p",
  },
  "children": [{
    "type": "embed-mkdn-wrapper",
    "data": {
      "hName": "div",
      "hProperties": {
        "className": ["embed-wrapper"]
      }
    },
    "children": [{
      "type": "embed-mkdn-title",
      "data": {
        "hName": "div",
        "hProperties": {
          "className": ["embed-title"]
        }
      },
      "children": [{
        "type": "a",
        "data": {
          "hName": "a",
          "hProperties": {
            "className": ["wiki", "embed"],
            "dataHref": "/tests/fixtures/embed-doc",
            "href": "/tests/fixtures/embed-doc",
          }
        },
        "children": [{
          "type": "text",
          "value": "embedded document",
        }]
      }],
    }, {
      "type": "embed-mkdn-link",
      "data": {
        "hName": "div",
        "hProperties": {
          "className": ["embed-link"]
        }
      },
      "children": [{
        "type": "a",
        "data": {
          "hName": "a",
          "hProperties": {
            "className": ["embed-link-icon"],
            "dataHref": "/tests/fixtures/embed-doc",
            "href": "/tests/fixtures/embed-doc",
          }
        },
        "children": [{
          "type": "i",
          "data": {
            "hName": "i",
            "hProperties": {
              "className": ["link-icon"],
            }
          }
        }],
      }],
    }, {
      "type": "embed-mkdn-content",
      "data": {
        "hName": "div",
        "hProperties": {
          "className": ["embed-content"]
        }
      },
      "children": [{
        "type": "root",
        "position": {
          "start": { "column": 1, "line": 1, "offset": 0 },
          "end": { "column": 22, "line": 1, "offset": 21 },
        },
        "children": [{
          "type": "paragraph",
          "position": {
            "start": { "column": 1, "line": 1, "offset": 0 },
            "end": { "column": 22, "line": 1, "offset": 21 },
          },
          "children": [{
            "type": "text",
            "value": "Here is some content.",
            "position": {
              "start": { "column": 1, "line": 1, "offset": 0 },
              "end": { "column": 22, "line": 1, "offset": 21 },
            },
          }]
        }],
      }],
    },],
  }],
},
{
  "type": "wikiembed",
  "data": {
    "item": {
      "doctype": "",
      "filename": "audio.mp3",
    },
    "hName": "p",
  },
  "children": [{
    "type": "embed-media-span",
    "data": {
      "hName": "span",
      "hProperties": {
        "className": ["embed-media"],
        "src": "audio.mp3",
        "alt": "audio.mp3",
      }
    },
    "children": [{
      "type": "embed-media-audio",
      "data": {
        "hName": "audio",
        "hProperties": {
          "controls": true,
          "className": ["embed-audio"],
          "src": "/tests/fixtures/audio.mp3",
          "type": "audio/mp3",
        }
      }
    }],
  }],
},
{
  "type": "wikiembed",
  "data": {
    "item": {
      "doctype": "",
      "filename": "image.png",
    },
    "hName": "p",
  },
  "children": [{
    "type": "embed-media-span",
    "data": {
      "hName": "span",
      "hProperties": {
        "className": ["embed-media"],
        "src": "image.png",
        "alt": "image.png",
      }
    },
    "children": [{
      "type": "embed-media-image",
      "data": {
        "hName": "img",
        "hProperties": {
          "className": ["embed-image"],
          "src": "/tests/fixtures/image.png",
        }
      }
    }]
  }],
},
{
  "type": "wikiembed",
  "data": {
    "item": {
      "doctype": "",
      "filename": "video.mp4",
    },
    "hName": "p",
  },
  "children": [{
    "type": "embed-media-span",
    "data": {
      "hName": "span",
      "hProperties": {
        "className": ["embed-media"],
        "src": "video.mp4",
        "alt": "video.mp4",
      }
    },
    "children": [{
      "type": "embed-media-video",
      "data": {
        "hName": "video",
        "hProperties": {
          "controls": true,
          "className": ["embed-video"],
          "src": "/tests/fixtures/video.mp4",
          "type": "video/mp4",
        }
      }
    }],
  }],
}
```

To use only the wikiembed construct:

```javascript
import fromMarkdown from 'mdast-util-from-markdown';
import { syntaxWikiEmbeds } from 'micromark-extension-wikirefs';
import { fromMarkdownWikiEmbeds } from 'mdast-util-wikirefs';

let ast = fromMarkdown('[[fname]]', {
  extensions: [syntaxWikiEmbeds],
  mdastExtensions: [fromMarkdownWikiEmbeds]
});
```

### AST to Markdown

Taking the `ast`s from the previous example...

#### WikiRefs (AST -> MKDN)

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { toMarkdownWikiRefs } from 'mdast-util-wikirefs'

let markdownString = toMarkdown(ast, {
  extensions: [toMarkdownWikiRefs]
}).trim();
```

#### WikiAttrs (AST -> MKDN)

...result will be:

```markdown
:attrtype::[[fname]]
```

To use only the wikiattr construct:

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { toMarkdownWikiAttrs } from 'mdast-util-wikirefs'

let markdownString = toMarkdown(ast, {
  extensions: [toMarkdownWikiAttrs]
}).trim();
```

#### WikiLinks (AST -> MKDN)

...result will be:

```markdown
[[fname]]
```

To use only the wikilink construct:

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { toMarkdownWikiLinks } from 'mdast-util-wikirefs'

let markdownString = toMarkdown(ast, {
  extensions: [toMarkdownWikiLinks]
}).trim();
```

#### WikiEmbeds (AST -> MKDN)

...result will be:

```markdown
![[fname]]
![[audio.mp3]]
![[image.png]]
![[video.mp4]]
```

To use only the wikiembed construct:

```javascript
import fromMarkdown from 'mdast-util-from-markdown'
import { toMarkdownWikiEmbeds } from 'mdast-util-wikirefs'

let markdownString = toMarkdown(ast, {
  extensions: [toMarkdownWikiEmbeds]
}).trim();
```

## Options

### `mdast` Options

Works for both `fromMarkdown` and `toMarkdown`:

```js
// defaults
let mdastOpts = {
  attrs: {
    enable: true,
  },
  links: {
    enable: true,
  },
  embeds: {
    enable: true,
  },
};
```

### Options Descriptions

See [`remark-wikirefs` readme](https://github.com/wikibonsai/remark-wikirefs#options-descriptions) for option descriptions.
