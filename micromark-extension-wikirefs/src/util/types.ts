// options

export interface OptCssNames {
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
  attrbox: string;
  attrboxTitle: string;
  // embed
  embedWrapper: string;
  embedTitle: string;
  embedLink: string;
  linkIcon: string;
  embedContent: string;
  embedLinkIcon: string;
  // media kind
  embedMedia: string;
  embedAudio: string;
  embedDoc: string;
  embedImage: string;
  embedVideo: string;
}

export interface OptAttr {
  enable: boolean;
  render: boolean;
  title: string;
}

export interface OptLink {
  enable: boolean;
  overrideEmbeds: boolean;
}

export interface OptEmbed {
  enable: boolean;
  title: string;
  errorContent: string;
}

// 'mdast-toMarkdown'
export interface OptAttrToMkdn extends OptAttr {
  toMarkdown: Partial<OptToMarkdown>;
}

export interface OptToMarkdown {
  format:  'none' | 'pad';// | 'pretty';   // whitespace formatting type
  listKind:  'comma' | 'mkdn';
  prefixed: boolean;                       // colon ':' prefix before linktype text for attr wikilinks
}

// full options for all remark-wikirefs-related plugins
export interface WikiRefsOptions {
  resolveHtmlHref: (fname: string) => string | undefined;
  resolveHtmlText: (fname: string) => string | undefined;
  resolveDocType?: (fname: string) => string | undefined;
  // embed-only -- micromark returns html string; mdast + remark returns a string or mdast node
  resolveEmbedContent?: (env: any, fname: string) => string | any | undefined;
  baseUrl: string;
  cssNames: Partial<OptCssNames>;
  // wiki kind options
  attrs: Partial<OptAttr | OptAttrToMkdn>;
  links: OptLink;
  embeds: OptEmbed;
  // caml
  useCaml: boolean;
}


// construct data types
// (for html and ast)

export type AttrData = {
  [key: string]: AttrDataItem[];
}

// same in remark-caml
// todo: link
export interface AttrDataItem {
  type: string;
}

export interface WikiAttrData extends AttrDataItem {
  type: 'wiki';
  doctype: string;
  filename: string;
  htmlHref: string;
  htmlText: string;
  baseUrl: string; // this is so remark-caml plugins can rebuild baseUrl + href
}

export type WikiLinkData = {
  doctype: string;
  filename: string;
  // header: string;
  // block: string;
  linktype: string;
  label: string | undefined;
}

export type WikiEmbedData = {
  doctype: string;
  filename: string;
  // media: string;
}
