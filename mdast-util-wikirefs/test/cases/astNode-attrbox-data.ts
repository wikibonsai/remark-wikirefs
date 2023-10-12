import type { AttrBoxDataNode } from '../../src/util/types';


export const attrboxDataNodeSingle: AttrBoxDataNode = {
  type: 'attrbox-data',
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
  },
};

export const attrboxDataNodeList: AttrBoxDataNode = {
  type: 'attrbox-data',
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
  },
};

export const attrboxDataNodeMerge1A: AttrBoxDataNode = {
  type: 'attrbox-data',
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
      ],
    },
  },
};

export const attrboxDataNodeMerge1B: AttrBoxDataNode = {
  type: 'attrbox-data',
  data: {
    items: {
      'attrtype-1': [
        {
          type: 'wiki',
          doctype: '',
          filename: 'fname-b',
          htmlHref: '/tests/fixtures/fname-b',
          htmlText: 'title b',
          baseUrl: '',
        },
      ],
    },
  },
};

export const attrboxDataNodeMerge2C: AttrBoxDataNode = {
  type: 'attrbox-data',
  data: {
    items: {
      'attrtype-2': [
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
  },
};


export const attrboxDataNode = {
  single: attrboxDataNodeSingle,
  list: attrboxDataNodeList,
  'merge-1a': attrboxDataNodeMerge1A,
  'merge-1b': attrboxDataNodeMerge1B,
  'merge-2c': attrboxDataNodeMerge2C,
};
