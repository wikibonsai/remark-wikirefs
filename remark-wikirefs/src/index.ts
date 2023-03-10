import { Processor } from 'unified';
import {
  syntaxWikiRefs,
  syntaxWikiAttrs,
  syntaxWikiLinks,
  syntaxWikiEmbeds,
  WikiRefsOptions,
} from 'micromark-extension-wikirefs';
import {
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


export function remarkWikiRefs(this: Processor, opts?: Partial<WikiRefsOptions>): void {
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

export function remarkWikiAttrs(this: Processor, opts?: Partial<WikiRefsOptions>): void {
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
