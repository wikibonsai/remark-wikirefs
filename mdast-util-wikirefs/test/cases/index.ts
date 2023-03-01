// import

import type { TestCaseMdast } from '../types';

import { mdastWikiAttrUnprefixedCases } from './mdast-wikiattr-unprefixed';
import { mdastWikiAttrPrefixedCases } from './mdast-wikiattr-prefixed';
import { mdastWikiLinkTypedCases } from './mdast-wikilink-typed';
import { mdastWikiLinkUntypedCases } from './mdast-wikilink-untyped';
import { mdastWikiEmbedCases } from './mdast-wikiembed';

/* eslint-disable indent */
const mdastWikiAttrCases : TestCaseMdast[] = ([] as TestCaseMdast[]).concat(mdastWikiAttrUnprefixedCases)
                                                                    .concat(mdastWikiAttrPrefixedCases);
const mdastWikiLinkCases : TestCaseMdast[] = ([] as TestCaseMdast[]).concat(mdastWikiLinkTypedCases)
                                                                    .concat(mdastWikiLinkUntypedCases);
const mdastCases         : TestCaseMdast[] = ([] as TestCaseMdast[]).concat(mdastWikiAttrCases)
                                                                    .concat(mdastWikiLinkCases)
                                                                    .concat(mdastWikiEmbedCases);
/* eslint-enable indent */

// export

export { mdastWikiAttrUnprefixedCases } from './mdast-wikiattr-unprefixed';
export { mdastWikiAttrPrefixedCases } from './mdast-wikiattr-prefixed';
export { mdastWikiLinkTypedCases } from './mdast-wikilink-typed';
export { mdastWikiLinkUntypedCases } from './mdast-wikilink-untyped';

export { mdastCases, mdastWikiAttrCases, mdastWikiLinkCases, mdastWikiEmbedCases };
