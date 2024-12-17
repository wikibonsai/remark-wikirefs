# `remark-wikirefs`

[![A WikiBonsai Project](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)](https://github.com/wikibonsai/wikibonsai)
[![NPM package](https://img.shields.io/npm/v/remark-wikirefs)](https://npmjs.org/package/remark-wikirefs)

Plugin for [`remark`](https://github.com/remarkjs/remark) to support [wikirefs](https://github.com/wikibonsai/wikirefs) (including `[[wikilinks]]`).  Relies on [`micromark-extension-wikirefs`](https://github.com/wikibonsai/remark-wikirefs/tree/master/micromark-extension-wikirefs) for tokenization and [`mdast-util-wikirefs`](https://github.com/wikibonsai/remark-wikirefs/tree/master/mdast-util-wikirefs) for converting markdown to/from abstract syntax trees.

Note that this plugin only parses the input -- it is up to you to assign appropriate linking information and/or index relationships between files.

🕸 Weave a semantic web in your [🎋 WikiBonsai](https://github.com/wikibonsai/wikibonsai) digital garden.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Install [`remark-wikirefs`](https://www.npmjs.com/package/remark-wikirefs) on `npm`.

```
npm install remark-wikirefs
```

## Use

```javascript
import unified from 'unified';
import markdown from 'remark-parse';
import { remarkWikiRefs } from 'remark-wikirefs';

let processor = unified()
    .use(markdown)
    .use(remarkWikiRefs, {})
```

#### WikiAttrs

Running the processor on the following markdown:

```markdown
:attrtype::[[fname]]
```

Will produce the following `attrbox-data` node:

```json
{
  "type": "attrbox-data",
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
  }
}
```

Which in turn will generate the following `attrbox` node:

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
                  "className": ["attr", "wiki", "attrtype"],
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
import unified from 'unified';
import markdown from 'remark-parse';
import { remarkWikiAttrs } from 'remark-wikirefs';

let processor = unified()
    .use(markdown)
    .use(remarkWikiAttrs, {})
```

#### WikiLinks

Running the processor on the following markdown:

```markdown
[[fname]]
```

Will produce the following `wikilink` node:

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
      "linktype": "",
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
import unified from 'unified';
import markdown from 'remark-parse';
import { remarkWikiLinks } from 'remark-wikirefs';

let processor = unified()
    .use(markdown)
    .use(remarkWikiLinks, {})
```

#### WikiEmbeds

Running the processor on the following markdown:

```markdown
![[fname]]
```

Will produce the following `wikiembed` node:

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
            "dataHref": "/tests/fixtures/fname",
            "href": "/tests/fixtures/fname",
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
            "dataHref": "/tests/fixtures/fname",
            "href": "/tests/fixtures/fname",
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
}
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
}
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
}
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
import unified from 'unified';
import markdown from 'remark-parse';
import { remarkWikiEmbeds } from 'remark-wikirefs';

let processor = unified()
    .use(markdown)
    .use(remarkWikiEmbeds, {})
```

## Syntax

For syntax specifications, see the [wikirefs-spec](https://github.com/wikibonsai/wikirefs/tree/main/spec) repo.

## Options

```js
// defaults
let remarkOpts = {
    resolveHtmlHref: (fname: string) => {
      const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
      fname = fname.replace(extname, '');
      return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
    },
    resolveHtmlText: (fname: string) => fname.replace(/-/g, ' '),
    // requires mdast version -- resolves to node, not a string
    resolveEmbedContent: (fname: string) => {
      return {
        type: 'text',
        value: fname + ' embed content',
      };
    },
    baseUrl: '',
    cssNames: {
      // wiki
      wiki: 'wiki',
      invalid: 'invalid',
      // kinds
      attr: 'attr',
      link: 'link',
      type: 'type',
      embed: 'embed',
      reftype: 'reftype__',
      doctype: 'doctype__',
      // attr
      attrbox: 'attrbox',
      attrboxTitle: 'attrbox-title',
      // embed
      embedWrapper: 'embed-wrapper',
      embedTitle: 'embed-title',
      embedLink: 'embed-link',
      embedContent: 'embed-content',
      embedLinkIcon: 'embed-link-icon',
      linkIcon: 'link-icon',
      embedMedia: 'embed-media',
      embedAudio: 'embed-audio',
      embedDoc: 'embed-doc',
      embedImage: 'embed-image',
      embedVideo: 'embed-video',
    },
    attrs: {
      enable: true,
      render: true,
      title: 'Attributes',
    },
    links: {
      enable: true,
    },
    embeds: {
      enable: true,
      title: 'Embed Content',
      errorContent: 'Error: Content not found for ',
    },
  };
```

### Options Descriptions

It is strongly recommended to provide the following options for best linking results:
- `resolveHtmlText`
- `resolveHtmlHref`

For [`wikiembeds`](#wikiembeds) -- note:
- [`path.extname(filename)`](https://nodejs.org/api/path.html#pathextnamepath) is used to identify the file extension which determines how the embed should be formatted.
- Check for self-references and cycles when defining [`opts.resolveEmbedContent()`](https://github.com/wikibonsai/remark-wikirefs/blob/main/remark-wikirefs/test/runner.spec.ts).

#### `attrs`

These are options wikiattrs-specific options.

#### `attrs.enable`

A boolean property that toggles parsing and rendering wikiattrs on/off.

#### `attrs.render`

A boolean property that toggles rendering wikiattrs on/off. This is useful in the scenario where wikiattrs are used for metadata and not for display purposes; like a yaml-stand-in.

#### `attrs.title`

A string to be rendered in the wikiattrs' attrbox.

#### `baseUrl`

A base url that is applied to all urls internally.

#### `cssNames`

CSS classnames may be overridden here.

#### `cssNames.attr`

Classname for wikiattrs. Default is `attrd`.

#### `cssNames.link`

Classname for wikilinks. Default is `link`.

#### `cssNames.type`

Classname for typed wikilinks. Default is `typed`.

#### `cssNames.wiki`

Classname for valid wikilinks. Default is `wiki`.

#### `cssNames.invalid`

Classname for invalid wikilinks. Default is `invalid-wikilink`.

#### `cssNames.attrbox`

Classname for the wikiattr attrbox. Default is `attrbox`.

#### `cssNames.attrboxTitle`

Classname for the wikiattr attrbox title. Default is `attrbox-title`.

#### `links`

These are options wikilinks-specific options.

#### `links.enable`

A boolean property that toggles parsing/rendering wikilinks on/off.

#### `resolveDocType: (fname: string) => string | undefined`

A function which takes in the `fname` extracted from a wikilink `[[fname]]`. It should return a string which is the name of the file's document type or `undefined` if no document type exists.

#### `resolveHtmlHref: (fname: string) => string | undefined`

A function which takes in the `fname` extracted from a wikilink `[[fname]]`. It should return the url of the wikilink-ed file or `undefined` if no such file exists. If no such file exists, the wikilink will render as a disabled and marked invalid.

It is recommended to supply this function, but there is a default returns:

```js
// micromark
resolveEmbedContent: (fname: string) => {
  return {
    const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
    fname = fname.replace(extname, '');
    return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
  };
},
```

#### `resolveHtmlText: (fname: string) => string | undefined`

A function which takes in the `fname` extracted from a wikilink `[[fname]]`. It should return a string representing the text to populate the a tag's innertext of the wikilink-ed file -- this is often its title -- or `undefined` if no such file exists. If no such file exists, the filename will be used to populate innertext instead. Be sure to apply any text formatting such as lower-casing here.

It is recommended to supply this function, but there is a default which returns: 

```js
resolveHtmlText: (fname: string) => fname.replace('-', ' '),
```

#### `resolveEmbedContent: (fname: string) => string | undefined`

A function which takes in the `fname` extracted from a wikiembed `![[fname]]`. It should return a string representing the markdown content in the file `fname.md`.

It is recommended to supply this function, but there is a default returns:

```js
// micromark
resolveEmbedContent: (fname) => fname + ' embed content',

// mdast-util
resolveEmbedContent: (fname: string) => {
  return {
    type: 'text',
    value: fname + ' embed content',
  };
},
```

### Other Remark Plugins

- [remark-obsidian](https://github.com/johackim/remark-obsidian)
- [remark-obsidian-link](https://github.com/aegatlin/remark-obsidian-link)
- [remark-wiki-link](https://github.com/landakram/remark-wiki-link)
- [remark-wiki-link-plus](https://github.com/flowershow/remark-wiki-link-plus)
- [remark-wiki-links](https://github.com/c1200/remark-wikilinks)
