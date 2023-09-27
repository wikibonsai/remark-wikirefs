/*
 * these are option defaults for the remark-wikirefs plugins.
 * they apply to html plugins and mdast plugins.
 * 
 * syntax plugins retain their own local defaults since they
 * either have none or are so scant.
 */
import path from 'path';
import * as wikirefs from 'wikirefs';


// default resolvers

export function resolveHtmlText(fname: string) {
  return fname.replace(/-/g, ' ');
}

export function resolveHtmlHref(fname: string) {
  const extname: string = wikirefs.isMedia(fname) ? path.extname(fname) : '';
  fname = fname.replace(extname, '');
  return '/' + fname.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + extname;
}

export function resolveEmbedContent(fname: string) {
  return fname + ' embed content';
}

// default option types and objects

export interface DefaultsWikiRefs {
  resolveHtmlText: (fname: string) => string;
  resolveHtmlHref: (fname: string) => string;
  resolveDocType?: (fname: string) => string;
  baseUrl: string;
  cssNames: {
    // wiki
    wiki: string;
    invalid: string;
    // types
    doctype: string;
  };
  attrs: {
    enable: boolean;
  },
  links: {
    enable: boolean;
  },
  embeds: {
    enable: boolean;
  },
}

export function defaultsWikiRefs(): DefaultsWikiRefs {
  return {
    resolveHtmlHref: resolveHtmlHref,
    resolveHtmlText: resolveHtmlText,
    baseUrl: '',
    cssNames: {
      // wiki
      wiki: 'wiki',
      invalid: 'invalid',
      // types
      doctype: 'doctype__',
    },
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
}

export interface DefaultsWikiAttrs {
  cssNames: {
    // kinds
    attr: string;
    // types
    reftype: string;
    // attr
    attrbox: string;
    attrboxTitle: string;
  };
  attrs: {
    enable: boolean;
    render: boolean;
    title: string;
    toMarkdown: {
      format: string;
      listKind: string;
      prefixed: boolean;
    }
  },
}

export function defaultsWikiAttrs(): DefaultsWikiAttrs {
  return {
    cssNames: {
      // kinds
      attr: 'attr',
      // types
      reftype: 'reftype__',
      // attr
      attrbox: 'attrbox',
      attrboxTitle: 'attrbox-title',
    },
    attrs: {
      enable: true,
      render: true,
      title: 'Attributes',
      toMarkdown: {
        format: 'none',
        listKind: 'mkdn',
        prefixed: true,
      }
    },
  };
}

export interface DefaultsWikiLinks {
  cssNames: {
    // kinds
    link: string;
    // types
    type: string;
    reftype: string;
    // attr
    attrbox: string;
    attrboxTitle: string;
  };
  links: {
    enable: boolean;
    overrideEmbeds: boolean;
  };
}

export function defaultsWikiLinks(): DefaultsWikiLinks {
  return {
    cssNames: {
      // kinds
      link: 'link',
      // types
      type: 'type',
      reftype: 'reftype__',
      // attr
      attrbox: 'attrbox',
      attrboxTitle: 'attrbox-title',
    },
    links: {
      enable: true,
      overrideEmbeds: false,
    },
  };
}

export interface DefaultsWikiEmbeds {
  resolveEmbedContent: (fname: string) => string;
  cssNames: {
    // kinds
    embed: string;
    // embed
    embedWrapper: string;
    embedTitle: string;
    embedLink: string;
    embedContent: string;
    embedLinkIcon: string;
    linkIcon: string;
    embedMedia: string;
    embedAudio: string;
    embedDoc: string;
    embedImage: string;
    embedVideo: string;
  };
  embeds: {
    enable: boolean;
    title: string;
    errorContent: string;
  },
}

export function defaultsWikiEmbeds(): DefaultsWikiEmbeds {
  return {
    resolveEmbedContent: resolveEmbedContent,
    cssNames: {
      // kinds
      embed: 'embed',
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
    },
    embeds: {
      enable: true,
      title: 'Embed Content',
      errorContent: 'Error: Content not found for ',
    },
  };
}
