import assert from 'node:assert/strict';

import { micromark } from 'micromark';

import type { WikiRefTestCase } from 'wikirefs-spec';

import { syntaxWikiRefs, htmlWikiRefs } from '../../src';
import type { WikiRefsOptions } from '../../src/util/types';



let mockOpts: Partial<WikiRefsOptions>;

function run(contextMsg: string, tests: WikiRefTestCase[]): void {
  context(contextMsg, () => {
    let i: number = 0;
    for(const test of tests) {
      const desc: string = `[${('00' + (++i)).slice(-3)}] ` + (test.descr || '');
      it(desc, () => {
        const mkdn: string = test.mkdn;
        const expdHTML: string = test.html;
        const actlHTML: string = micromark(mkdn, {
          extensions: [syntaxWikiRefs()],
          htmlExtensions: [htmlWikiRefs(mockOpts)],
        });
        assert.strictEqual(
          actlHTML.replace(/\n/g, ''),
          expdHTML.replace(/\n/g, ''),
        );
      });
    }
  });
}

describe('configs', () => {

  beforeEach(() => {
    mockOpts = { resolveDocType: () => 'doctype' };
  });

  run('\'doctype feature\'; \'resolveDocType\' populates doctype css class', [
    {
      descr: 'attr; unprefixed',
      opts: mockOpts,
      mkdn: 'attrtype::[[fname-a]]\n',
      html: 
`<aside class="attrbox">
<span class="attrbox-title">Attributes</span>
<dl>
<dt>attrtype</dt>
<dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a></dd>
</dl>
</aside>
`,
    },
    {
      descr: 'attr; prefixed',
      opts: mockOpts,
      mkdn: ':attrtype::[[fname-a]]\n',
      html: 
`<aside class="attrbox">
<span class="attrbox-title">Attributes</span>
<dl>
<dt>attrtype</dt>
<dd><a class="attr wiki reftype__attrtype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a></dd>
</dl>
</aside>
`,
    },
    {
      descr: 'link; typed',
      opts: mockOpts,
      mkdn: ':linktype::[[fname-a]].',
      html: '<p><a class="wiki link type reftype__linktype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a>.</p>',
    },
    {
      descr: 'link; untyped',
      opts: mockOpts,
      mkdn: '[[fname-a]].',
      html: '<p><a class="wiki link doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a>.</p>',
    }
  ] as WikiRefTestCase[]);
  it.skip('wikiembed config cases', () => { return; });

});
