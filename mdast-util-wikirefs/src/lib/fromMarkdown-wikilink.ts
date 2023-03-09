import path  from 'path';
import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
import type { Extension } from 'mdast-util-from-markdown';
import type { Token } from 'micromark-util-types';
import type {
  OptAttr,
  OptCssNames,
  WikiRefsOptions,
  WikiLinkData,
} from 'micromark-extension-wikirefs';

import type { WikiLinkNode } from '../util/types';


// required options
interface ReqOpts {
  resolveHtmlText: (fname: string) => string | undefined;
  resolveHtmlHref: (fname: string) => string | undefined;
  resolveDocType?: (fname: string) => string | undefined;
  baseUrl: string;
  attrs: OptAttr;
  cssNames: OptCssNames;
}

export function fromMarkdownWikiLinks(this: any, opts?: Partial<WikiRefsOptions>): Extension {
  // opts
  const defaults: ReqOpts = {
    resolveHtmlHref: (fname: string) => {
      const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
      fname = fname.replace(extname, '');
      return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
    },
    resolveHtmlText: (fname: string) => fname.replace(/-/g, ' '),
    baseUrl: '',
    attrs: {
      enable: true,
      render: true,
      title: 'Attributes',
    } as OptAttr,
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
    } as OptCssNames,
  };
  const fullOpts: ReqOpts = merge(defaults, opts);

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
  } as Extension;

  function enterWikiLink (this: any, token: Token) {
    const startWikiLinkNode: WikiLinkNode = {
      type: 'wikilink',
      children: [],
      data: {
        item: {
          doctype: '',
          filename: '',
          label: '',
          linktype: '',
        } as WikiLinkData,
        hName: 'a',
        hProperties: {
          className: [],
        },
      },
    };
    // is accessible via 'this.stack' (see below)
    this.enter(startWikiLinkNode, token);
  }

  function exitLinkTypeTxt (this: any, token: Token) {
    const linktype: string = this.sliceSerialize(token);
    const current: WikiLinkNode = top(this.stack);
    current.data.item.linktype = linktype;
  }

  function exitFileNameTxt (this: any, token: Token) {
    const filename: string = this.sliceSerialize(token);
    const current: WikiLinkNode = top(this.stack);
    current.data.item.filename = filename;
  }

  function exitLabelTxt (this: any, token: Token) {
    const label: string = this.sliceSerialize(token);
    const current: WikiLinkNode = top(this.stack);
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

  function exitWikiLink (this: any, token: Token) {
    const wikiLink: WikiLinkNode = this.exit(token);

    // html-href
    const htmlHref: string | undefined = fullOpts.resolveHtmlHref(wikiLink.data.item.filename);
    // html-text
    const labelText: string | undefined = wikiLink.data.item.label;
    const filename: string = wikiLink.data.item.filename;
    let htmlText: string | undefined = fullOpts.resolveHtmlText(wikiLink.data.item.filename) ? fullOpts.resolveHtmlText(wikiLink.data.item.filename) : wikiLink.data.item.filename;
    // invalid
    if (htmlHref === undefined) {
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

    // css
    const cssClassArray: string[] = [];
    cssClassArray.push(fullOpts.cssNames.wiki);
    cssClassArray.push(fullOpts.cssNames.link);
    // invalid
    if (htmlHref === undefined) {
      cssClassArray.push(fullOpts.cssNames.invalid);
    // valid
    } else {
      // linktype
      /* eslint-disable indent */
      const linkType: string | undefined = wikiLink.data.item.linktype
                                            ? wikiLink.data.item.linktype
                                            : undefined;
      /* eslint-enable indent */
      if (linkType !== undefined && linkType.length !== 0) {
        const type: string = fullOpts.cssNames.type;
        const linkTypeSlug: string = linkType.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        cssClassArray.push(type);
        cssClassArray.push(fullOpts.cssNames.reftype + linkTypeSlug);
      }
      // doctype
      let docType: string = '';
      if (fullOpts.resolveDocType) {
        const resolvedDocType: string | undefined = fullOpts.resolveDocType(filename);
        docType = resolvedDocType ? resolvedDocType : '';
        // set data
        wikiLink.data.item.doctype = docType;
        if (docType !== undefined && docType.length !== 0) {
          const docTypeSlug: string = docType.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(fullOpts.cssNames.doctype + docTypeSlug);
        }
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
