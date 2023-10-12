import type { TestFileData, WikiRefTestCase } from 'wikirefs-spec';
import type { WikiRefsOptions } from '../../src/util/types';

import assert from 'node:assert/strict';
import * as wikirefs from 'wikirefs';
import { fileDataMap, wikiLinkCases, wikiEmbedCases } from 'wikirefs-spec';
import { micromark } from 'micromark';
import { gfm, gfmHtml } from 'micromark-extension-gfm';
import { syntaxWikiRefs, htmlWikiRefs } from '../../src';
import { makeMockOptsForRenderOnly } from '../config.js';


// setup
let mockOpts: Partial<WikiRefsOptions>;
let i: number = 0;

function run(contextMsg: string, tests: WikiRefTestCase[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        const mkdn: string = test.mkdn;
        const expdHtml: string = test.html;
        let cycleStack: string[] = [];
        // note: wrap micromark context for markdown wikiembeds to work
        function micromarkWrapper(content: string): string {
          return micromark(content, {
            allowDangerousHtml: true,
            extensions: [gfm(), syntaxWikiRefs()],
            htmlExtensions: [gfmHtml(), htmlWikiRefs({
              ...mockOpts,
              resolveEmbedContent: (filename: string): (string | undefined) => {
                // markdown-only
                if (wikirefs.isMedia(filename)) { return; }
                // cycle detection
                if (cycleStack.length === 0) {
                  cycleStack = [];
                } else {
                  if (cycleStack.includes(filename)) {
                    // reset stack before leaving
                    cycleStack = [];
                    return 'cycle detected';
                  }
                }
                cycleStack.push(filename);
                // get content
                const fakeFile: TestFileData | undefined = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
                const content: string | undefined = fakeFile ? fakeFile.content : undefined;
                let renderedContent: string | undefined;
                if (content === undefined) {
                  renderedContent = undefined;
                } else if (content.length === 0) {
                  renderedContent = '';
                } else {
                  renderedContent = micromarkWrapper(content);
                }
                // reset stack before leaving
                cycleStack = [];
                return renderedContent;
              }
            })],
          });
        }
        const actlHtml: string = micromarkWrapper(mkdn);
        assert.strictEqual(
          actlHtml.replace(/\n/g, ''),
          expdHtml.replace(/\n/g, ''),
        );
      });
    }
  });
}

describe('micromark-wikirefs', () => {

  before(() => {
    // prep special cases
    wikiLinkCases.forEach((testcase: WikiRefTestCase) => {
      // for gfm footnote cases...
      // note: these do not match remark
      // - includes =""
      // - 'id' comes before css class in header
      if (testcase.descr.includes('gfm')
      && testcase.descr.includes('footnote')) {
        if (testcase.descr.includes('; typed;')) {
          testcase.html = 
`<p>Here is<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup> <a class="wiki link type reftype__linktype1" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>
<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>A footnote with <a class="wiki link type reftype__linktype2" href="/tests/fixtures/fname-b" data-href="/tests/fixtures/fname-b">title b</a>. <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>
`;
        }
        if (testcase.descr.includes('; untyped;')) {
          testcase.html = 
`<p>Here is<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref="" aria-describedby="footnote-label">1</a></sup> <a class="wiki link" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>
<section data-footnotes="" class="footnotes"><h2 id="footnote-label" class="sr-only">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>A footnote with <a class="wiki link" href="/tests/fixtures/fname-b" data-href="/tests/fixtures/fname-b">title b</a>. <a href="#user-content-fnref-1" data-footnote-backref="" class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>
`;
        }
      }
    });
  });

  beforeEach(() => {
    mockOpts = makeMockOptsForRenderOnly();
  });

  // skip wikiattrs -- requires mdast-util extension
  run('mkdn -> html', wikiLinkCases.filter((testcase) =>
    testcase.descr !== 'wikilink; typed; base -- this is actually a valid wikiattr!')
  );
  run('mkdn -> html', wikiEmbedCases);
  it.skip('html -> mkdn; precision newlines -- see assert modifications');
  // see:
  // https://github.com/micromark/micromark/blob/main/packages/micromark/dev/lib/compile.js#L238
  // https://github.com/micromark/micromark/blob/main/packages/micromark/dev/lib/compile.js#L456

});
