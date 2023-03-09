import * as Uni from 'unist';
import type {
  ConstructName,
  Context,
  Handle,
  Handlers,
  SafeOptions,
  Options as ToMarkdownExtension,
} from 'mdast-util-to-markdown';
import { safe } from 'mdast-util-to-markdown/lib/util/safe.js';

import * as wikirefs from 'wikirefs';

import type { WikiRefsOptions } from 'micromark-extension-wikirefs';

import type { WikiEmbedNode } from '../util/types';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function toMarkdownWikiEmbeds (opts?: Partial<WikiRefsOptions>): ToMarkdownExtension {

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
      wikiembed: handler as Handle,
    } as Partial<Handlers>,
  };

  function handler(
    node: WikiEmbedNode,
    _: Uni.Parent | null | undefined,
    context: Context,
  ): string {
    const exit = context.enter('embed-mkdn-wrapper' as ConstructName);
    // init vars
    /* eslint-disable indent */
    const nodeFileName: string = safe(
                                        context,
                                        node.data.item.filename,
                                        { before: '[', after: ']' } as SafeOptions,
                                     );
    /* eslint-enable indent */
    exit();
    return wikirefs.CONST.MARKER.EMBED + wikirefs.CONST.MARKER.OPEN + nodeFileName + wikirefs.CONST.MARKER.CLOSE;
  }
}
