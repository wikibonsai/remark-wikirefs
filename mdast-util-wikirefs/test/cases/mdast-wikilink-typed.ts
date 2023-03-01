import { linkTypedNode } from './astNode-wikilink';
import { TestCaseMdast } from '../types';


export const mdastWikiLinkTypedCases: TestCaseMdast[] = [
  {
    descr: 'wikilink; typed; base',
    mkdn: ':linktype::[[fname-a]].',
    node: linkTypedNode['valid'],
  },
  {
    descr: 'wikilink; typed; invalid',
    mkdn: ':linktype::[[no-html-href]].',
    node: linkTypedNode['invalid'],
  },
  {
    descr: 'wikilink; typed; labelled',
    mkdn: ':linktype::[[fname-a|a label]].',
    node: linkTypedNode['label'],
  },
];