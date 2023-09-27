import { merge } from 'lodash-es';
import { ok as assert } from 'uvu/assert';
import * as wikirefs from 'wikirefs';
import type { CompileContext, HtmlExtension } from 'micromark-util-types';
import { Token } from 'micromark/lib/create-tokenizer';

import type { AttrData, WikiAttrData, WikiRefsOptions } from '../util/types';
import type { DefaultsWikiRefs, DefaultsWikiAttrs }  from '../util/defaults';
import { defaultsWikiRefs, defaultsWikiAttrs } from '../util/defaults';


export function htmlWikiAttrs(opts?: Partial<WikiRefsOptions>): HtmlExtension {
  const fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs = merge(defaultsWikiRefs(), defaultsWikiAttrs(), opts);

  // note: enter/exit keys should match a token name (see 'cross-module.spec.ts')
  return {
    enter: {
      wikiAttrBox: enterWikiAttrBox,
    },
    exit: {
      wikiAttrKey: exitWikiAttrKey,
      wikiAttrVal: exitWikiAttrVal,
      wikiAttrBox: exitWikiAttrBox,
    },
  };

  function enterWikiAttrBox (this: CompileContext): void {
    // attrbox
    let stack = this.getData('attrStack') as unknown as AttrData[];
    if (!stack) this.setData('attrStack', (stack = []));
    stack.push({} as AttrData);
    // current key
    const curKey = this.getData('curKey');
    if (!curKey) this.setData('curKey', '');
  }

  function exitWikiAttrKey (this: CompileContext, token: Token): void {
    const attrtype: string = this.sliceSerialize(token);
    const stack: AttrData[] = this.getData('attrStack') as unknown as AttrData[];
    const current: AttrData = top(stack);
    if (!Object.keys(current).includes(attrtype)) {
      current[attrtype] = [] as WikiAttrData[];
    }
    this.setData('curKey', attrtype);
    // from: https://github.com/micromark/micromark-extension-gfm-footnote/blob/main/dev/lib/html.js#L86
    // “Hack” to prevent a line ending from showing up if we’re in a definition in
    // an empty list item.
    this.setData('slurpOneLineEnding', true);
  }

  function exitWikiAttrVal (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const stack: AttrData[] = this.getData('attrStack') as unknown as AttrData[];
    const current: AttrData = top(stack);
    // build vars
    const baseUrl: string = fullOpts.baseUrl;
    let htmlHref: string | undefined;
    let htmlText: string | undefined;
    if (!fullOpts.resolveHtmlHref || !fullOpts.resolveHtmlText) {
      htmlHref = undefined;
      htmlText = undefined;
    } else {
      htmlHref = fullOpts.resolveHtmlHref(filename);
      htmlText = fullOpts.resolveHtmlText(filename);
    }
    let doctype: string = '';
    if (fullOpts.resolveDocType) {
      const resolvedDocType: string | undefined = fullOpts.resolveDocType(filename);
      doctype = resolvedDocType ? resolvedDocType : '';
    }
    // construct data
    const item: WikiAttrData = {
      type: 'wiki',
      doctype: doctype,
      filename: filename,
      htmlHref: htmlHref ? htmlHref : '',
      htmlText: htmlText ? htmlText : '',
      baseUrl: baseUrl,
    };
    const curKey: string = this.getData('curKey') as unknown as string;
    current[curKey].push(item);
    // from: https://github.com/micromark/micromark-extension-gfm-footnote/blob/main/dev/lib/html.js#L86
    // “Hack” to prevent a line ending from showing up if we’re in a definition in
    // an empty list item.
    this.setData('slurpOneLineEnding', true);
  }

  // an element like this should be built:
  // 
  // <aside class="attrbox">
  //  <span class="attrbox-title">Attributes</span>
  //    <dl>
  //      <dt>attrtype</dt>
  //        <dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/tests/fixtures/fname-a" data-href="/tests/fixtures/fname-a">title a</a></dd>
  //        <dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/tests/fixtures/fname-b" data-href="/tests/fixtures/fname-b">title b</a></dd>
  //        <dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/tests/fixtures/fname-c" data-href="/tests/fixtures/fname-c">title c</a></dd>
  //        ...
  //    </dl>
  // </aside>

  // by the time 'exitAttrs()' is run, attributes should already have been
  // grouped in the front of the token stream (due to the 'wikiAttrsResolve()')
  function exitWikiAttrBox (this: CompileContext): void {
    // let self = this;
    const attrs: AttrData | undefined = (this.getData('attrStack') as unknown as AttrData[]).pop();
    assert((attrs !== undefined), 'in exitWikiAttrBox(): problem with \'attrs\'');
    if ((attrs !== undefined) && Object.keys(attrs).length !== 0) {
      // open
      this.tag(`<aside class="${fullOpts.cssNames.attrbox}">`);
      this.tag(`<span class="${fullOpts.cssNames.attrboxTitle}">`);
      this.raw(fullOpts.attrs.title);
      this.tag('</span>');
      this.tag('<dl>');
      // content
      for (const [attrtype, items] of Object.entries(attrs)) {
        // attrtype
        this.tag('<dt>');
        if (attrtype === undefined) {
          this.raw('attrtype error');
        } else {
          this.raw(attrtype.trim());
        }
        this.tag('</dt>');
        // [[wikilinks]] / filenames
        for (const item of items) {
          this.tag('<dd>');
          const wikiItem: WikiAttrData = <WikiAttrData> item;
          // css
          const cssClassArray: string[] = [];
          cssClassArray.push(fullOpts.cssNames.attr);
          const htmlHref: string | undefined = wikiItem.htmlHref;
          const htmlText: string = wikiItem.htmlText ? wikiItem.htmlText : wikiItem.filename;
          // invalid
          if (htmlHref === '') {
            this.tag(`<a class="${fullOpts.cssNames.attr} ${fullOpts.cssNames.wiki} ${fullOpts.cssNames.invalid}">`);
            this.raw(wikirefs.CONST.MARKER.OPEN + wikiItem.filename + wikirefs.CONST.MARKER.CLOSE);
          // valid
          } else {
            cssClassArray.push(fullOpts.cssNames.wiki);
            cssClassArray.push(fullOpts.cssNames.reftype + attrtype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
            if (wikiItem.doctype.length > 0) {
              cssClassArray.push(fullOpts.cssNames.doctype + wikiItem.doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''));
            }
            const css: string = cssClassArray.join(' ');
            this.tag(`<a class="${css}" href="${wikiItem.baseUrl + htmlHref}" data-href="${wikiItem.baseUrl + htmlHref}">`);
            this.raw(htmlText);
          }
          this.tag('</a>');
          this.tag('</dd>');
        }
      }
      // close
      this.tag('</dl>');
      this.tag('</aside>');
    }
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}