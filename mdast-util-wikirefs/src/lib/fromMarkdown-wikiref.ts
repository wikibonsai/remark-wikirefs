import { merge } from 'lodash-es';
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import type { DefaultsWikiRefs, WikiRefsOptions } from 'micromark-extension-wikirefs';
import { defaultsWikiRefs } from 'micromark-extension-wikirefs';

import { fromMarkdownWikiAttrs } from './fromMarkdown-wikiattr';
import { fromMarkdownWikiLinks } from './fromMarkdown-wikilink';
import { fromMarkdownWikiEmbeds } from './fromMarkdown-wikiembed';


export function fromMarkdownWikiRefs(opts?: Partial<WikiRefsOptions>): FromMarkdownExtension[] {
  const fullOpts: DefaultsWikiRefs = merge(defaultsWikiRefs(), opts);

  const wikiRefsPlugins: FromMarkdownExtension[] = [] as FromMarkdownExtension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(fromMarkdownWikiAttrs(fullOpts as Partial<WikiRefsOptions>));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(fromMarkdownWikiLinks(fullOpts as Partial<WikiRefsOptions>));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(fromMarkdownWikiEmbeds(fullOpts as Partial<WikiRefsOptions>));
  }
  return wikiRefsPlugins;
}
