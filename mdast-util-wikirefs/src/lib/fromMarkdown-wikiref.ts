import { merge } from 'lodash-es';
import type { Extension as FromMarkdownExtension } from 'mdast-util-from-markdown';
import { WikiRefsOptions } from 'micromark-extension-wikirefs';

import { fromMarkdownWikiAttrs } from './fromMarkdown-wikiattr';
import { fromMarkdownWikiLinks } from './fromMarkdown-wikilink';
import { fromMarkdownWikiEmbeds } from './fromMarkdown-wikiembed';


interface ReqOpts {
  attrs: {
    enable: boolean;
  };
  links: {
    enable: boolean;
  };
  embeds: {
    enable: boolean;
  }
}

export function fromMarkdownWikiRefs(opts?: Partial<WikiRefsOptions>): FromMarkdownExtension[] {
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
    },
  };
  const fullOpts: ReqOpts = merge(defaults, opts);

  const wikiRefsPlugins: FromMarkdownExtension[] = [] as FromMarkdownExtension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(fromMarkdownWikiAttrs(fullOpts));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(fromMarkdownWikiLinks(fullOpts));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(fromMarkdownWikiEmbeds(fullOpts));
  }
  return wikiRefsPlugins;
}
