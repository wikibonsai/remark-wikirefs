import type {
  Handlers,
  Options as ToMarkdownExtension,
} from 'mdast-util-to-markdown';
import type { ConstructName, Context, Handle, SafeOptions } from 'mdast-util-to-markdown';
import type {
  DefaultsWikiRefs,
  DefaultsWikiAttrs,
  WikiAttrData,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';
import type { AttrBoxDataNode, AttrBoxNode } from '../util/types';

import { merge } from 'lodash-es';
import * as wikirefs from 'wikirefs';
import * as Uni from 'unist';
import { safe } from 'mdast-util-to-markdown/lib/util/safe.js';
import { defaultsWikiRefs, defaultsWikiAttrs } from 'micromark-extension-wikirefs';


export function toMarkdownWikiAttrs(opts: Partial<WikiRefsOptions> = {}): ToMarkdownExtension {
  const fullOpts: DefaultsWikiRefs & DefaultsWikiAttrs = merge(defaultsWikiRefs(), defaultsWikiAttrs(), opts);
  // 'defaults' ensure 'fullOpts.attrs' will be populated above
  const format: string = fullOpts.attrs.toMarkdown.format;
  const listKind: string = fullOpts.attrs.toMarkdown.listKind;
  const prefixed: boolean = fullOpts.attrs.toMarkdown.prefixed;

  // let attrboxFound: boolean = false;

  return {
    // TODO: I don't fully understand what this does, but I did my
    // best to fill it in based on what I saw in other mdast utils
    // (e.g. https://github.com/syntax-tree/mdast-util-math/blob/main/index.js#L135)
    unsafe: [{
      character: '[',
      inConstruct: ['phrasing', 'label', 'reference'],
    }, {
      character: ']',
      inConstruct: ['label', 'reference'],
    }],
    handlers: {
      // as of (2021-05-07), the typings for Handle do not reflect
      // that the handler will be passed nodes of a specific type

      // note: name should match 'Node.type'
      // attrbox: handleNode as Handle,
      // note: 'case-conversion' <-> caseConversion seems to not be working...
      'attrbox-data': handleData as Handle,
      attrboxData: handleData as Handle,
    } as Partial<Handlers>,
  };

  // note: this handler will generate markdown from the in-place data
  function handleData(
    node: (AttrBoxDataNode),
    _: Uni.Parent | null | undefined,
    context: Context,
  ): string {
    const exit = context.enter('attrbox-data' as ConstructName);
    const value: string = buildMkdn(node.data.items, context);
    // const value: string = (!attrboxFound) ? buildMkdn(node.data.items, context) : '';
    exit();
    return value;
  }

  // note: this handler will generate markdown from the content's top-level attrbox
  // function handleNode(
  //   node: (AttrBoxNode),
  //   _: Uni.Parent | null | undefined,
  //   context: Context,
  // ): string {
  //   attrboxFound = true;

  //   const exit = context.enter('attrbox' as ConstructName);
  //   const value: string = buildMkdn(node.data.items, context);

  //   exit();
  //   return value;
  // }

  function buildMkdn(wikiattrs: any, context: Context): string {
    // init vars / build string value
    let value: string = '';

    for (const [attrtype, wikiattr] of Object.entries(wikiattrs)) {
      const wikiAttrPayLoad: WikiAttrData[] = wikiattr as WikiAttrData[];
      // attrtype / key
      /* eslint-disable indent */
      const nodeAttrType: string = safe(
                                          context, // todo: 'context' -> 'state' (see: https://github.com/syntax-tree/mdast-util-to-markdown/commit/e812c7954f8b8ea5dd68476c856cbfd7cc4c442b)
                                          attrtype,
                                          { before: ':', after: ':' } as SafeOptions,
                                        );
      /* eslint-enable indent */
      if (nodeAttrType) {
        if (prefixed) {
          value += wikirefs.CONST.MARKER.PREFIX;
          if (format === 'pad') { value += ' '; }
        }
        value += nodeAttrType;
        if (format === 'pad') { value += ' '; }
        value += wikirefs.CONST.MARKER.TYPE;
        if (format === 'pad') { value += ' '; }
      }
      // filenames / items / values
      for (let i = 0; i < wikiAttrPayLoad.length; i++) {
        const isLastItem: boolean = (i === (wikiAttrPayLoad.length - 1));
        /* eslint-disable indent */
        const nodeFileName: string = safe(
                                            context,
                                            wikiAttrPayLoad[i].filename,
                                            { before: '[', after: ']' } as SafeOptions,
                                          );
        /* eslint-enable indent */
        // single item or list comma-separated
        if ((wikiAttrPayLoad.length === 1) || (listKind === 'comma')) {
          value += (wikirefs.CONST.MARKER.OPEN + nodeFileName + wikirefs.CONST.MARKER.CLOSE);
          if (!isLastItem) {
            value += ',';
            if (format === 'pad') { value += ' '; }
          }
        }
        // multiple items, list mkdn-separated
        if ((wikiAttrPayLoad.length > 1) && listKind === 'mkdn') {
          value += ('\n' + '- ' + wikirefs.CONST.MARKER.OPEN + nodeFileName + wikirefs.CONST.MARKER.CLOSE);
        }
        // add last newline after last item
        if (isLastItem) {
          value += '\n';
        }
      }
    }
    return value;
  }
}
