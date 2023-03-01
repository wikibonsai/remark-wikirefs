import type { WikiAttrNode, WikiLinkNode, WikiEmbedNode } from '../src/util/types';


// test cases that describe converting markdown to ast nodes
export interface TestCaseMdast {
  descr: string;    // test description
  error?: boolean;  // test reflects an error state
  opts?: any;       // options
  mkdn: string;     // markdown input
  node:             // ast node
    Partial<WikiAttrNode | WikiLinkNode | WikiEmbedNode>
    | {             // base expected properties
      type: string,
      data: any,
    },
}
