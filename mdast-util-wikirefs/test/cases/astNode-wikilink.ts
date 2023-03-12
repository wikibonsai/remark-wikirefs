import type { WikiLinkNode } from '../../src/util/types';


// untyped

export function validNode(linktype: string = ''): WikiLinkNode {
  return {
    type: 'wikilink',
    children: [{
      type: 'text',
      value: 'title a',
    }],
    data: {
      item: {
        filename: 'fname-a',
        doctype: '',
        label: '',
        linktype: linktype,
      },
      hName: 'a',
      hProperties: {
        className: (linktype === '')
          ? ['wiki', 'link']
          : ['wiki', 'link', 'type', 'reftype__' + linktype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')],
        dataHref: '/tests/fixtures/fname-a',
        href: '/tests/fixtures/fname-a',
      },
    }
  };
}

export function invalidNode(linktype: string = ''): WikiLinkNode {
  return {
    type: 'wikilink',
    children: [{
      type: 'text',
      value: (linktype === '') ? '[[no-html-href]]' : ':linktype::[[no-html-href]]',
    }],
    data: {
      item: {
        filename: 'no-html-href',
        doctype: '',
        label: '',
        linktype: linktype,
      },
      hName: 'a',
      hProperties: {
        className: ['wiki', 'link', 'invalid'],
      },
    }
  };
}


export function labelNode(linktype: string = ''): WikiLinkNode {
  return {
    type: 'wikilink',
    children: [{
      type: 'text',
      value: 'a label',
    }],
    data: {
      item: {
        filename: 'fname-a',
        doctype: '',
        label: 'a label',
        linktype: linktype,
      },
      hName: 'a',
      hProperties: {
        className: (linktype === '')
          ? ['wiki', 'link']
          : ['wiki', 'link', 'type', 'reftype__' + linktype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')],
        dataHref: '/tests/fixtures/fname-a',
        href: '/tests/fixtures/fname-a',
      },
    }
  };
}

export const linkUntypedNode = {
  valid: validNode(),
  invalid: invalidNode(),
  label: labelNode(),
};

export const linkTypedNode = {
  valid: validNode('linktype'),
  invalid: invalidNode('linktype'),
  label: labelNode('linktype'),
};
