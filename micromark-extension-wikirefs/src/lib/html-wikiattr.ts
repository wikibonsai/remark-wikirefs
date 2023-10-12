// note: this plugin handles data-only -- there is no actual html rendering going on
import type { CompileContext, HtmlExtension } from 'micromark-util-types';
import type { AttrData, WikiAttrData, WikiRefsOptions } from '../util/types';
import type { DefaultsWikiRefs, DefaultsWikiAttrs }  from '../util/defaults';

import { ok as assert } from 'uvu/assert';
import { merge } from 'lodash-es';
import { Token } from 'micromark/lib/create-tokenizer';
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
    // this.setData('slurpOneLineEnding', true);
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
    // this.setData('slurpOneLineEnding', true);
  }

  // note: leaving this here to "close the token"
  function exitWikiAttrBox (this: CompileContext): void {
    const attrs: AttrData | undefined = (this.getData('attrStack') as unknown as AttrData[]).pop();
    assert((attrs !== undefined), 'in exitWikiAttrBox(): problem with \'attrs\'');
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
