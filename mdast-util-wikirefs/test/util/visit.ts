import * as Uni from 'unist';

import {
  visit,
  Visitor,
  VisitorAction,
} from './patch-visit-util';


/**
 * Visit a specific type of node.
 */
export function visitNodeType<S extends string, N extends Uni.Node & { type: S }>(
  tree: Uni.Node,
  type: S,
  visitor: Visitor<N>
): void {
  // filter nodes by type
  function predicate(node: Uni.Node): node is N {
    return (node.type === type);
  }

  // apply the provided visitor only if type predicate matches
  visit(tree, node => {
    if(predicate(node)) { return visitor(node);          }
    else                { return VisitorAction.CONTINUE; }
  });
}
