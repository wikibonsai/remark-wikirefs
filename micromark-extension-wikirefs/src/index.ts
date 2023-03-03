// syntax

export { syntaxWikiAttrs } from './lib/syntax-wikiattr';
export { syntaxWikiLinks } from './lib/syntax-wikilink';
export { syntaxWikiEmbeds } from './lib/syntax-wikiembed';
export { syntaxWikiRefs } from './lib/syntax-wikiref';

// html

export { htmlWikiAttrs } from './lib/html-wikiattr';
export { htmlWikiLinks } from './lib/html-wikilink';
export { htmlWikiEmbeds } from './lib/html-wikiembed';
export { htmlWikiRefs } from './lib/html-wikiref';

/**********************************************/
/*** !!! types need to be exported last !!! ***/
/**********************************************/
// ...because 'type' will be applied to other exports otherwise
// (not sure why...)

export * from './util/types';
