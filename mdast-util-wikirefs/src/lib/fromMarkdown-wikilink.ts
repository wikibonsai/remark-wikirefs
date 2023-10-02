import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import type { Token } from 'micromark-util-types';
import type {
  DefaultsWikiRefs,
  DefaultsWikiLinks,
  WikiRefsOptions,
  WikiLinkData,
} from 'micromark-extension-wikirefs';
import { defaultsWikiRefs, defaultsWikiLinks } from 'micromark-extension-wikirefs';

import { Node } from 'mdast-util-from-markdown/lib';

import type { WikiLinkNode } from '../util/types';


export function fromMarkdownWikiLinks(opts?: Partial<WikiRefsOptions>): FromMarkdownExtension {
  const fullOpts: DefaultsWikiRefs & DefaultsWikiLinks = merge(defaultsWikiRefs(), defaultsWikiLinks(), opts);

  // note: enter/exit keys should match a token name
  return {
    enter: {
      wikiLink: enterWikiLink,
    },
    exit: {
      wikiLinkTypeTxt: exitLinkTypeTxt,
      wikiLinkFileNameTxt: exitFileNameTxt,
      wikiLinkLabelTxt: exitLabelTxt,
      wikiLink: exitWikiLink,
    }
  } as FromMarkdownExtension;

  function enterWikiLink (this: CompileContext, token: Token): void {
    const startWikiLinkNode: WikiLinkNode = {
      type: 'wikilink',
      children: [],
      data: {
        item: {
          doctype: '',
          filename: '',
          label: '',
          linktype: '',
          htmlHref: '',
          htmlText: '',
        } as WikiLinkData,
        hName: 'a',
        hProperties: {
          className: [],
        },
      },
    };
    // is accessible via 'this.stack' (see below)
    this.enter(startWikiLinkNode as WikiLinkNode as unknown as Node, token);
  }

  function exitLinkTypeTxt (this: CompileContext, token: Token): void {
    const linktype: string = this.sliceSerialize(token);
    const current: WikiLinkNode = top(this.stack as Node[] as unknown as WikiLinkNode[]);
    current.data.item.linktype = linktype;
  }

  function exitFileNameTxt (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const current: WikiLinkNode = top(this.stack as Node[] as unknown as WikiLinkNode[]);
    current.data.item.filename = filename;
  }

  function exitLabelTxt (this: CompileContext, token: Token): void {
    const label: string = this.sliceSerialize(token);
    const current: WikiLinkNode = top(this.stack as Node[] as unknown as WikiLinkNode[]);
    current.data.item.label = label;
  }

  // hProperties are meant to build an element like this:
  // 
  // typed
  // 
  // <a class="wiki link type reftype__linktype doctype__doctype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>
  // 
  // untyped
  // 
  // <a class="wiki link doctype__doctype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>

  function exitWikiLink (this: CompileContext, token: Token): void {
    const wikiLink: WikiLinkNode = this.exit(token) as Node as unknown as WikiLinkNode;

    // html-text
    const labelText: string | undefined = wikiLink.data.item.label;
    const filename: string = wikiLink.data.item.filename;
    // resolvers
    const htmlHref: string = fullOpts.resolveHtmlHref(wikiLink.data.item.filename) ? fullOpts.resolveHtmlHref(wikiLink.data.item.filename) : '';
    let htmlText: string | undefined = fullOpts.resolveHtmlText(wikiLink.data.item.filename) ? fullOpts.resolveHtmlText(wikiLink.data.item.filename) : wikiLink.data.item.filename;
    // invalid
    if (htmlHref.length === 0) {
      htmlText = '';
      if (wikiLink.data.item.linktype) {
        htmlText += (wikirefs.CONST.MARKER.PREFIX + wikiLink.data.item.linktype + wikirefs.CONST.MARKER.TYPE);
      }
      htmlText += (wikirefs.CONST.MARKER.OPEN + wikiLink.data.item.filename);
      if (wikiLink.data.item.label) {
        htmlText += (wikirefs.CONST.MARKER.LABEL + wikiLink.data.item.label);
      }
      htmlText += wikirefs.CONST.MARKER.CLOSE;
    // valid
    } else {            // html text, order of precedence
      for (const content of [labelText, htmlText, filename]) {
        if ((typeof content === 'string') && content.length > 0) {
          htmlText = content;
          break;
        }
      }
    }
    const doctype: string = (fullOpts.resolveDocType) ? fullOpts.resolveDocType(filename) : '';
    // finish populating data
    wikiLink.data.item.htmlHref = htmlHref;
    wikiLink.data.item.htmlText = htmlText;
    wikiLink.data.item.doctype = doctype;

    ////
    // render

    // css
    const cssClassArray: string[] = [];
    cssClassArray.push(fullOpts.cssNames.wiki);
    cssClassArray.push(fullOpts.cssNames.link);
    // invalid
    if (htmlHref.length === 0) {
      cssClassArray.push(fullOpts.cssNames.invalid);
    // valid
    } else {
      // linktype
      /* eslint-disable indent */
      const linktype: string | undefined = wikiLink.data.item.linktype
                                            ? wikiLink.data.item.linktype
                                            : undefined;
      /* eslint-enable indent */
      if (linktype !== undefined && linktype.length !== 0) {
        const type: string = fullOpts.cssNames.type;
        const linkTypeSlug: string = linktype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        cssClassArray.push(type);
        cssClassArray.push(fullOpts.cssNames.reftype + linkTypeSlug);
      }
      // doctype
      if (doctype.length > 0) {
        const docTypeSlug: string = doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        cssClassArray.push(fullOpts.cssNames.doctype + docTypeSlug);
      }
    }

    // populate final node properties

    // rehype properties:
    // https://github.com/rehypejs/rehype
    // https://github.com/syntax-tree/mdast-util-to-hast
    wikiLink.data.hProperties.className = cssClassArray;
    if ((htmlHref !== undefined) && (htmlHref.length > 0)) {
      wikiLink.data.hProperties.href     = fullOpts.baseUrl + htmlHref;
      wikiLink.data.hProperties.dataHref = fullOpts.baseUrl + htmlHref;
    }
    wikiLink.children = [{
      type: 'text',
      value: htmlText,
    }];
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
