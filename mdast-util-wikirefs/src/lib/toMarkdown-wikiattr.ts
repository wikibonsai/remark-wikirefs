import { merge } from 'lodash-es';
import * as Uni from 'unist';
import type { Context, Handle, SafeOptions } from 'mdast-util-to-markdown';
import { safe } from 'mdast-util-to-markdown/lib/util/safe.js';

import * as wikirefs from 'wikirefs';

import type {
  OptToMarkdown,
  WikiAttrData,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';

import type { AttrBoxNode } from '../util/types';


// required options
interface ReqOpts {
  attrs: {
    enable: boolean;
    toMarkdown: OptToMarkdown;
  };
}

export function toMarkdownWikiAttrs(this: any, opts: Partial<WikiRefsOptions> = {}) {
  // opts
  const defaults: ReqOpts = {
    attrs: {
      enable: true,
      toMarkdown: {
        format: 'none',
        listKind: 'mkdn',
        prefixed: true,
      } as OptToMarkdown,
    },
  };
  const fullOpts: ReqOpts = merge(defaults, opts);

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
      attrbox: handler as Handle,
    }
  };

  function handler(
    node: AttrBoxNode,
    _: Uni.Parent | null | undefined,
    context: Context,
  ): string {
    const exit = context.enter('attrbox');

    // 'defaults' ensure 'fullOpts.attrs' will be populated above
    const format: string = fullOpts.attrs.toMarkdown.format;
    const listKind: string = fullOpts.attrs.toMarkdown.listKind;
    const prefixed: boolean = fullOpts.attrs.toMarkdown.prefixed;

    // init vars / build string value
    let value: string = '';

    for (const [attrtype, items] of Object.entries(node.data.items)) {
      // attrtype / key
      /* eslint-disable indent */
      const nodeAttrType: string = safe(
                                          context,
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
      for (let i = 0; i < items.length; i++) {
        const isLastItem: boolean = (i === (items.length - 1));
        /* eslint-disable indent */
        const nodeFileName: string = safe(
                                            context,
                                            (<WikiAttrData> items[i]).filename,
                                            { before: '[', after: ']' } as SafeOptions,
                                          );
        /* eslint-enable indent */
        // single item or list comma-separated
        if ((items.length === 1) || (listKind === 'comma')) {
          value += (wikirefs.CONST.MARKER.OPEN + nodeFileName + wikirefs.CONST.MARKER.CLOSE);
          if (!isLastItem) {
            value += ',';
            if (format === 'pad') { value += ' '; }
          }
        }
        // multiple items, list mkdn-separated
        if ((items.length > 1) && listKind === 'mkdn') {
          value += ('\n' + '- ' + wikirefs.CONST.MARKER.OPEN + nodeFileName + wikirefs.CONST.MARKER.CLOSE);
        }
        // add last newline after last item
        if (isLastItem) {
          value += '\n';
        }
      }
    }

    exit();
    return value;
  }
}
