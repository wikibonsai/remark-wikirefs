import path from 'path';
import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
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
import { defaultsWikiRefs, defaultsWikiAttrs } from 'micromark-extension-wikirefs';

import type {
  AttrBoxNode,
  AttrBoxTitleNode,
  AttrBoxListNode,
  AttrKeyNode,
  AttrValNode,
  WikiAttrNode,
} from '../util/types';


// by the time 'wikiAttrFromMarkdown()' is run, attributes should already have been
// grouped in the front of the token stream (from 'resolveWikiAttrs()')

export function fromMarkdownWikiAttrs(opts?: Partial<WikiRefsOptions>): FromMarkdownExtension {
  const fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs = merge(defaultsWikiRefs(), defaultsWikiAttrs(), opts);

  // note: enter/exit keys should match a token name
  if (fullOpts.useCaml) {
    return {
      exit: {
        wikiAttrKey: exitWikiAttrKey,
        wikiAttrVal: exitWikiAttrVal,
      },
    } as FromMarkdownExtension;
  } else {
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
  }

  function enterWikiAttrBox (this: CompileContext, token: Token): void {
    const startAttrBoxNode: AttrBoxNode = {
      type: 'attrbox',
      children: [] as (AttrBoxTitleNode | AttrBoxListNode)[],
      data: {
        items: {} as AttrData,
        hName: 'aside',
        hProperties: {
          className: [],
        },
      },
    };
    // is accessible via 'this.stack' (see below)
    this.enter(startAttrBoxNode as AttrBoxNode as unknown as Node, token);
    // current key
    const curKey = this.getData('curKey');
    if (!curKey) this.setData('curKey', '');
  }

  function exitWikiAttrKey (this: CompileContext, token: Token): void {
    const attrtype: string = this.sliceSerialize(token).trim();
    const current: AttrBoxNode = top(this.stack as Node[] as unknown as Set<AttrBoxNode>);
    if (current.data && current.data.items && !Object.keys(current.data.items).includes(attrtype)) {
      current.data.items[attrtype] = [] as WikiAttrData[];
    }
    this.setData('curKey', attrtype);
  }

  function exitWikiAttrVal (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const current: AttrBoxNode = top(this.stack as Node[] as unknown as Set<AttrBoxNode>) as AttrBoxNode;
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
      const curKey: string = this.getData('curKey') as string;
      current.data.items[curKey].push(item);
    }
  }

  // hProperties are meant to build an element like this:
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

  // rehype properties:
  // https://github.com/rehypejs/rehype
  // https://github.com/syntax-tree/mdast-util-to-hast

  function exitWikiAttrBox (this: CompileContext, token: Token): void {
    const attrbox: AttrBoxNode = this.exit(token) as Node as unknown as AttrBoxNode;
    // if we have attr items, process them
    if (Object.values(attrbox.data.items).length > 0) {
      // attrbox
      attrbox.data.hProperties.className.push(fullOpts.cssNames.attrbox);

      // boxs-title
      attrbox.children.push({
        type: 'attrbox-title',
        children: [{
          type: 'text',
          value: fullOpts.attrs.title,
        }],
        data: {
          hName: 'span',
          hProperties: { className: [ fullOpts.cssNames.attrboxTitle ] },
        }
      } as AttrBoxTitleNode);

      // attrbox-list
      attrbox.children.push({
        type: 'attrbox-list',
        children: [] as (AttrKeyNode | AttrValNode)[],
        data: { hName: 'dl' },
      } as AttrBoxListNode);

      // build item hProperties from item data
      for (const [attrtype, items] of Object.entries(attrbox.data.items)) {

        // key / attrtype
        const attrType: string | undefined = attrtype ? attrtype : undefined;
        (attrbox.children[1].children as (AttrKeyNode | AttrValNode)[]).push({
          type: 'attr-key',
          children: [{
            type: 'text',
            value: attrType ? attrType : 'attrtype error',
          }],
          data: { hName: 'dt', },
        } as AttrKeyNode);

        // val / filenames
        for (const item of Array.from(items)) {
          const wikiItem: WikiAttrData = <WikiAttrData> item;

          // invalid
          if (!wikiItem.htmlHref) {
            (attrbox.children[1].children as (AttrKeyNode | AttrValNode)[]).push({
              type: 'attr-val',
              children: [
                {
                  type: 'wikiattr',
                  children: [{
                    type: 'text',
                    value: wikirefs.CONST.MARKER.OPEN + wikiItem.filename + wikirefs.CONST.MARKER.CLOSE,
                  }],
                  data: {
                    hName: 'a',
                    hProperties: {
                      className: [
                        fullOpts.cssNames.attr,
                        fullOpts.cssNames.wiki,
                        fullOpts.cssNames.invalid,
                      ],
                    },
                  },
                } as WikiAttrNode,
              ],
              data: { hName: 'dd' },
            } as AttrValNode);
          // valid
          } else {
            (attrbox.children[1].children as (AttrKeyNode | AttrValNode)[]).push({
              type: 'attr-val',
              children: [
                {
                  type: 'wikiattr',
                  children: [{
                    type: 'text',
                    value: wikiItem.htmlText ? wikiItem.htmlText : wikiItem.filename,
                  }],
                  data: {
                    hName: 'a',
                    hProperties: {
                      className: (wikiItem.doctype.length > 0)
                      // with doctype
                        ? [
                          fullOpts.cssNames.attr,
                          fullOpts.cssNames.wiki,
                          attrType
                            ? fullOpts.cssNames.reftype + attrType.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                            : fullOpts.cssNames.reftype + 'attrtype-error',
                          fullOpts.cssNames.doctype + wikiItem.doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
                        ]
                        // without doctype
                        : [
                          fullOpts.cssNames.attr,
                          fullOpts.cssNames.wiki,
                          attrType
                            ? fullOpts.cssNames.reftype + attrType.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                            : fullOpts.cssNames.reftype + 'attrtype-error',
                        ],
                      href: wikiItem.baseUrl + wikiItem.htmlHref,
                      dataHref: wikiItem.baseUrl + wikiItem.htmlHref,
                    },
                  },
                } as WikiAttrNode,
              ],
              data: { hName: 'dd' },
            } as AttrValNode);
          }

        }
      }
    }
  }

  // util

  function top<T>(stack: Set<T>): T {
    return Array.from(stack)[Array.from(stack).length - 1];
  }
}
