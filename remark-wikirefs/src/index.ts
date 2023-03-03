// from: https://github.com/remarkjs/remark-gfm/blob/main/index.js#L12
// import type { Plugin } from 'unified';

import { /*htmlWikiRefs,*/ syntaxWikiRefs, WikiRefsOptions } from 'micromark-extension-wikirefs';
import { fromMarkdownWikiRefs, toMarkdownWikiRefs} from 'mdast-util-wikirefs';

import { remarkV13Warning } from './warn';


export default function remarkWikiRefs(this: any, opts?: Partial<WikiRefsOptions>): void {
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
}
