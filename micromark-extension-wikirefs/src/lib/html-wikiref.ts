import path from 'path';
import { merge } from 'lodash-es';
import { combineHtmlExtensions } from 'micromark-util-combine-extensions';
import type { HtmlExtension } from 'micromark-util-types';
import * as wikirefs from 'wikirefs';
import type {
  ReqHtmlOpts,
  OptAttr,
  OptCssNames,
  OptEmbed,
  OptLink,
  WikiRefsOptions,
} from '../util/types';
import { htmlWikiAttrs } from './html-wikiattr';
import { htmlWikiLinks } from './html-wikilink';
import { htmlWikiEmbeds } from './html-wikiembed';


export function htmlWikiRefs(this: any, opts: Partial<WikiRefsOptions> = {}): HtmlExtension {
  // opts
  const defaults: ReqHtmlOpts = {
    resolveHtmlText: (fname: string) => fname.replace(/-/g, ' '),
    resolveHtmlHref: (fname: string) => {
      const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
      fname = fname.replace(extname, '');
      return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
    },
    resolveEmbedContent: (fname: string) => fname + ' embed content',
    baseUrl: '',
    cssNames: {
      // wiki
      wiki: 'wiki',
      invalid: 'invalid',
      // kinds
      attr: 'attr',
      link: 'link',
      type: 'type',
      embed: 'embed',
      reftype: 'reftype__',
      doctype: 'doctype__',
      // attr
      attrbox: 'attrbox',
      attrboxTitle: 'attrbox-title',
      // embed
      embedWrapper: 'embed-wrapper',
      embedTitle: 'embed-title',
      embedLink: 'embed-link',
      embedContent: 'embed-content',
      embedLinkIcon: 'embed-link-icon',
      linkIcon: 'link-icon',
      embedMedia: 'embed-media',
      embedAudio: 'embed-audio',
      embedDoc: 'embed-doc',
      embedImage: 'embed-image',
      embedVideo: 'embed-video',
    } as OptCssNames,
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
  const fullOpts: ReqHtmlOpts = merge(defaults, opts);

  const wikiRefsPlugins: HtmlExtension[] = [] as HtmlExtension[];
  if (fullOpts.attrs && fullOpts.attrs.enable) {
    wikiRefsPlugins.push(htmlWikiAttrs(fullOpts));
  } 
  if (fullOpts.links && fullOpts.links.enable) {
    wikiRefsPlugins.push(htmlWikiLinks(fullOpts));
  }
  if (fullOpts.embeds && fullOpts.embeds.enable) {
    wikiRefsPlugins.push(htmlWikiEmbeds(fullOpts));
  }
  return combineHtmlExtensions(wikiRefsPlugins);
}
