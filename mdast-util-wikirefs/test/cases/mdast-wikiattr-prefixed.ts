import { attrboxDataNode } from './astNode-attrbox-data';

import { TestCaseMdast } from '../types';


export const mdastWikiAttrPrefixedCases: TestCaseMdast[] = [
  // single
  {
    descr: 'wikiattr; prefixed; single; no opts',
    mkdn: ':attrtype::[[fname-a]]\n',
    node: attrboxDataNode['single'],
    opts: {},
  },
  {
    descr: 'wikiattr; prefixed; single; w/out pad',
    mkdn: ':attrtype::[[fname-a]]\n',
    node: attrboxDataNode['single'],
    opts: {
      attrs: {
        toMarkdown: {
          listKind: 'comma',
          prefixed: true,
        },
      },
    },
  },
  {
    descr: 'wikiattr; prefixed; single; w/ pad',
    mkdn: ': attrtype :: [[fname-a]]\n',
    node: attrboxDataNode['single'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          listKind: 'comma',
          prefixed: true,
        },
      },
    },
  },
  // list; comma-separated
  {
    descr: 'wikiattr; prefixed; list; comma-separated; w/out pad',
    mkdn: ':attrtype::[[fname-a]],[[fname-b]],[[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          prefixed: true,
          listKind: 'comma',
        },
      },
    },
  },
  {
    descr: 'wikiattr; prefixed; list; comma-separated; w/ pad',
    mkdn: ': attrtype :: [[fname-a]], [[fname-b]], [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          prefixed: true,
          listKind: 'comma',
        },
      },
    },
  },
  // list; mkdn-separated
  {
    descr: 'wikiattr; prefixed; list; mkdn-separated; no opts',
    mkdn: ':attrtype::\n- [[fname-a]]\n- [[fname-b]]\n- [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {},
  },
  {
    descr: 'wikiattr; prefixed; list; mkdn-separated; w/out pad',
    mkdn: ':attrtype::\n- [[fname-a]]\n- [[fname-b]]\n- [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          prefixed: true,
          listKind: 'mkdn',
        },
      },
    },
  },
  {
    descr: 'wikiattr; prefixed; list; mkdn-separated; w/ pad',
    mkdn: ': attrtype :: \n- [[fname-a]]\n- [[fname-b]]\n- [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          prefixed: true,
          listKind: 'mkdn',
        },
      },
    },
  },
];
