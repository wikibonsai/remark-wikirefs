import assert from 'node:assert/strict';

import { merge } from 'lodash-es';

import { Processor, unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

import remarkGfm from 'remark-gfm';


import type { WikiRefsOptions } from 'micromark-extension-wikirefs';

import * as wikirefs from 'wikirefs';
import type { TestFileData, WikiRefTestCase } from 'wikirefs-spec';
import { fileDataMap } from 'wikirefs-spec';

import { remarkWikiRefs } from '../src';


// setup

let mockOpts: Partial<WikiRefsOptions>;
let i: number = 0;

function runMkdnToHtml(contextMsg: string, tests: WikiRefTestCase[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        const mkdn: string = test.mkdn;
        const expdHtml: string = test.html;
        let cycleStack: string[];
        // setup
        /* eslint-disable indent */
        const processor: Processor = unified().use(remarkParse)
                                              .use(remarkGfm)
                                              .use(remarkWikiRefs, merge({
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


describe('configs', () => {

  beforeEach(() => {
    mockOpts = { resolveDocType: () => 'doctype' };
  });

  describe('doctypes', () => {

    runMkdnToHtml('\'doctype feature\'; \'resolveDocTypeSync\' populates doctype css class', [
      {
        descr: 'wikiattr; unprefixed',
        opts: mockOpts,
        mkdn: 'attrtype::[[fname-a]]\n',
        html:
`<aside class="attrbox">
<span class="attrbox-title">Attributes</span>
<dl>
<dt>attrtype</dt>
<dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a></dd>
</dl>
</aside>
`,
      },
      {
        descr: 'wikiattr; prefixed',
        opts: mockOpts,
        mkdn: ':attrtype::[[fname-a]]\n',
        html: 
`<aside class="attrbox">
<span class="attrbox-title">Attributes</span>
<dl>
<dt>attrtype</dt>
<dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a></dd>
</dl>
</aside>
`,
      },
      {
        descr: 'wikilink; typed',
        opts: mockOpts,
        mkdn: ':linktype::[[fname-a]].',
        html: '<p><a class="wiki link type reftype__linktype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a>.</p>',
      },
      {
        descr: 'wikilink; untyped',
        opts: mockOpts,
        mkdn: '[[fname-a]].',
        html: '<p><a class="wiki link doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a>.</p>',
      },
      {
        descr: 'wikiembed; mkdn',
        opts: mockOpts,
        mkdn: '![[fname-a]].',
        html: '<p><p><div class="embed-wrapper"><div class="embed-title"><a class="wiki embed doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a></div><div class="embed-link"><a class="embed-link-icon" href="/fname-a" data-href="/fname-a"><i class="link-icon"></i></a></div><div class="embed-content">Error: Content not found for \'fname-a\'</div></div></p>.</p>',
      },
      {
        descr: 'wikiembed; no doctype for media; audio',
        opts: mockOpts,
        mkdn: '![[audio.mp3]].',
        html: '<p><p><span class="embed-media" src="audio.mp3" alt="audio.mp3"><audio class="embed-audio" controls type="audio/mp3" src="/audio.mp3"></audio></span></p>.</p>',
      },
      {
        descr: 'wikiembed; no doctype for media; img',
        opts: mockOpts,
        mkdn: '![[img.png]].',
        html: '<p><p><span class="embed-media" src="img.png" alt="img.png"><img class="embed-image" src="/img.png"></span></p>.</p>',
      },
      {
        descr: 'wikiembed; no doctype for media; video',
        opts: mockOpts,
        mkdn: '![[video.mp4]].',
        html: '<p><p><span class="embed-media" src="video.mp4" alt="video.mp4"><video class="embed-video" controls type="video/mp4" src="/video.mp4"></video></span></p>.</p>',
      },
    ] as WikiRefTestCase[]);

  });

});
