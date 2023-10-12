import type * as Uni from 'unist';
import type { Processor, Transformer } from 'unified';
import type { AttrBoxNode } from 'mdast-util-wikirefs';
import {
  syntaxWikiRefs,
  syntaxWikiAttrs,
  syntaxWikiLinks,
  syntaxWikiEmbeds,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';
import {
  initWikiAttrBox,
  fromMarkdownWikiRefs,
  toMarkdownWikiRefs,
  fromMarkdownWikiAttrs,
  toMarkdownWikiAttrs,
  fromMarkdownWikiLinks,
  toMarkdownWikiLinks,
  fromMarkdownWikiEmbeds,
  toMarkdownWikiEmbeds,
} from 'mdast-util-wikirefs';

import { remarkV13Warning } from './warn';


export function remarkWikiRefs(this: Processor, opts?: Partial<WikiRefsOptions>): Transformer<Uni.Parent, Uni.Node> {
  const doRenderAttrBox: boolean = opts?.attrs?.render ?? true;
  const data: any = this.data();

  // warn for earlier versions
  remarkV13Warning(this);

  add('micromarkExtensions', syntaxWikiRefs(opts));
  add('fromMarkdownExtensions', fromMarkdownWikiRefs(opts));
  add('toMarkdownExtensions', toMarkdownWikiRefs(opts));

  function add(field: string, value: any) {
    if (data[field]) { data[field].push(value); }
    else { data[field] = [value]; }
  }

  // (for wikiattrs)
  // ref: https://github.com/remarkjs/remark-toc/blob/main/lib/index.js#L36
  return function (tree: Uni.Parent): void {
    if (doRenderAttrBox) {
      const attrbox: AttrBoxNode | undefined = initWikiAttrBox(tree, opts);
      // place attrbox at the beginning of the tree content
      // @ts-expect-error: placing AttrBoxNode where Node type expected
      if (attrbox !== undefined) { tree.children.unshift(attrbox); }
      // todo: test to ensure no existence of caml tokens either...?
    }
  };
}

export function remarkWikiAttrs(this: Processor, opts?: Partial<WikiRefsOptions>): Transformer<Uni.Parent, Uni.Node> {
  const doRenderAttrBox: boolean = opts?.attrs?.render ?? true;
  const data: any = this.data();

  // warn for earlier versions
  remarkV13Warning(this);

  add('micromarkExtensions', syntaxWikiAttrs(opts));
  add('fromMarkdownExtensions', fromMarkdownWikiAttrs(opts));
  add('toMarkdownExtensions', toMarkdownWikiAttrs(opts));

  function add(field: string, value: any) {
    if (data[field]) { data[field].push(value); }
    else { data[field] = [value]; }
  }

  // ref: https://github.com/remarkjs/remark-toc/blob/main/lib/index.js#L36
  return function (tree: Uni.Parent): void {
    if (doRenderAttrBox) {
      const attrbox: AttrBoxNode | undefined = initWikiAttrBox(tree, opts);
      // place attrbox at the beginning of the tree content
      // @ts-expect-error: placing AttrBoxNode where Node type expected
      if (attrbox !== undefined) { tree.children.unshift(attrbox); }
      // todo: test to ensure no existence of caml tokens either...?
    }
  };
}

export function remarkWikiLinks(this: Processor, opts?: Partial<WikiRefsOptions>): void {
  const data: any = this.data();

  // warn for earlier versions
  remarkV13Warning(this);

  add('micromarkExtensions', syntaxWikiLinks(opts));
  add('fromMarkdownExtensions', fromMarkdownWikiLinks(opts));
  add('toMarkdownExtensions', toMarkdownWikiLinks(opts));

  function add(field: string, value: any) {
    if (data[field]) { data[field].push(value); }
    else { data[field] = [value]; }
  }
}

export function remarkWikiEmbeds(this: Processor, opts?: Partial<WikiRefsOptions>): void {
  const data: any = this.data();

  // warn for earlier versions
  remarkV13Warning(this);

  add('micromarkExtensions', syntaxWikiEmbeds(opts));
  add('fromMarkdownExtensions', fromMarkdownWikiEmbeds(opts));
  add('toMarkdownExtensions', toMarkdownWikiEmbeds(opts));

  function add(field: string, value: any) {
    if (data[field]) { data[field].push(value); }
    else { data[field] = [value]; }
  }
}
