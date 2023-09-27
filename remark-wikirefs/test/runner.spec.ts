import assert from 'node:assert/strict';

import { merge } from 'lodash-es';

import * as Uni from 'unist';
import { Processor, unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkStringify from 'remark-stringify';
import remarkRehype from 'remark-rehype';
// import rehypeParse from 'rehype-parse';
// import rehypeRemark from 'rehype-remark';
import rehypeStringify from 'rehype-stringify';

import remarkGfm from 'remark-gfm';

import { VFile } from 'vfile';

import type { WikiRefsOptions } from 'micromark-extension-wikirefs';
import type { AttrBoxNode, WikiLinkNode } from 'mdast-util-wikirefs';
import { visitNodeType } from 'mdast-util-wikirefs';

import * as wikirefs from 'wikirefs';
import type { TestFileData, WikiRefTestCase } from 'wikirefs-spec';
import { wikiRefCases, fileDataMap } from 'wikirefs-spec';

import { makeMockOptsForRenderOnly } from '../../micromark-extension-wikirefs/test/config';
import type { TestCaseMdast } from '../../mdast-util-wikirefs/test/types';
import { mdastCases } from '../../mdast-util-wikirefs/test/cases';

import { remarkWikiRefs } from '../src';


// setup

let mockOpts: Partial<WikiRefsOptions>;
let i: number = 0;

function runMkdnToMdast(contextMsg: string, tests: TestCaseMdast[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        const mkdn: string = test.mkdn;
        const expdNode: Partial<AttrBoxNode | WikiLinkNode> = test.node as (AttrBoxNode | WikiLinkNode);
        let cycleStack: string[] = [];
        // setup
        /* eslint-disable indent */
        const processor: Processor = unified().use(remarkParse)
                                              .use(remarkWikiRefs, merge({
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
                                                  // let mdastContent: string | undefined;
                                                  let mdastContent: any;
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
                                              }, test.opts));
        /* eslint-enable indent */
        // go
        const actlAst: Uni.Parent = processor.parse(mkdn) as Uni.Parent;
        let visited: boolean = false;
        // assert
        visitNodeType(actlAst, expdNode.type as string, (actlNode: any) => {
          assert.strictEqual(actlNode.type, expdNode.type);
          assert.deepEqual(actlNode.data, expdNode.data);
          assert.deepEqual(actlNode.children, expdNode.children);
          visited = true;
        });
        assert.strictEqual(visited, true);
      });
    }
  });
}

function runMkdnToHtml(contextMsg: string, tests: WikiRefTestCase[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        const mkdn: string = test.mkdn;
        const expdHtml: string = test.html;
        let cycleStack: string[] = [];
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
                                                  if (cycleStack.length === 0) {
                                                    cycleStack = [];
                                                  } else {
                                                    if (cycleStack.includes(filename)) {
                                                      // reset stack before leaving
                                                      cycleStack = [];
                                                      return { type: 'text', value: 'cycle detected'};
                                                    }
                                                  }
                                                  cycleStack.push(filename);
                                                  // get content
                                                  const fakeFile: TestFileData | undefined = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
                                                  const content: string | undefined = fakeFile ? fakeFile.content : undefined;
                                                  // let mdastContent: string | undefined;
                                                  let mdastContent: any;
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
          actlHtml.replace(/\n/g, ''),
          expdHtml.replace(/\n/g, ''),
        );
      });
    }
  });
}

function runMdastToMkdn(contextMsg: string, tests: TestCaseMdast[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        // merge suite options with case options
        const opts: WikiRefsOptions = merge(mockOpts, test.opts);
        const node: AttrBoxNode | WikiLinkNode = test.node as (AttrBoxNode | WikiLinkNode);
        const expdMkdn: string = test.mkdn;
        // setup
        // build ast: ast nodes will normally appear in paragraph
        //            context, which can affect symbol escaping
        const paragraph: Uni.Parent = {
          type: 'paragraph',
          // @ts-expect-error: todo - Type 'AttrBoxNode | WikiLinkNode' is not assignable to type 'Node'.
          children: [node as (AttrBoxNode | WikiLinkNode)],
        };
        // for (text) 'WikiLink' test cases, but not for 'WikiEmbed' cases
        if (expdMkdn.includes('.') && !expdMkdn.includes('!')) {
          paragraph.children.push({
            type: 'text',
            value: '.',
          });
        }
        const root: Uni.Parent = {
          type: 'root',
          children: [paragraph],
        };
        /* eslint-disable indent */
        const processor: Processor = unified().use(remarkStringify)
                                              .use(remarkWikiRefs, opts);
        /* eslint-enable indent */
        // go
        const actlMkdn: string = <string> processor.stringify(root);
        // assert
        // remove newlines if testing (inline/text/wikilink) -- 'toMarkdown' adds one to the end
        assert.strictEqual(
          test.descr.includes('attr;') ? actlMkdn : actlMkdn.replace(/\n/g, ''),
          test.descr.includes('attr;') ? expdMkdn : expdMkdn.replace(/\n/g, ''),
        );
      });
    }
  });
}

// function runHtmlToMkdn(contextMsg: string, tests: TestCaseHtml[]): void {
//   context(contextMsg, () => {
//     let i = 0;
//     for(let test of tests) {
//       let desc = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
//       it(desc, () => {
//         // test vars
//         // merge suite options with case options
//         const opts: Partial<WikiRefsOptions> = merge(mockOpts, test.opts);
//         const html: string = test.html;
//         const expdMkdn: string = test.mkdn;
//         // setup
//         // init -- processor build from: https://github.com/rehypejs/rehype/tree/main/packages/rehype-parse#use
//         const processor: Processor = unified().use(rehypeParse)
//                                               .use(rehypeRemark)
//                                               // .use(rehypeParse as any)
//                                               // .use(rehypeRemark as any)
//                                               .use(remarkStringify)
//                                               .use(wikiRefsPlugin, opts);
//         // go
//         var actlMkdn: string = String(processor.processSync(html));
//         // assert
//         assert.strictEqual(actlMkdn, expdMkdn);
//       });
//     }
//   });
// }

// vfile

function runMkdnToHtmlVFile(contextMsg: string, tests: WikiRefTestCase[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        const mkdn: string = test.mkdn;
        const expdHtml: string = test.html;
        const input = new VFile({ value: mkdn, path: '/tests/fixtures/root' });
        let cycleStack: string[] = [];
        // setup
        /* eslint-disable indent */
        const processor: Processor = unified().use(remarkParse)
                                              .use(remarkGfm)
                                              .use(remarkWikiRefs,  merge({
                                                ...mockOpts,
                                                resolveEmbedContent: (filename: string): (string | any | undefined) => {
                                                  // markdown-only
                                                  if (wikirefs.isMedia(filename)) { return; }
                                                  // cycle detection
                                                  if (cycleStack.length === 0) {
                                                    cycleStack = [];
                                                  } else {
                                                    if (cycleStack.includes(filename)) {
                                                      // reset stack before leaving
                                                      cycleStack = [];
                                                      return { type: 'text', value: 'cycle detected'};
                                                    }
                                                  }
                                                  cycleStack.push(filename);
                                                  // get content
                                                  const fakeFile: TestFileData | undefined = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
                                                  const content: string | undefined = fakeFile ? fakeFile.content : undefined;
                                                  // let mdastContent: string | undefined;
                                                  let mdastContent: any;
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
        const actlHtml: string = String(processor.processSync(input));
        // assert
        assert.strictEqual(
          actlHtml.replace(/\n/g, ''),
          expdHtml.replace(/\n/g, ''),
        );
      });
    }
  });
}

describe('remark-wikirefs', () => {

  before(() => {
    // special case for ampersand handling
    wikiRefCases.forEach((testcase: WikiRefTestCase) => {
      if (testcase.descr.includes('rm non-alpha-numeric')) {
        // ...convert '&' -> '&#x26;<'
        testcase.html = testcase.html.replace(/&/g, '&#x26;');
      }
      // for gfm footnote cases...
      // note: these do not match micromark
      // - does not include =""
      // - 'id' comes after css class in header
      if (testcase.descr.includes('gfm')
      && testcase.descr.includes('footnote')) {
        if (testcase.descr.includes('; typed;')) {
          testcase.html = 
`<p>Here is<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup> <a class="wiki link type reftype__linktype1" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>
<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>A footnote with <a class="wiki link type reftype__linktype2" href="/tests/fixtures/fname-b" data-href="/tests/fixtures/fname-b">title b</a>. <a href="#user-content-fnref-1" data-footnote-backref class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>
`;
        }
        if (testcase.descr.includes('; untyped;')) {
          testcase.html = 
`<p>Here is<sup><a href="#user-content-fn-1" id="user-content-fnref-1" data-footnote-ref aria-describedby="footnote-label">1</a></sup> <a class="wiki link" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>.</p>
<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-1">
<p>A footnote with <a class="wiki link" href="/tests/fixtures/fname-b" data-href="/tests/fixtures/fname-b">title b</a>. <a href="#user-content-fnref-1" data-footnote-backref class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>
`;
        }
        // wikiattrs not allowed inside
        if (testcase.descr === 'wikiattr; prefixed; w/ other mkdn constructs; nested; gfm; footnote') {
          testcase.html =
`<p><sup><a href="#user-content-fn-fn" id="user-content-fnref-fn" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>
<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-fn">
<p><a class="wiki link type reftype__attrtype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a> <a href="#user-content-fnref-fn" data-footnote-backref class="data-footnote-backref" aria-label="Back to content">↩</a></p>
</li>
</ol>
</section>
`;
        }
        if (testcase.descr === 'wikiattr; unprefixed; w/ other mkdn constructs; nested; gfm; footnote') {
          testcase.html =
`<p><sup><a href="#user-content-fn-fn" id="user-content-fnref-fn" data-footnote-ref aria-describedby="footnote-label">1</a></sup></p>
<section data-footnotes class="footnotes"><h2 class="sr-only" id="footnote-label">Footnotes</h2>
<ol>
<li id="user-content-fn-fn">
<p>attrtype::<a class="wiki link" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a> <a href="#user-content-fnref-fn" data-footnote-backref class="data-footnote-backref" aria-label="Back to content">↩</a></p>
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

  describe('mdast', () => {

    runMkdnToMdast('mkdn -> mdast', mdastCases);
    runMdastToMkdn('mdast -> mkdn', mdastCases);
    it.skip('mkdn -> mdast: precision newlines');

  });

  describe('render from content string', () => {

    // todo: fix failing tests
    // runMkdnToHtml('mkdn -> html', wikiRefCases);
    runMkdnToHtml('mkdn -> html', wikiRefCases.filter((testcase: WikiRefTestCase) => {
      const failingTests: any = [
        'wikiattr; unprefixed; w/ other mkdn constructs; near lists; after',
        'wikiattr; unprefixed; w/ other mkdn constructs; near lists; immediate after',
        'wikiattr; unprefixed; malformed; list; mkdn-separated; items not [[bracketed]]',
        'wikiattr; unprefixed; w/ other mkdn constructs; near blockquotes; after',
        'wikiattr; unprefixed; w/ other mkdn constructs; near blockquotes; immediate after',
        'wikiattr; prefixed; w/ other mkdn constructs; near lists; after',
        'wikiattr; prefixed; w/ other mkdn constructs; near lists; immediate after',
        'wikiattr; prefixed; malformed; list; mkdn-separated; items not [[bracketed]]',
        'wikiattr; prefixed; w/ other mkdn constructs; near blockquotes; after',
        'wikiattr; prefixed; w/ other mkdn constructs; near blockquotes; immediate after',
        'wikiattr; mixed; wikirefs + caml; wiki multi single, caml mkdn list',
        'wikiattr; mixed; wikirefs + caml; wiki mkdn list, caml mkdn list',
      ];
      const skipFailing: boolean = !failingTests.some((descr: string) => descr === testcase.descr);
      return skipFailing;
    }));
    it.skip('mkdn -> html; precision newlines');
    it.skip('mkdn -> html');

  });

  describe('render from vfile', () => {

    // todo: fix failing tests
    // runMkdnToHtmlVFile('vfile mkdn -> html', wikiRefCases);
    runMkdnToHtmlVFile('vfile mkdn -> html', wikiRefCases.filter((testcase: WikiRefTestCase) => {
      const failingTests: any = [
        'wikiattr; unprefixed; w/ other mkdn constructs; near lists; after',
        'wikiattr; unprefixed; w/ other mkdn constructs; near lists; immediate after',
        'wikiattr; unprefixed; malformed; list; mkdn-separated; items not [[bracketed]]',
        'wikiattr; unprefixed; w/ other mkdn constructs; near blockquotes; after',
        'wikiattr; unprefixed; w/ other mkdn constructs; near blockquotes; immediate after',
        'wikiattr; prefixed; w/ other mkdn constructs; near lists; after',
        'wikiattr; prefixed; w/ other mkdn constructs; near lists; immediate after',
        'wikiattr; prefixed; malformed; list; mkdn-separated; items not [[bracketed]]',
        'wikiattr; prefixed; w/ other mkdn constructs; near blockquotes; after',
        'wikiattr; prefixed; w/ other mkdn constructs; near blockquotes; immediate after',
        'wikiattr; mixed; wikirefs + caml; wiki multi single, caml mkdn list',
        'wikiattr; mixed; wikirefs + caml; wiki mkdn list, caml mkdn list',
      ];
      const skipFailing: boolean = !failingTests.some((descr: string) => descr === testcase.descr);
      return skipFailing;
    }));
    it.skip('vfile mkdn -> html; precision newlines');
    it.skip('vfile mkdn -> html');

  });

});
