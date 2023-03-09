// from: https://github.com/syntax-tree/mdast-util-gfm-strikethrough/blob/main/index.js#L5
// import type { ToMarkdownExtension } from 'mdast-util-to-markdown';
import { merge } from 'lodash-es';
import type { Options as ToMarkdownExtension } from 'mdast-util-to-markdown';
import { WikiRefsOptions } from 'micromark-extension-wikirefs';

import { toMarkdownWikiAttrs } from './toMarkdown-wikiattr';
import { toMarkdownWikiLinks } from './toMarkdown-wikilink';
import { toMarkdownWikiEmbeds } from './toMarkdown-wikiembed';


interface ReqOpts {
  attrs: {
    enable: boolean,
  },
  links: {
    enable: boolean,
  },
  embeds: {
    enable: boolean,
  },
}

export function toMarkdownWikiRefs(opts?: Partial<WikiRefsOptions>): ToMarkdownExtension {
  // opts
  const defaults: ReqOpts = {
    attrs: {
      enable: true,
    },
    links: {
      enable: true,
    },
    embeds: {
      enable: true,
    }
  };
  const fullOpts: ReqOpts = merge(defaults, opts);

  const wikiRefsPlugins: ToMarkdownExtension[] = [] as ToMarkdownExtension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(toMarkdownWikiAttrs(fullOpts));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(toMarkdownWikiLinks(fullOpts));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(toMarkdownWikiEmbeds(fullOpts));
  }
  return { extensions: wikiRefsPlugins };
}
