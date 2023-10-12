import type {
  AttrData,
  DefaultsWikiRefs,
  DefaultsWikiAttrs,
  WikiAttrData,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';
import type {
  AttrBoxNode,
  AttrBoxDataNode,
  AttrBoxTitleNode,
  AttrBoxListNode,
  AttrKeyNode,
  AttrValNode,
  WikiAttrNode,
} from '../util/types';

import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
import * as Uni from 'unist';
import { selectAll } from 'unist-util-select';
import { defaultsWikiRefs, defaultsWikiAttrs } from 'micromark-extension-wikirefs';


export function initWikiAttrBox(tree: Uni.Node, opts?: Partial<WikiRefsOptions>): AttrBoxNode | undefined {
  // options
  const fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs = merge(defaultsWikiRefs(), defaultsWikiAttrs(), opts);
  // todo: should i be making node assertions...?
  //       https://github.com/syntax-tree/unist-util-is#isnode-test-index-parent-context
  // test for primitive caml attrs
  const hasAttrbox: boolean = ((selectAll('attrbox', tree) as AttrBoxDataNode[]).length !== 0);
  if (!hasAttrbox) {
    // extract attr data nodes
    const attrDataNodes: AttrBoxDataNode[] = selectAll('attrbox-data', tree) as AttrBoxDataNode[];
    // extract attr data
    const attrData: any = attrDataNodes.reduce((acc: any, node: AttrBoxDataNode) => {
      Object.entries(node.data.items).forEach(([key, value]) => {
        if (acc[key]) {
          acc[key] = acc[key].concat(value);
        } else {
          acc[key] = value;
        }
      });
      return acc;
    }, {});
    // build attrbox and return
    return (Object.keys(attrData).length > 0)
      ? buildWikiAttrBox(attrData, fullOpts)
      : undefined;
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

export function buildWikiAttrBox(
  attrData: any,
  fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs,
): AttrBoxNode | undefined {
  // init
  const attrbox: AttrBoxNode = {
    type: 'attrbox',
    children: [] as (AttrBoxTitleNode | AttrBoxListNode)[],
    data: {
      items: {} as AttrData,
      hName: 'aside',
      hProperties: {
        className: [ fullOpts.cssNames.attrbox ],
      },
    },
  };
  const attrboxTitle: AttrBoxTitleNode = {
    type: 'attrbox-title',
    children: [{
      type: 'text',
      value: fullOpts.attrs.title,
    }],
    data: {
      hName: 'span',
      hProperties: {
        className: [ fullOpts.cssNames.attrboxTitle ]
      },
    }
  };
  const attrBoxListNode: AttrBoxListNode = {
    type: 'attrbox-list',
    children: [] as (AttrKeyNode | AttrValNode)[],
    data: { hName: 'dl' },
  };
  // construct
  attrbox.children.push(attrboxTitle);
  attrbox.children.push(attrBoxListNode);
  // if we have attr items, process them
  if (Object.keys(attrData).length > 0) {
    // copy item data
    attrbox.data.items = { ...attrData };
    // build item hProperties from item data
    for (const [attrtype, items] of Object.entries(attrData)) {
      addWikiAttrKey(attrbox, attrtype, fullOpts);
      for (const item of items as unknown as any) {
        addWikiAttrVal(attrbox, attrtype, item, fullOpts);
      }
    }
  }

  return attrbox;
}

export function addWikiAttrKey(
  attrbox: AttrBoxNode,
  attrtype: string | undefined,
  fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs,
): void {
  const attrType: string | undefined = attrtype ? attrtype : undefined;
  const keyNode: AttrKeyNode = {
    type: 'attr-key',
    children: [{
      type: 'text',
      value: attrType ? attrType : 'attrtype error',
    }],
    data: { hName: 'dt', },
  };
  // add to attrbox-list
  attrbox.children[1].children.push(keyNode);
}

export function addWikiAttrVal(
  attrbox: AttrBoxNode,
  attrtype: string | undefined,
  wikiVal: WikiAttrData,
  fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs,
): void {
  let wikiNode: WikiAttrNode;
  const valNode: AttrValNode = {
    type: 'attr-val',
    children: [],
    data: { hName: 'dd' },
  };
  // invalid
  if (!wikiVal.htmlHref) {
    wikiNode = {
      type: 'wikiattr',
      children: [{
        type: 'text',
        value: wikirefs.CONST.MARKER.OPEN + wikiVal.filename + wikirefs.CONST.MARKER.CLOSE,
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
    };
  // valid
  } else {
    wikiNode = {
      type: 'wikiattr',
      children: [{
        type: 'text',
        value: wikiVal.htmlText ? wikiVal.htmlText : wikiVal.filename,
      }],
      data: {
        hName: 'a',
        hProperties: {
          className: (wikiVal.doctype.length > 0)
          // with doctype
            ? [
              fullOpts.cssNames.attr,
              fullOpts.cssNames.wiki,
              attrtype
                ? fullOpts.cssNames.reftype + attrtype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                : fullOpts.cssNames.reftype + 'attrtype-error',
              fullOpts.cssNames.doctype + wikiVal.doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
            ]
            // without doctype
            : [
              fullOpts.cssNames.attr,
              fullOpts.cssNames.wiki,
              attrtype
                ? fullOpts.cssNames.reftype + attrtype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
                : fullOpts.cssNames.reftype + 'attrtype-error',
            ],
          href: wikiVal.baseUrl + wikiVal.htmlHref,
          dataHref: wikiVal.baseUrl + wikiVal.htmlHref,
        },
      },
    };
  }
  // add wikiattr to attr-val
  valNode.children.push(wikiNode);
  // add to attrbox-list
  attrbox.children[1].children.push(valNode);
}