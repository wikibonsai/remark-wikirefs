import assert from 'node:assert/strict';

import { merge } from 'lodash-es';

import { Plugin, Processor, unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

import remarkGfm from 'remark-gfm';


import type { WikiRefsOptions } from 'micromark-extension-wikirefs';

import * as wikirefs from 'wikirefs';
import type { TestFileData, WikiRefTestCase } from 'wikirefs-spec';
import { fileDataMap } from 'wikirefs-spec';

import { makeMockOptsForRenderOnly } from '../../micromark-extension-wikirefs/test/config';
import {
  remarkWikiAttrs,
  remarkWikiLinks,
  remarkWikiEmbeds,
} from '../src';


// setup

interface APITest extends WikiRefTestCase {
  plugin: Plugin;
}

let mockOpts: Partial<WikiRefsOptions>;
let i: number = 0;

function runMkdnToHtml(contextMsg: string, tests: APITest[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        const plugin: Plugin = test.plugin;
        const mkdn: string = test.mkdn;
        const expdHtml: string = test.html;
        let cycleStack: string[];
        // setup
        /* eslint-disable indent */
        const processor: Processor = unified().use(remarkParse)
                                              .use(remarkGfm)
                                              .use(plugin, merge({
                                                ...mockOpts,
                                                resolveEmbedContent: (filename: string): (string | any | undefined) => {
                                                  // markdown-only
                                                  if (wikirefs.isMedia(filename)) { return; }
                                                  // cycle detection
                                                  if (!cycleStack) {
                                                    cycleStack = [];
                                                  } else {
                                                    if (cycleStack.includes(filename)) {
                                                      // reset stack before leaving
                                                      cycleStack = [];
                                                      return { type: 'text', value: 'cycle detected'};
                                                    }
                                                  }
                                                  // get content
                                                  const fakeFile: TestFileData | undefined = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
                                                  const content: string | undefined = fakeFile ? fakeFile.content : undefined;
                                                  // let mdastContent: string | undefined;
                                                  let mdastContent: any;
                                                  cycleStack.push(filename);
                                                  if (content === undefined) {
                                                    mdastContent = undefined;
                                                  } else if (content.length === 0) {
                                                    mdastContent = '';
                                                  } else {
                                                    mdastContent = processor.parse(content);
                                                  }
                                                  // reset stack before leaving
                                                  cycleStack = [];
                                                  return mdastContent;
                                                },
                                              }, test.opts))
                                              .use(remarkRehype)
                                              .use(rehypeStringify);
        /* eslint-enable indent */
        // go
        const actlHtml: string = String(processor.processSync(mkdn));
        // assert
        assert.strictEqual(
          actlHtml.replace(/\n/g, '').replace(/<div>\s*<\/div>/g, ''),
          expdHtml.replace(/\n/g, ''),
        );
      });
    }
  });
}

describe('wiki construct plugin api', () => {

  beforeEach(() => {
    mockOpts = makeMockOptsForRenderOnly();
  });

  runMkdnToHtml('wikiattrs', [
    {
      descr: 'wikiattr; prefixed',
      plugin: remarkWikiAttrs as unknown as Plugin,
      opts: mockOpts,
      mkdn: ':attrtype::[[fname-a]]\n',
      html:
`<aside class="attrbox">
<span class="attrbox-title">Attributes</span>
<dl>
<dt>attrtype</dt>
<dd><a class="attr wiki reftype__attrtype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a></dd>
</dl>
</aside>
`,
    },
    {
      descr: 'wikilink; typed',
      plugin: remarkWikiAttrs as unknown as Plugin,
      opts: mockOpts,
      mkdn: ':linktype::[[fname-a]].',
      html: '<p>:linktype::[[fname-a]].</p>',
    },
    {
      descr: 'wikilink; untyped',
      plugin: remarkWikiAttrs as unknown as Plugin,
      opts: mockOpts,
      mkdn: '[[fname-a]].',
      html: '<p>[[fname-a]].</p>',
    },
    {
      descr: 'wikiembed; mkdn',
      plugin: remarkWikiAttrs as unknown as Plugin,
      opts: mockOpts,
      mkdn: '![[fname-a]].',
      html: '<p>![[fname-a]].</p>',
    },
  ]);
  runMkdnToHtml('wikilinks', [
    {
      descr: 'wikiattr; prefixed',
      plugin: remarkWikiLinks,
      opts: mockOpts,
      mkdn: ':attrtype::[[fname-a]]\n',
      html: '<p><a class="wiki link type reftype__attrtype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a></p>',
    },
    {
      descr: 'wikilink; typed',
      plugin: remarkWikiLinks,
      opts: mockOpts,
      mkdn: ':linktype::[[fname-a]].',
      html: '<p><a class="wiki link type reftype__linktype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>',
    },
    {
      descr: 'wikilink; untyped',
      plugin: remarkWikiLinks,
      opts: mockOpts,
      mkdn: '[[fname-a]].',
      html: '<p><a class="wiki link" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>',
    },
    {
      descr: 'wikiembed; mkdn',
      plugin: remarkWikiLinks,
      opts: merge(mockOpts, { links: { overrideEmbeds: true } }),
      mkdn: '![[fname-a]].',
      html: '<p><a class="wiki link" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>',
      // todo:
      // html: '<p>!<a class="wiki link" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>',
    },
  ]);
  runMkdnToHtml('wikiembeds', [
    {
      descr: 'wikiattr; prefixed',
      plugin: remarkWikiEmbeds,
      opts: mockOpts,
      mkdn: ':attrtype::[[fname-a]]\n',
      html: '<p>:attrtype::[[fname-a]]</p>',
    },
    {
      descr: 'wikilink; typed',
      plugin: remarkWikiEmbeds,
      opts: mockOpts,
      mkdn: ':linktype::[[fname-a]].',
      html: '<p>:linktype::[[fname-a]].</p>',
    },
    {
      descr: 'wikilink; untyped',
      plugin: remarkWikiEmbeds,
      opts: mockOpts,
      mkdn: '[[fname-a]].',
      html: '<p>[[fname-a]].</p>',
    },
    {
      descr: 'wikiembed; mkdn',
      plugin: remarkWikiEmbeds,
      opts: mockOpts,
      mkdn: '![[fname-a]].',
      html: '<p><p><div class="embed-wrapper"><div class="embed-title"><a class="wiki embed" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a></div><div class="embed-link"><a class="embed-link-icon" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a"><i class="link-icon"></i></a></div><div class="embed-content">Error: Content not found for \'fname-a\'</div></div></p>.</p>',
    },
  ]);
  it.skip('wikiembed; mkdn -- todo: support raw \'!\' passthrough', () => { return; });

});