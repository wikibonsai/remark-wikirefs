import { merge } from 'lodash-es';
import { combineHtmlExtensions } from 'micromark-util-combine-extensions';
import type { HtmlExtension } from 'micromark-util-types';

import type { WikiRefsOptions } from '../util/types';
import type { DefaultsWikiRefs }  from '../util/defaults';
import { defaultsWikiRefs } from '../util/defaults';
import { htmlWikiAttrs } from './html-wikiattr';
import { htmlWikiLinks } from './html-wikilink';
import { htmlWikiEmbeds } from './html-wikiembed';


export function htmlWikiRefs(opts: Partial<WikiRefsOptions> = {}): HtmlExtension {
  const fullOpts: DefaultsWikiRefs = merge(defaultsWikiRefs(), opts);

  const wikiRefsPlugins: HtmlExtension[] = [] as HtmlExtension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(htmlWikiAttrs(fullOpts as Partial<WikiRefsOptions>));
  }
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(htmlWikiLinks(fullOpts as Partial<WikiRefsOptions>));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(htmlWikiEmbeds(fullOpts as Partial<WikiRefsOptions>));
  }
  return combineHtmlExtensions(wikiRefsPlugins);
}
