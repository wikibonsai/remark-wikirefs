import type { CompileContext, Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import type { Node } from 'mdast-util-from-markdown/lib';
import type { Token } from 'micromark-util-types';
import type {
  AttrData,
  DefaultsWikiRefs,
  DefaultsWikiAttrs,
  WikiAttrData,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';
import type { AttrBoxDataNode } from '../util/types';

import { merge } from 'lodash-es';
import { defaultsWikiRefs, defaultsWikiAttrs } from 'micromark-extension-wikirefs';


export function fromMarkdownWikiAttrs(opts?: Partial<WikiRefsOptions>): FromMarkdownExtension {
  const fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs = merge(defaultsWikiRefs(), defaultsWikiAttrs(), opts);

  // note: enter/exit keys should match a token name
  return {
    enter: {
      wikiAttrBox: enterWikiAttrBox,
    },
    exit: {
      wikiAttrKey: exitWikiAttrKey,
      wikiAttrVal: exitWikiAttrVal,
      wikiAttrBox: exitWikiAttrBox,
    },
  } as FromMarkdownExtension;

  function enterWikiAttrBox (this: CompileContext, token: Token): void {
    const attrBoxDataNode: AttrBoxDataNode = {
      type: 'attrbox-data',
      data: {
        items: {} as AttrData,
      },
    };
    // is accessible via 'this.stack' (see below)
    this.enter(attrBoxDataNode as AttrBoxDataNode as unknown as Node, token);
    // current key
    const curKey: string | undefined = this.getData('curKey');
    if (curKey === undefined) { this.setData('curKey', ''); }
  }

  function exitWikiAttrKey (this: CompileContext, token: Token): void {
    const attrtype: string = this.sliceSerialize(token).trim();
    const current: AttrBoxDataNode = top(this.stack as Node[] as unknown as Set<AttrBoxDataNode>);
    if (current.data && current.data.items && !Object.keys(current.data.items).includes(attrtype)) {
      current.data.items[attrtype] = [] as WikiAttrData[];
    }
    this.setData('curKey', attrtype);
  }

  function exitWikiAttrVal (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const current: AttrBoxDataNode = top(this.stack as Node[] as unknown as Set<AttrBoxDataNode>);
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
    if (current.data && current.data.items) {
      const curKey: string | undefined = this.getData('curKey');
      if (curKey !== undefined) { current.data.items[curKey].push(item); }
    }
  }

  // note: leaving this here to close the token
  function exitWikiAttrBox (this: CompileContext, token: Token): void {
    this.exit(token) as Node as unknown as AttrBoxDataNode;
    return;
  }

  // util

  function top<T>(stack: Set<T>): T {
    return Array.from(stack)[Array.from(stack).length - 1];
  }
}
