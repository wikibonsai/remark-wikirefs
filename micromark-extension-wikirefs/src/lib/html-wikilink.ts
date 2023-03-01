import type { HtmlExtension } from 'micromark-util-types';
import type { Token } from 'micromark/dev/lib/initialize/document';

import * as wikirefs from 'wikirefs';

import type { WikiLinkData, ReqHtmlOpts } from '../util/types';


// leaving off return type 'HtmlExtension' due to:
//  Type '(this: any, token: Token) => void' is not assignable to type '() => void'.ts(2322)
export function htmlWikiLinks(this: any, opts: ReqHtmlOpts): HtmlExtension {
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
  };

  function enterWikiLink (this: any): void {
    let stack: WikiLinkData[] = this.getData('WikiLinkStack');
    if (!stack) this.setData('WikiLinkStack', (stack = []));
    stack.push({} as WikiLinkData);
  }

  function exitLinkTypeTxt (this: any, token: Token): void {
    const linktype: string = this.sliceSerialize(token);
    const stack: WikiLinkData[] = this.getData('WikiLinkStack');
    const current: WikiLinkData = top(stack);
    current.linktype = linktype;
  }

  function exitFileNameTxt (this: any, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const stack: WikiLinkData[] = this.getData('WikiLinkStack');
    const current: WikiLinkData = top(stack);
    current.filename = filename;
    if (opts.resolveDocType) {
      const resolvedDocType: string | undefined = opts.resolveDocType(filename);
      current.doctype = resolvedDocType ? resolvedDocType : '';
    }
  }

  function exitLabelTxt (this: any, token: Token): void {
    const label: string = this.sliceSerialize(token);
    const stack: WikiLinkData[] = this.getData('WikiLinkStack');
    const current: WikiLinkData = top(stack);
    current.label = label;
  }

  // an element like this should be built:
  // 
  // typed
  // 
  // <a class="wiki link reftype__linktype doctype__doctype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>
  // 
  // untyped
  // 
  // <a class="wiki link doctype__doctype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a>

  function exitWikiLink (this: any): void {
    const wikiLink: WikiLinkData = this.getData('WikiLinkStack').pop();

    // init vars
    const htmlHref: string | undefined = opts.resolveHtmlHref(wikiLink.filename);
    // open
    let htmlOpen: string = '';
    if (htmlHref === undefined) {
      htmlOpen = `<a class="${opts.cssNames.wiki} ${opts.cssNames.link} ${opts.cssNames.invalid}">`;
    } else {
      // css
      const cssClassArray: string[] = [];
      // due to defaults, this should always be true...this if-check is mostly to make typescript happy
      if (opts.cssNames) {
        // valid
        cssClassArray.push(opts.cssNames.wiki);
        cssClassArray.push(opts.cssNames.link);
        // linktype
        if (wikiLink.linktype) {
          // typed
          const typeCssClass: string = opts.cssNames.type;
          if (typeCssClass !== undefined && typeCssClass.length !== 0) {
            cssClassArray.push(typeCssClass);
          }
          // linktype
          const linkTypeSlug: string = wikiLink.linktype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(opts.cssNames.reftype + linkTypeSlug);
        }
        // doctype
        if (opts.resolveDocType && wikiLink.doctype) {
          const docTypeSlug: string | undefined = wikiLink.doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(opts.cssNames.doctype + docTypeSlug);
        }
      }
      const css: string | null = cssClassArray.join(' ');
      if (css === null) { console.warn('\'css\' is null'); }
      htmlOpen = `<a class="${css}" href="${opts.baseUrl + htmlHref}" data-href="${opts.baseUrl + htmlHref}">`;
    }
    // htmlText
    let htmlText: string = '';
    // invalid
    if (htmlHref === undefined) {
      // linktype
      if ((wikiLink.linktype !== undefined) && (wikiLink.linktype !== '')) {
        htmlText = wikirefs.CONST.MARKER.PREFIX + wikiLink.linktype + wikirefs.CONST.MARKER.TYPE;
      }
      htmlText += wikirefs.CONST.MARKER.OPEN + wikiLink.filename;
      // labelled
      if (wikiLink.label) {
        htmlText += wikirefs.CONST.MARKER.LABEL + wikiLink.label;
      }
      htmlText += wikirefs.CONST.MARKER.CLOSE;
    // valid
    } else {                 // html text, order of precedence
      for (const content of [wikiLink.label, opts.resolveHtmlText(wikiLink.filename), wikiLink.filename]) {
        if (typeof content === 'string') {
          htmlText = content;
          break;
        }
      }
    }
    // close
    const htmlClose: string = '</a>';

    this.tag(htmlOpen);
    this.raw(htmlText);
    this.tag(htmlClose);
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
