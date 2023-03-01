import * as Uni from 'unist';
import type { Context, Handle, SafeOptions } from 'mdast-util-to-markdown';
import { safe } from 'mdast-util-to-markdown/lib/util/safe.js';

import * as wikirefs from 'wikirefs';

import type { WikiRefsOptions } from 'micromark-extension-wikirefs';

import type { WikiLinkNode } from '../util/types';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toMarkdownWikiLinks (this: any, opts?: Partial<WikiRefsOptions>) {

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
      wikilink: handler as Handle,
    }
  };

  function handler(
    node: WikiLinkNode,
    _: Uni.Parent | null | undefined,
    context: Context,
  ): string {
    const exit = context.enter('wikilink');
    // init vars
    /* eslint-disable indent */
    const nodeFileName: string = safe(
                                        context,
                                        node.data.item.filename,
                                        { before: '[', after: ']' } as SafeOptions,
                                     );
    const nodeLinkType: string = safe(
                                        context,
                                        node.data.item.linktype,
                                        { before: ':', after: ':' } as SafeOptions,
                                     );
    const nodeLabel: string | undefined = (node.data.item.label && node.data.item.label !== '')
                                            ? safe(
                                                    context,
                                                    node.data.item.label,
                                                    { before: '|', after: ']' } as SafeOptions,
                                                   )
                                            : undefined;
    /* eslint-enable indent */
    // build string value
    let value: string = '';
    if (nodeLinkType) {
      value += (wikirefs.CONST.MARKER.PREFIX + nodeLinkType + wikirefs.CONST.MARKER.TYPE);
    }
    value += (wikirefs.CONST.MARKER.OPEN + nodeFileName);
    if (nodeLabel) {
      value += wikirefs.CONST.MARKER.LABEL + nodeLabel;
    }
    value += wikirefs.CONST.MARKER.CLOSE;
    exit();
    return value;
  }
}
