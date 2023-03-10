// from: https://github.com/syntax-tree/mdast-util-gfm-strikethrough/blob/main/index.js#L5
// import type { ToMarkdownExtension } from 'mdast-util-to-markdown';
import { merge } from 'lodash-es';
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown';
import type { DefaultsWikiRefs, WikiRefsOptions } from 'micromark-extension-wikirefs';
import { defaultsWikiRefs } from 'micromark-extension-wikirefs';

import { toMarkdownWikiAttrs } from './toMarkdown-wikiattr';
import { toMarkdownWikiLinks } from './toMarkdown-wikilink';
import { toMarkdownWikiEmbeds } from './toMarkdown-wikiembed';


export function toMarkdownWikiRefs(opts?: Partial<WikiRefsOptions>): ToMarkdownExtension {
  const fullOpts: DefaultsWikiRefs = merge(defaultsWikiRefs(), opts);

  const wikiRefsPlugins: ToMarkdownExtension[] = [] as ToMarkdownExtension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(toMarkdownWikiAttrs(fullOpts as Partial<WikiRefsOptions>));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(toMarkdownWikiLinks(fullOpts as Partial<WikiRefsOptions>));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(toMarkdownWikiEmbeds(fullOpts as Partial<WikiRefsOptions>));
  }
  return { extensions: wikiRefsPlugins };
}
