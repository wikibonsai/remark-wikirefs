// some useful references:
// mdast-util-to-hast: https://github.com/syntax-tree/mdast-util-to-hast
// mdast             : https://github.com/syntax-tree/mdast
// hast              : https://github.com/syntax-tree/hast

// buildMarkdown

export {
  // addWikiAttrVal, // mainly for use in caml plugin
  initWikiAttrBox,
} from './lib/attrbox';

// fromMarkdown

export { fromMarkdownWikiAttrs } from './lib/fromMarkdown-wikiattr';
export { fromMarkdownWikiLinks } from './lib/fromMarkdown-wikilink';
export { fromMarkdownWikiEmbeds } from './lib/fromMarkdown-wikiembed';
export { fromMarkdownWikiRefs } from './lib/fromMarkdown-wikiref';

// toMarkdown

export { toMarkdownWikiAttrs } from './lib/toMarkdown-wikiattr';
export { toMarkdownWikiLinks } from './lib/toMarkdown-wikilink';
export { toMarkdownWikiEmbeds } from './lib/toMarkdown-wikiembed';
export { toMarkdownWikiRefs } from './lib/toMarkdown-wikiref';

// test

export { visitNodeType } from '../test/util/visit';

/**********************************************/
/*** !!! types need to be exported last !!! ***/
/**********************************************/
// ...because 'type' will be applied to other exports otherwise
// (not sure why...)

export * from './util/types';
