// from: https://github.com/syntax-tree/mdast-util-to-hast#types
import * as Uni from 'unist';
import type { AttrData, WikiLinkData, WikiEmbedData } from 'micromark-extension-wikirefs';


// a note on duplicate node data:
// 
// it might feel like some data properties commit data duplicatation
// (because they do), but this is intentional.
// 
// the 'item' data property provides the end-user with a more direct means of
// inspecting the shape of the wikiref data, as opposed to sifting through
// html properties (hName, hProperties, hChildren...) to figure it out.

// attrs / wikiattr

export interface AttrBoxNode extends Uni.Parent {
  type: 'attrbox';
  children: (AttrBoxTitleNode | AttrBoxListNode)[];
  data: {
    items: AttrData;
    // rehype properties
    hName: 'aside';
    hProperties: any;
  };
}

export interface AttrBoxTitleNode extends Uni.Parent {
  type: 'attrbox-title';
  children: any[], // text node: https://github.com/syntax-tree/mdast#text
  data: {
    hName: 'span';
    hProperties: any | null;
  };
}

export interface AttrBoxListNode extends Uni.Parent {
  type: 'attrbox-list';
  children: (AttrKeyNode | AttrValNode)[];
  data: {
    hName: 'dl';
  };
}

export interface AttrKeyNode extends Uni.Literal {
  type: 'attr-key';
  children: any[]; // text node: https://github.com/syntax-tree/mdast#text
  data: {
    hName: 'dt';
  }
}

export interface AttrValNode extends Uni.Parent {
  type: 'attr-val';
  children: (WikiAttrNode | any)[]; // ...or caml's 'AttrDataPrimitive' (using 'any' to avoid importing caml)
  data: {
    hName: 'dd';
  }
}

// wikiref nodes

export interface WikiAttrNode extends Uni.Parent {
  type: 'wikiattr';
  children: any[]; // text node: https://github.com/syntax-tree/mdast#text
  data: {
    // 'item' data stored in top-level 'AttrBoxNode'
    hName: 'a';
    hProperties: any | null;
  };
}

// wikilink

export interface WikiLinkNode extends Uni.Parent {
  type: 'wikilink';
  children: any[]; // text node: https://github.com/syntax-tree/mdast#text
  data: {
    item: WikiLinkData;
    hName: 'a';
    hProperties: any | null;
  };
}

// wikiembed

// markdown

// abstract node
export interface WikiEmbedNode extends Uni.Parent {
  type: 'wikiembed',
  children: any[];
  // children: (EmbedMkdnWrapperNode |
  //            EmbedMediaSpanNode)[];
  data: {
    item: WikiEmbedData;
    hName: 'p',
  }
}

export interface EmbedMkdnWrapperNode extends Uni.Parent {
  type: 'embed-mkdn-wrapper',
  children: (EmbedMkdnTitleNode |
             EmbedMkdnLinkNode |
             EmbedMkdnContentNode)[];
  data: {
    // rehype properties
    hName: 'div',
    hProperties: any | null;
  }
}

export interface EmbedMkdnTitleNode extends Uni.Parent {
  type: 'embed-mkdn-title',
  children: any[]; // <a>
  data: {
    hName: 'div',
    hProperties: any | null;
  }
}

export interface EmbedMkdnLinkNode extends Uni.Parent {
  type: 'embed-mkdn-link';
  children: any[];  // <a>
  data: {
    hName: 'div',
    hProperties: any; // <a>
  };
}

export interface EmbedMkdnContentNode extends Uni.Parent {
  type: 'embed-mkdn-content',
  children: any[], // embed content...
  data: {
    hName: 'div',
    hProperties: any | null;
  },
}

// media

export interface EmbedMediaSpanNode extends Uni.Parent {
  type: 'embed-media-span',
  children: (EmbedMediaAudioNode |
             EmbedMediaImageNode |
             EmbedMediaVideoNode)[];
  data: {
    // rehype properties
    hName: 'span',
    hProperties: any | null;
  }
}

export interface EmbedMediaAudioNode extends Uni.Parent {
  type: 'embed-media-audio',
  data: {
    hName: 'audio',
    hProperties: any | null;
  }
}

export interface EmbedMediaImageNode extends Uni.Parent {
  type: 'embed-media-image',
  data: {
    hName: 'img',
    hProperties: any | null;
  }
}

export interface EmbedMediaVideoNode extends Uni.Parent {
  type: 'embed-media-video',
  data: {
    hName: 'video',
    hProperties: any | null;
  }
}