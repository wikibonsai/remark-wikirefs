import { merge } from 'lodash-es';

import type { Extension } from 'micromark-util-types';
import { combineExtensions } from 'micromark-util-combine-extensions';

import type {
  ReqSyntaxOpts,
  OptAttr,
  OptEmbed,
  OptLink,
  WikiRefsOptions,
} from '../util/types';
import { syntaxWikiAttrs } from './syntax-wikiattr';
import { syntaxWikiLinks } from './syntax-wikilink';
import { syntaxWikiEmbeds } from './syntax-wikiembed';


export function syntaxWikiRefs(opts?: Partial<WikiRefsOptions>): Extension {
  // opts
  const defaults: ReqSyntaxOpts = {
    attrs: {
      enable: true,
      render: true,
      title: 'Attributes',
    } as OptAttr,
    links: {
      enable: true,
    } as OptLink,
    embeds: {
      enable: true,
      title: 'Embed Content',
      errorContent: 'Error: Content not found for ',
    } as OptEmbed,
    useCaml: false,
  };
  const fullOpts: ReqSyntaxOpts = merge(defaults, opts);

  const wikiRefsPlugins: Extension[] = [] as Extension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(syntaxWikiAttrs(fullOpts));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(syntaxWikiLinks(fullOpts));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(syntaxWikiEmbeds(fullOpts));
  }
  return combineExtensions(wikiRefsPlugins);
}
