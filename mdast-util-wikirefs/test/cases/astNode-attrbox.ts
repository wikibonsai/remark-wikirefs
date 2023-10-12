import type {
  AttrBoxNode,
  AttrBoxListNode,
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
        },
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
    },
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
        },
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
            },
          ],
        },
      ],
    },
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
        },
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-b',
          htmlHref: '/tests/fixtures/fname-b',
          htmlText: 'title b',
          baseUrl: '',
        },
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-c',
          htmlHref: '/tests/fixtures/fname-c',
          htmlText: 'title c',
          baseUrl: '',
        },
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
    },
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
        },
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
            }
          ],
        },
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
            }
          ],
        },
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
            }
          ],
        },
      ],
    } as AttrBoxListNode,
  ]
};

export const attrboxNodeMerged: AttrBoxNode = {
  type: 'attrbox',
  data: {
    items: {
      'attrtype-1': [
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-a',
          htmlHref: '/tests/fixtures/fname-a',
          htmlText: 'title a',
          baseUrl: '',
        },
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-b',
          htmlHref: '/tests/fixtures/fname-b',
          htmlText: 'title b',
          baseUrl: '',
        },
      ],
      'attrtype-2': [
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-c',
          htmlHref: '/tests/fixtures/fname-c',
          htmlText: 'title c',
          baseUrl: '',
        },
      ]
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
    },
    {
      type: 'attrbox-list',
      data: { hName: 'dl' },
      children: [
        {
          type: 'attr-key',
          data: { hName: 'dt' },
          children: [{
            type: 'text',
            value: 'attrtype-1',
          }],
        },
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
                  className: ['attr', 'wiki', 'reftype__attrtype-1'],
                  dataHref: '/tests/fixtures/fname-a',
                  href: '/tests/fixtures/fname-a',
                },
              }
            }
          ],
        },
        {
          type: 'attr-val',
          data: { hName: 'dd' },
          children: [
            {
              type: 'wikiattr',
              data: {
                hName: 'a',
                hProperties: {
                  className: ['attr', 'wiki', 'reftype__attrtype-1'],
                  dataHref: '/tests/fixtures/fname-b',
                  href: '/tests/fixtures/fname-b',
                },
              },
              children: [{
                type: 'text',
                value: 'title b',
              }],
            }
          ],
        },
        {
          type: 'attr-key',
          data: { hName: 'dt' },
          children: [{
            type: 'text',
            value: 'attrtype-2',
          }],
        },
        {
          type: 'attr-val',
          data: { hName: 'dd' },
          children: [
            {
              type: 'wikiattr',
              data: {
                hName: 'a',
                hProperties: {
                  className: ['attr', 'wiki', 'reftype__attrtype-2'],
                  dataHref: '/tests/fixtures/fname-c',
                  href: '/tests/fixtures/fname-c',
                },
              },
              children: [{
                type: 'text',
                value: 'title c',
              }],
            }
          ],
        },
      ],
    } as AttrBoxListNode,
  ]
};

export const attrboxNode = {
  single: attrboxNodeSingle,
  list: attrboxNodeList,
  merged: attrboxNodeMerged,
};
