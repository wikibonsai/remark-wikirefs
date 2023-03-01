// from: https://github.com/syntax-tree/mdast-util-gfm-strikethrough/blob/main/index.js#L3
// import type { FromMarkdownExtension } from 'mdast-util-from-markdown';
import { merge } from 'lodash-es';

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

export function fromMarkdownWikiRefs(this: any, opts?: Partial<WikiRefsOptions>) {
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

  return merge(
    fromMarkdownWikiAttrs(fullOpts),
    fromMarkdownWikiLinks(fullOpts),
    fromMarkdownWikiEmbeds(fullOpts),
  );
  // todo: returning a list of extensions does not seem to be working
  // // todo: FromMarkdownExtension[]
  // const wikiRefsPlugins: any[] = [];
  // if (fullOpts.attrs && fullOpts.attrs.enable) {
  //   wikiRefsPlugins.push(fromMarkdownWikiAttrs(fullOpts));
  // } 
  // if (fullOpts.links && fullOpts.links.enable) {
  //   wikiRefsPlugins.push(fromMarkdownWikiLinks(fullOpts));
  // }
  // if (fullOpts.embeds && fullOpts.embeds.enable) {
  //   wikiRefsPlugins.push(fromMarkdownWikiEmbeds(fullOpts));
  // }
  // return wikiRefsPlugins;
}
