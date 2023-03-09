import { ok as assert } from 'uvu/assert';
import * as wikirefs from 'wikirefs';
import type { CompileContext, HtmlExtension } from 'micromark-util-types';
import type { Token } from 'micromark/dev/lib/initialize/document';

import type { WikiLinkData, ReqHtmlOpts } from '../util/types';


export function htmlWikiLinks(opts: ReqHtmlOpts): HtmlExtension {
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

  function enterWikiLink (this: CompileContext): void {
    let stack: WikiLinkData[] = this.getData('WikiLinkStack') as unknown as WikiLinkData[];
    if (!stack) this.setData('WikiLinkStack', (stack = []));
    stack.push({} as WikiLinkData);
  }

  function exitLinkTypeTxt (this: CompileContext, token: Token): void {
    const linktype: string = this.sliceSerialize(token);
    const stack: WikiLinkData[] = this.getData('WikiLinkStack') as unknown as WikiLinkData[];
    const current: WikiLinkData = top(stack);
    current.linktype = linktype;
  }

  function exitFileNameTxt (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const stack: WikiLinkData[] = this.getData('WikiLinkStack') as unknown as WikiLinkData[];
    const current: WikiLinkData = top(stack);
    current.filename = filename;
  }

  function exitLabelTxt (this: CompileContext, token: Token): void {
    const label: string = this.sliceSerialize(token);
    const stack: WikiLinkData[] = this.getData('WikiLinkStack') as unknown as WikiLinkData[];
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

  function exitWikiLink (this: CompileContext): void {
    const wikiLink: WikiLinkData | undefined = (this.getData('WikiLinkStack') as unknown as WikiLinkData[]).pop();
    assert((wikiLink !== undefined), 'in exitWikiLink(): problem with \'WikiLinkData\'');
    // init vars
    const filename: string             = wikiLink.filename;
    const label: string | undefined    = wikiLink.label;
    const linktype: string | undefined = wikiLink.linktype;
    // resolvers
    const htmlHref: string | undefined = opts.resolveHtmlHref(filename);
    // @ts-expect-error: check occurs in ternary operator
    let   htmlText: string             = (opts.resolveHtmlText(filename) !== undefined) ? opts.resolveHtmlText(filename) : filename;
    // @ts-expect-error: check occurs in ternary operator
    const doctype : string             = (opts.resolveDocType && opts.resolveDocType(filename) !== undefined)            ? opts.resolveDocType(filename)  : '';
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
        if (linktype) {
          // typed
          const typeCssClass: string = opts.cssNames.type;
          if (typeCssClass !== undefined && typeCssClass.length !== 0) {
            cssClassArray.push(typeCssClass);
          }
          // linktype
          const linkTypeSlug: string = linktype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(opts.cssNames.reftype + linkTypeSlug);
        }
        // doctype
        if (doctype.length > 0) {
          const docTypeSlug: string | undefined = doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(opts.cssNames.doctype + docTypeSlug);
        }
      }
      const css: string | null = cssClassArray.join(' ');
      if (css === null) { console.warn('\'css\' is null'); }
      htmlOpen = `<a class="${css}" href="${opts.baseUrl + htmlHref}" data-href="${opts.baseUrl + htmlHref}">`;
    }
    // invalid
    if (htmlHref === undefined) {
      htmlText = '';
      // linktype
      if ((linktype !== undefined) && (linktype !== '')) {
        htmlText = wikirefs.CONST.MARKER.PREFIX + linktype + wikirefs.CONST.MARKER.TYPE;
      }
      htmlText += wikirefs.CONST.MARKER.OPEN + filename;
      // labelled
      if (label) {
        htmlText += wikirefs.CONST.MARKER.LABEL + label;
      }
      htmlText += wikirefs.CONST.MARKER.CLOSE;
    // valid
    } else {                 // order of precedence
      for (const content of [label, htmlText, filename]) {
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
