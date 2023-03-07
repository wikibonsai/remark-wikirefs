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

  describe('doctypes', () => {

    run('\'doctype feature\'; \'resolveDocType\' populates doctype css class', [
      {
        descr: 'wikiattr; unprefixed',
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
        descr: 'wikiattr; prefixed',
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
        descr: 'wikilink; typed',
        opts: mockOpts,
        mkdn: ':linktype::[[fname-a]].',
        html: '<p><a class="wiki link type reftype__linktype doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a>.</p>',
      },
      {
        descr: 'wikilink; untyped',
        opts: mockOpts,
        mkdn: '[[fname-a]].',
        html: '<p><a class="wiki link doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a>.</p>',
      },
      {
        descr: 'wikiembed; mkdn',
        opts: mockOpts,
        mkdn: '![[fname-a]].',
        html: '<p><p><div class="embed-wrapper"><div class="embed-title"><a class="wiki embed doctype__doctype" href="/fname-a" data-href="/fname-a">fname a</a></div><div class="embed-link"><a class="embed-link-icon" href="/fname-a" data-href="/fname-a"><i class="link-icon"></i></a></div><div class="embed-content">fname-a embed content</div></div></p>.</p>',
      },
      {
        descr: 'wikiembed; no doctype for media; audio',
        opts: mockOpts,
        mkdn: '![[audio.mp3]].',
        html: '<p><p><span class="embed-media" src="audio.mp3" alt="audio.mp3"><audio class="embed-audio" controls type="audio/mp3" src="/audio.mp3"></audio></span></p>.</p>',
      },
      {
        descr: 'wikiembed; no doctype for media; img',
        opts: mockOpts,
        mkdn: '![[img.png]].',
        html: '<p><p><span class="embed-media" src="img.png" alt="img.png"><img class="embed-image" src="/img.png"></span></p>.</p>',
      },
      {
        descr: 'wikiembed; no doctype for media; video',
        opts: mockOpts,
        mkdn: '![[video.mp4]].',
        html: '<p><p><span class="embed-media" src="video.mp4" alt="video.mp4"><video class="embed-video" controls type="video/mp4" src="/video.mp4"></video></span></p>.</p>',
      },
    ] as WikiRefTestCase[]);
    it.skip('wikiembed config cases', () => { return; });

});
