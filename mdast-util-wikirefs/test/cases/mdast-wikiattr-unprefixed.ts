import { attrboxDataNode } from './astNode-attrbox-data';

import { TestCaseMdast } from '../types';


export const mdastWikiAttrUnprefixedCases: TestCaseMdast[] = [
  // single
  {
    descr: 'wikiattr; unprefixed; single; w/out pad',
    mkdn: 'attrtype::[[fname-a]]\n',
    node: attrboxDataNode['single'],
    opts: {
      attrs: {
        toMarkdown: {
          prefixed: false,
          listKind: 'comma',
        },
      },
    },
  },
  {
    descr: 'wikiattr; unprefixed; single; w/ pad',
    mkdn: 'attrtype :: [[fname-a]]\n',
    node: attrboxDataNode['single'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          listKind: 'comma',
          prefixed: false,
        },
      },
    },
  },
  {
    descr: 'wikiattr; unprefixed; single; padded; w/out pad',
    mkdn: 'attrtype :: [[fname-a]]\n',
    node: attrboxDataNode['single'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          prefixed: false,
          listKind: 'comma',
        },
      },
    },
  },
  // list; comma-separated
  {
    descr: 'wikiattr; unprefixed; list; comma-separated; w/out pad',
    mkdn: 'attrtype::[[fname-a]],[[fname-b]],[[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          prefixed: false,
          listKind: 'comma',
        },
      },
    },
  },
  {
    descr: 'wikiattr; unprefixed; list; comma-separated; w/ pad',
    mkdn: 'attrtype :: [[fname-a]], [[fname-b]], [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          prefixed: false,
          listKind: 'comma',
        },
      },
    },
  },
  // list; mkdn-separated
  {
    descr: 'wikiattr; unprefixed; list; mkdn-separated; no opts',
    mkdn: 'attrtype::\n- [[fname-a]]\n- [[fname-b]]\n- [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          prefixed: false,
        },
      },
    },
  },
  {
    descr: 'wikiattr; unprefixed; list; mkdn-separated; w/out pad',
    mkdn: 'attrtype::\n- [[fname-a]]\n- [[fname-b]]\n- [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          prefixed: false,
          listKind: 'mkdn',
        },
      },
    },
  },
  {
    descr: 'wikiattr; unprefixed; padded; list; mkdn-separated; w/out pad',
    mkdn: 'attrtype :: \n- [[fname-a]]\n- [[fname-b]]\n- [[fname-c]]\n',
    node: attrboxDataNode['list'],
    opts: {
      attrs: {
        toMarkdown: {
          format: 'pad',
          prefixed: false,
          listKind: 'mkdn',
        },
      },
    },
  },
];
