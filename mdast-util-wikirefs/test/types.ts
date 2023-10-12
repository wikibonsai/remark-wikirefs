import type {
  AttrBoxNode,
  AttrBoxDataNode,
  WikiAttrNode,
  WikiLinkNode,
  WikiEmbedNode,
} from '../src/util/types';


// test cases that describe converting markdown to ast nodes
export interface TestCaseMdast {
  descr: string;    // test description
  error?: boolean;  // test reflects an error state
  opts?: any;       // options
  mkdn: string;     // markdown input
  node:             // ast node
    Partial<AttrBoxDataNode | WikiLinkNode | WikiEmbedNode>
    | {             // base expected properties
      type: string,
      data: any,
    },
}

export interface TestCaseMdastBuilder {
  descr: string;    // test description
  error?: boolean;  // test reflects an error state
  opts?: any;       // options
  inNodes:          // ast nodes
    (Partial<AttrBoxDataNode>
    | {             // base expected properties
      type: string,
      data: any,
    })[],
  outNode:          // ast node
    Partial<AttrBoxNode>
    | {             // base expected properties
      type: string,
      data: any,
    },
}
