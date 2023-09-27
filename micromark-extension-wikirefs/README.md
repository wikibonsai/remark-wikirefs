# `micromark-extension-wikirefs`

[![A WikiBonsai Project](https://img.shields.io/badge/%F0%9F%8E%8B-A%20WikiBonsai%20Project-brightgreen)](https://github.com/wikibonsai/wikibonsai)
[![NPM package](https://img.shields.io/npm/v/micromark-extension-wikirefs)](https://npmjs.org/package/micromark-extension-wikirefs)

A **[`micromark`](https://github.com/micromark/micromark)** syntax extension for [wikirefs](https://github.com/wikibonsai/wikirefs) (including `[[wikilinks]]`), providing the low-level modules for integrating with the micromark tokenizer and the micromark HTML compiler.

You probably shouldn’t use this package directly, but instead use [`mdast-util-wikirefs`](https://github.com/wikibonsai/remark-wikirefs/tree/master/mdast-util-wikirefs) with [mdast](https://github.com/syntax-tree/mdast) or [`remark-wikirefs`](https://github.com/wikibonsai/remark-wikirefs/tree/master/remark-wikirefs) with [remark](https://github.com/remarkjs/remark).

Note that this plugin only parses the input -- it is up to you to assign appropriate linking information and/or index relationships between files.

🕸 Weave a semantic web in your [🎋 WikiBonsai](https://github.com/wikibonsai/wikibonsai) digital garden.

## Install

This package is [ESM only](https://gist.github.com/sindresorhus/a39789f98801d908bbc7ff3ecc99d99c). Install [`micromark-extension-wikirefs`]() on `npm`.

```
npm install micromark-extension-wikirefs
```

## Use

### WikiRefs

To use all wiki constructs, use `wikirefs`:

```javascript
import micromark from 'micromark';
import { syntaxWikiRefs, htmlWikiRefs } from 'micromark-extension-wikirefs';

// in order to use wikiembeds, a micromark wrapper function will be required
// see WikiEmbeds below for examples
let content = micromark('[[fname]]', {
  extensions: [syntaxWikiRefs()],
  htmlExtensions: [htmlWikiRefs()],
});
```

Specific serialization examples below...

### WikiAttrs

The serialized result will be the following.  To get an abstract syntax tree, use `mdast-util-wikirefs` instead.

```markdown
:attrtype::[[fname]]

```

```html
<aside class="attrbox">
<span class="attrbox-title">Attributes</span>
    <dl>
    <dt>attrtype</dt>
        <dd><a class="attrd wikilink reftype__attrtype doctype__doctype" href="/fname-url" data-href="/fname-url">title</a></dd>
    </dl>
</aside>
```

To only use `wikiattr` constructs:

```javascript
import micromark from 'micromark';
import { syntaxWikiAttrs, htmlWikiAttrs } from 'micromark-extension-wikirefs';

let content = micromark(':attrtype::[[fname]]\n', {
    extensions: [syntaxWikiAttrs()],
    htmlExtensions: [htmlWikiAttrs()]
});
```

### WikiLinks

The serialized result will be the following.  To get an abstract syntax tree, use `mdast-util-wikirefs` instead.

```markdown
[[fname]]
```

```html
<p><a class="wikilink" href="/fname-url" data-href="/fname-url">title</a></p>
```

To only use `wikilink` constructs:

```javascript
import micromark from 'micromark';
import { syntaxWikiLinks, htmlWikiLinks } from 'micromark-extension-wikirefs';

let content = micromark('[[fname]]', {
  extensions: [syntaxWikiLinks()],
  htmlExtensions: [htmlWikiLinks()],
});
```

### WikiEmbeds

The serialized result will be the following.  To get an abstract syntax tree, use `mdast-util-wikirefs` instead.

```markdown
![[fname]]
![[audio.mp3]]
![[image.png]]
![[video.mp4]]
```

```html
<!-- markdown embeds -->
<p>
  <div class="embed-wrapper">
    <div class="embed-title">
      <a class="wiki embed doctype__doctype" href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
        embedded document
      </a>
    </div>
    <div class="embed-link">
      <a href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
        <i class="link-icon"></i>
      </a>
    </div>
    <div class="embed-content">
      <p>Here is some content.</p>
    </div>
  </div>
</p>
<!-- media embeds (audio, img, video) -->
<!-- audio -->
<p>
  <span class="embed-media" src="audio.mp3" alt="audio.mp3">
    <audio class="embed-audio" controls src="/tests/fixtures/audio.mp3"></audio>
  </span>
</p>
<!-- image -->
<p>
  <span class="embed-media" src="image.png" alt="image.png">
    <img class="embed-image" src="/tests/fixtures/image.png">
  </span>
</p>
<!-- video -->
<p>
  <span class="embed-media" src="video.mp4" alt="video.mp4">
    <video class="embed-audio" controls src="/tests/fixtures/video.mp4"></video>
  </span>
</p>
```

To only use `wikiembed` constructs:

```javascript
import micromark from 'micromark';
import { syntaxWikiEmbeds, htmlWikiEmbeds } from 'micromark-extension-wikirefs';

function wrapMicromark(content) {
  const opts = {
    resolveEmbedContent: (filename: string) => {
      // see [test runner](https://github.com/wikibonsai/remark-wikirefs/blob/main/micromark-extension-wikirefs/test/tests/runner.ts) for full example
      return filename + ' embed content';
    }
  };
  return micromark(content, {
      extensions: [syntaxWikiEmbeds()],
      htmlExtensions: [htmlWikiEmbeds(opts)]
  });
}
let content = wrapMicromark('![[fname]]');
```

### Syntax

For more on syntax specification, see the [wikirefs](https://github.com/wikibonsai/wikirefs) repo.

## Options

It is strongly recommended to provide the following options for best linking results:
- `resolveHtmlText`
- `resolveHtmlHref`
- `resolveEmbedContent`

For [`wikiembeds`](#wikiembeds) -- note:
- [`path.extname(filename)`](https://nodejs.org/api/path.html#pathextnamepath) is used to identify the file extension which determines how the embed should be formatted.
- Check for self-references and cycles when defining [`opts.resolveEmbedContent()`](https://github.com/wikibonsai/remark-wikirefs/blob/main/micromark-extension-wikirefs/test/tests/runner.spec.ts).

### Syntax Options

```js
// defaults
let syntaxOpts = {
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

### HTML Options

```js
// defaults
let htmlOpts = {
    resolveHtmlHref: (fname: string) => {
      const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
      fname = fname.replace(extname, '');
      return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
    },
    resolveHtmlText: (fname: string) => fname.replace(/-/g, ' '),
    resolveEmbedContent: (fname: string) => fname + ' embed content',
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
    } as OptCssNames,
    attrs: {
      enable: true,
      render: true,
      title: 'Attributes',
    } as OptAttr,
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

See [`remark-wikirefs` readme](https://github.com/wikibonsai/remark-wikirefs#options-descriptions) for option descriptions.
