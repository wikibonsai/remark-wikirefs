import type { WikiAttrData } from 'micromark-extension-wikirefs';
import type {
  AttrBoxNode,
  AttrBoxTitleNode,
  AttrBoxListNode,
  AttrKeyNode,
  AttrValNode,
  WikiAttrNode,
} from '../../src/util/types';


export const attrboxNodeSingle: AttrBoxNode = {
  type: 'attrbox',
  data: {
    items: {
      'attrtype': [
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-a',
          htmlHref: '/tests/fixtures/fname-a',
          htmlText: 'title a',
          baseUrl: '',
        } as WikiAttrData
      ],
    },
    hName: 'aside',
    hProperties: {
      className: ['attrbox'],
    },
  },
  children: [
    {
      type: 'attrbox-title',
      data: {
        hName: 'span',
        hProperties: {
          className: ['attrbox-title'],
        },
      },
      children: [{
        type: 'text',
        value: 'Attributes',
      }],
    } as AttrBoxTitleNode,
    {
      type: 'attrbox-list',
      data: { hName: 'dl' },
      children: [
        {
          type: 'attr-key',
          data: { hName: 'dt' },
          children: [{
            type: 'text',
            value: 'attrtype',
          }],
        } as AttrKeyNode,
        {
          type: 'attr-val',
          data: { hName: 'dd' },
          children: [
            {
              type: 'wikiattr',
              children: [{
                type: 'text',
                value: 'title a',
              }],
              data: {
                hName: 'a',
                hProperties: {
                  className: ['attr', 'wiki', 'reftype__attrtype'],
                  dataHref: '/tests/fixtures/fname-a',
                  href: '/tests/fixtures/fname-a',
                },
              }
            } as WikiAttrNode,
          ],
        } as AttrValNode,
      ],
    } as AttrBoxListNode,
  ],
};

export const attrboxNodeList: AttrBoxNode = {
  type: 'attrbox',
  data: {
    items: {
      'attrtype': [
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-a',
          htmlHref: '/tests/fixtures/fname-a',
          htmlText: 'title a',
          baseUrl: '',
        } as WikiAttrData,
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-b',
          htmlHref: '/tests/fixtures/fname-b',
          htmlText: 'title b',
          baseUrl: '',
        } as WikiAttrData,
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-c',
          htmlHref: '/tests/fixtures/fname-c',
          htmlText: 'title c',
          baseUrl: '',
        } as WikiAttrData,
      ],
    },
    hName: 'aside',
    hProperties: {
      className: ['attrbox'],
    },
  },
  children: [
    {
      type: 'attrbox-title',
      data: {
        hName: 'span',
        hProperties: {
          className: ['attrbox-title'],
        },
      },
      children: [{
        type: 'text',
        value: 'Attributes',
      }]
    } as AttrBoxTitleNode,
    {
      type: 'attrbox-list',
      data: { hName: 'dl' },
      children: [
        {
          type: 'attr-key',
          data: { hName: 'dt' },
          children: [{
            type: 'text',
            value: 'attrtype',
          }],
        } as AttrKeyNode,
        {
          type: 'attr-val',
          data: { hName: 'dd' },
          children: [
            {
              type: 'wikiattr',
              children: [{
                type: 'text',
                value: 'title a',
              }],
              data: {
                hName: 'a',
                hProperties: {
                  className: ['attr', 'wiki', 'reftype__attrtype'],
                  dataHref: '/tests/fixtures/fname-a',
                  href: '/tests/fixtures/fname-a',
                },
              }
            } as WikiAttrNode
          ],
        } as AttrValNode,
        {
          type: 'attr-val',
          data: { hName: 'dd' },
          children: [
            {
              type: 'wikiattr',
              data: {
                hName: 'a',
                hProperties: {
                  className: ['attr', 'wiki', 'reftype__attrtype'],
                  dataHref: '/tests/fixtures/fname-b',
                  href: '/tests/fixtures/fname-b',
                },
              },
              children: [{
                type: 'text',
                value: 'title b',
              }],
            } as WikiAttrNode
          ],
        } as AttrValNode,
        {
          type: 'attr-val',
          data: { hName: 'dd' },
          children: [
            {
              type: 'wikiattr',
              data: {
                hName: 'a',
                hProperties: {
                  className: ['attr', 'wiki', 'reftype__attrtype'],
                  dataHref: '/tests/fixtures/fname-c',
                  href: '/tests/fixtures/fname-c',
                },
              },
              children: [{
                type: 'text',
                value: 'title c',
              }],
            } as WikiAttrNode
          ],
        } as AttrValNode,
      ],
    } as AttrBoxListNode,
  ]
};

export const attrNode = {
  single: attrboxNodeSingle,
  list: attrboxNodeList,
};
