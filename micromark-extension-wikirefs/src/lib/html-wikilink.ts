import { merge } from 'lodash-es';
import { ok as assert } from 'uvu/assert';
import * as wikirefs from 'wikirefs';
import type { CompileContext, HtmlExtension } from 'micromark-util-types';
import type { Token } from 'micromark/dev/lib/initialize/document';

import type { WikiLinkData, WikiRefsOptions } from '../util/types';
import type { DefaultsWikiRefs, DefaultsWikiLinks }  from '../util/defaults';
import { defaultsWikiRefs, defaultsWikiLinks } from '../util/defaults';


export function htmlWikiLinks(opts: Partial<WikiRefsOptions>): HtmlExtension {
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
    const htmlHref: string | undefined = fullOpts.resolveHtmlHref(filename);
    let   htmlText: string             = (fullOpts.resolveHtmlText(filename) !== undefined) ? fullOpts.resolveHtmlText(filename) : filename;
    const doctype : string             = (fullOpts.resolveDocType && (fullOpts.resolveDocType(filename) !== undefined))          ? fullOpts.resolveDocType(filename)  : '';
    // finish populating data
    wikiLink.htmlHref = htmlHref;
    wikiLink.htmlText = htmlText;
    wikiLink.doctype = doctype;

    ////
    // render

    // open
    let htmlOpen: string = '';
    if (htmlHref === undefined) {
      htmlOpen = `<a class="${fullOpts.cssNames.wiki} ${fullOpts.cssNames.link} ${fullOpts.cssNames.invalid}">`;
    } else {
      // css
      const cssClassArray: string[] = [];
      // due to defaults, this should always be true...this if-check is mostly to make typescript happy
      if (fullOpts.cssNames) {
        // valid
        cssClassArray.push(fullOpts.cssNames.wiki);
        cssClassArray.push(fullOpts.cssNames.link);
        // linktype
        if (linktype) {
          // typed
          const typeCssClass: string = fullOpts.cssNames.type;
          if (typeCssClass !== undefined && typeCssClass.length !== 0) {
            cssClassArray.push(typeCssClass);
          }
          // linktype
          const linkTypeSlug: string = linktype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(fullOpts.cssNames.reftype + linkTypeSlug);
        }
        // doctype
        if (doctype.length > 0) {
          const docTypeSlug: string | undefined = doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(fullOpts.cssNames.doctype + docTypeSlug);
        }
      }
      const css: string | null = cssClassArray.join(' ');
      if (css === null) { console.warn('\'css\' is null'); }
      htmlOpen = `<a class="${css}" href="${fullOpts.baseUrl + htmlHref}" data-href="${fullOpts.baseUrl + htmlHref}">`;
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
