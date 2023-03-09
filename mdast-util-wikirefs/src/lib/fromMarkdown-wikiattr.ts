import path from 'path';
import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
import type { Extension } from 'mdast-util-from-markdown';
import type { Token } from 'micromark-util-types';

import type {
  AttrData,
  WikiAttrData,
  OptAttr,
  OptCssNames,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';

import type {
  AttrBoxNode,
  AttrBoxTitleNode,
  AttrBoxListNode,
  AttrKeyNode,
  AttrValNode,
  WikiAttrNode,
} from '../util/types';


// required options
interface ReqOpts {
  resolveHtmlText: (fname: string) => string | undefined;
  resolveHtmlHref: (fname: string) => string | undefined;
  resolveDocType?: (fname: string) => string | undefined;
  baseUrl: string;
  attrs: OptAttr;
  cssNames: OptCssNames;
  useCaml: boolean;
}

// by the time 'wikiAttrFromMarkdown()' is run, attributes should already have been
// grouped in the front of the token stream (from 'resolveWikiAttrs()')

export function fromMarkdownWikiAttrs(this: any, opts?: Partial<WikiRefsOptions>): Extension {
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
    useCaml: false,
  };
  const fullOpts: ReqOpts = merge(defaults, opts);

  // keep track of current attrtype that corresponds to each filename
  // var curKey: string;

  // note: enter/exit keys should match a token name
  if (fullOpts.useCaml) {
    return {
      exit: {
        wikiAttrKey: exitWikiAttrKey,
        wikiAttrVal: exitWikiAttrVal,
      },
    } as Extension;
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
    } as Extension;
  }

  function enterWikiAttrBox (this: any, token: Token) {
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
    this.enter(startAttrBoxNode, token);
    // current key
    const curKey = this.getData('curKey');
    if (!curKey) this.setData('curKey', '');
  }

  function exitWikiAttrKey (this: any, token: Token) {
    const attrtype: string = this.sliceSerialize(token).trim();
    const current: AttrBoxNode = top(this.stack);
    if (current.data && current.data.items && !Object.keys(current.data.items).includes(attrtype)) {
      current.data.items[attrtype] = [] as WikiAttrData[];
    }
    this.setData('curKey', attrtype);
  }

  function exitWikiAttrVal (this: any, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const current: AttrBoxNode = top(this.stack);
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
      const curKey: string = this.getData('curKey');
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

  function exitWikiAttrBox (this: any, token: Token) {
    const attrbox: AttrBoxNode = this.exit(token);
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
