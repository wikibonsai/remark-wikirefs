import assert from 'node:assert/strict';

import type { NormalizedHtmlExtension } from 'micromark-util-types';

import { WikiRefToken } from '../../src/util/const';
import { htmlWikiRefs } from '../../src/lib/html-wikiref';


describe('token cross-module', () => {

  describe('token + html keys', () => {

    it('enter keys must match \'WikiRefToken\' keys (unless handled in resolve)', () => {
      const htmlPlugin: Partial<NormalizedHtmlExtension> = htmlWikiRefs();
      if (!htmlPlugin.enter) { assert.fail(); }
      assert.deepStrictEqual(Object.keys(htmlPlugin.enter), [
        // wikiattr
        'wikiAttrBox',
        // wikilink
        WikiRefToken.wikiLink,
        // wikiembed
        WikiRefToken.wikiEmbed,
      ]);
    });

    it('exit keys must match \'WikiRefToken\' keys (unless handled in resolve)', () => {
      const htmlPlugin: Partial<NormalizedHtmlExtension> = htmlWikiRefs();
      if (!htmlPlugin.exit) { assert.fail(); }
      assert.deepStrictEqual(Object.keys(htmlPlugin.exit), [
        // wikiattr
        'wikiAttrKey',
        'wikiAttrVal',
        'wikiAttrBox',
        // wikilink
        WikiRefToken.wikiLinkTypeTxt,
        WikiRefToken.wikiLinkFileNameTxt,
        WikiRefToken.wikiLinkLabelTxt,
        WikiRefToken.wikiLink,
        // wikiembed
        WikiRefToken.wikiEmbedFileNameTxt,
        WikiRefToken.wikiEmbed,
      ]);
    });

  });

});
