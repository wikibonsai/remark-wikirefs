import { linkUntypedNode } from './astNode-wikilink';
import { TestCaseMdast } from '../types';


export const mdastWikiLinkUntypedCases: TestCaseMdast[] = [
  {
    descr: 'wikilink; untyped; base',
    mkdn: '[[fname-a]].',
    node: linkUntypedNode['valid'],
  },
  {
    descr: 'wikilink; untyped; invalid',
    mkdn: '[[no-html-href]].',
    node: linkUntypedNode['invalid'],
  },
  {
    descr: 'wikilink; untyped; labelled',
    mkdn: '[[fname-a|a label]].',
    node: linkUntypedNode['label'],
  },
];