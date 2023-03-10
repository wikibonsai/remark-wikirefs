import { merge } from 'lodash-es';
import type { Extension } from 'micromark-util-types';
import { combineExtensions } from 'micromark-util-combine-extensions';

import type {
  OptAttr,
  OptEmbed,
  OptLink,
  WikiRefsOptions,
} from '../util/types';
import type { DefaultsWikiRefs }  from '../util/defaults';
import { defaultsWikiRefs } from '../util/defaults';
import { syntaxWikiAttrs } from './syntax-wikiattr';
import { syntaxWikiLinks } from './syntax-wikilink';
import { syntaxWikiEmbeds } from './syntax-wikiembed';


export interface ReqSyntaxOpts {
  attrs: Partial<OptAttr>;
  links: Partial<OptLink>;
  embeds: Partial<OptEmbed>;
}

export function syntaxWikiRefs(opts?: Partial<WikiRefsOptions>): Extension {
  const fullOpts: DefaultsWikiRefs = merge(defaultsWikiRefs(), opts);

  const wikiRefsPlugins: Extension[] = [] as Extension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(syntaxWikiAttrs(fullOpts as Partial<WikiRefsOptions>));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(syntaxWikiLinks(fullOpts as Partial<WikiRefsOptions>));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(syntaxWikiEmbeds(fullOpts as Partial<WikiRefsOptions>));
  }
  return combineExtensions(wikiRefsPlugins);
}
