import assert from 'node:assert/strict';

import { merge } from 'lodash-es';

import * as Uni from 'unist';
import { toMarkdown } from 'mdast-util-to-markdown';
import { fromMarkdown } from 'mdast-util-from-markdown';

import type { WikiRefsOptions } from 'micromark-extension-wikirefs';
import { syntaxWikiRefs } from 'micromark-extension-wikirefs';

import * as wikirefs from 'wikirefs';
import type { TestFileData } from 'wikirefs-spec';
import { fileDataMap } from 'wikirefs-spec';

import { makeMockOptsForRenderOnly } from '../../micromark-extension-wikirefs/test/config';
import { visitNodeType } from './util/visit';
import type {
  AttrBoxNode,
  EmbedMkdnWrapperNode,
  EmbedMediaSpanNode,
  WikiLinkNode,
} from '../src/util/types';
import { fromMarkdownWikiRefs, toMarkdownWikiRefs } from '../src';

import type { TestCaseMdast } from './types';
import { mdastCases } from './cases';


// setup

let mockOpts: Partial<WikiRefsOptions>;
let i: number = 0;

function runFromMarkdown(contextMsg: string, tests: TestCaseMdast[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        const mkdn: string = test.mkdn;
        const expdNode: Partial<AttrBoxNode | WikiLinkNode | EmbedMediaSpanNode | EmbedMkdnWrapperNode> = test.node as (AttrBoxNode | WikiLinkNode | EmbedMediaSpanNode | EmbedMkdnWrapperNode);
        let cycleStack: string[] = [];
        // setup / go
        // note: wrap fromMarkdown context for markdown wikiembeds to work
        function fromMarkdownWrapper(content: string): any {
          // merge suite options with case options
          const opts: Partial<WikiRefsOptions> = merge({
            ...mockOpts,
            resolveEmbedContent: (filename: string): (string | undefined) => {
              // cycle detection
              if (!cycleStack) {
                cycleStack = [];
              } else {
                if (cycleStack.includes(filename)) {
                  // reset stack before leaving
                  cycleStack = [];
                  return 'cycle detected';
                }
              }
              const fakeFile: TestFileData | undefined = fileDataMap.find((fileData: TestFileData) => fileData.filename === filename);
              const content: string | undefined = fakeFile ? fakeFile.content : undefined;
              // markdown-only
              if (!wikirefs.isMedia(filename)) {
                let mdastContent: string | undefined;
                cycleStack.push(filename);
                if (content === undefined) {
                  mdastContent = undefined;
                } else if (content.length === 0) {
                  mdastContent = '';
                } else {
                  mdastContent = fromMarkdownWrapper(content);
                }
                // reset stack before leaving
                cycleStack = [];
                return mdastContent;
              }
            }
          }, test.opts);
          return fromMarkdown(content, {
            extensions: [syntaxWikiRefs()],
            mdastExtensions: [
              fromMarkdownWikiRefs(opts),
            ],
          });
        }
        const actlAst: any = fromMarkdownWrapper(mkdn);
        // assert
        let visited: boolean = false;
        visitNodeType(actlAst, expdNode.type as string, (actlNode: any) => {
          assert.strictEqual(actlNode.type, expdNode.type);
          // assert.deepStrictEqual(actlNode.data, expdNode.data);
          assert.deepStrictEqual(actlNode.children, expdNode.children);
          visited = true;
        });
        assert.strictEqual(visited, true);
      });
    }
  });
}

function runToMarkdown(contextMsg: string, tests: TestCaseMdast[]): void {
  context(contextMsg, () => {
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        // test vars
        // merge suite options with case options
        const opts: Partial<WikiRefsOptions> = merge(mockOpts, test.opts);
        const node: Partial<AttrBoxNode | WikiLinkNode> = test.node as (AttrBoxNode | WikiLinkNode);
        const expdMkdn: string = test.mkdn;
        // setup
        // build ast: ast nodes will normally appear in paragraph
        //            context, which can affect symbol escaping
        const paragraph: Uni.Parent = {
          type: 'paragraph',
          children: [
            node as (AttrBoxNode | WikiLinkNode),
          ],
        };
        // for (text) 'WikiLink' test cases, but not for 'WikiEmbed' cases
        if (expdMkdn.includes('.') && !expdMkdn.includes('!')) {
          paragraph.children.push({
            type: 'text',
            // @ts-expect-error: todo - "Argument of type '{ type: string; value: string; }' is not assignable to parameter of type 'Node<Data>'."
            value: '.',
          });
        }
        const root: Uni.Parent = {
          type: 'root',
          children: [paragraph],
        };
        // go
        // @ts-expect-error: todo - "Argument of type 'Parent<Node<Data>, Data>' is not assignable to parameter of type 'Node'."
        const actlMkdn: string = toMarkdown(root, {
          extensions: [
            toMarkdownWikiRefs(opts),
          ],
        });
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

describe('mdast-util-wikirefs', () => {

  beforeEach(() => {
    mockOpts = makeMockOptsForRenderOnly();
  });

  runFromMarkdown('mkdn -> mdast', mdastCases);
  runToMarkdown('mdast -> mkdn', mdastCases);
  it.skip('toMarkdown: precision newlines -- see \'runToMarkdown\' assert modifications');

});
