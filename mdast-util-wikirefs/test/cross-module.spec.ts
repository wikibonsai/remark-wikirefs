import assert from 'node:assert/strict';

import { WikiRefToken } from '../../micromark-extension-wikirefs/src/util/const';
import { fromMarkdownWikiRefs, toMarkdownWikiRefs } from '../src';

describe('cross-module', () => {

  describe('fromMarkdown', () => {

    it('enter keys must match \'WikiRefToken\' keys (unless handled in resolve)', () => {
      const fromMarkdownPlugin = fromMarkdownWikiRefs();
      if (!fromMarkdownPlugin.enter) { assert.fail(); }
      assert.deepStrictEqual(Object.keys(fromMarkdownPlugin.enter), [
        // wikiattr
        'wikiAttrBox',
        // wikilink
        WikiRefToken.wikiLink,
        // wikiembed
        WikiRefToken.wikiEmbed,
      ]);
    });

    it('exit keys must match \'WikiRefToken\' keys (unless handled in resolve)', () => {
      const fromMarkdownPlugin = fromMarkdownWikiRefs();
      if (!fromMarkdownPlugin.exit) { assert.fail(); }
      assert.deepStrictEqual(Object.keys(fromMarkdownPlugin.exit), [
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

  describe('toMarkdown', () => {

    it('handler keys must match mdast node keys', () => {
      const fromMarkdownPlugin = toMarkdownWikiRefs();
      if (!fromMarkdownPlugin.extensions) { assert.fail(); }
      assert.deepStrictEqual(fromMarkdownPlugin.extensions.flatMap((ext) => Object.keys(ext.handlers)), [
        // wikiattr
        // (see 'startAttrBoxNode.type')
        'attrbox',
        // wikilink
        // (see 'startWikiLinkNode.type')
        'wikilink',
        // wikiembed
        // (see 'startWikiEmbedNode.type')
        'wikiembed',
      ]);
    });

  });

});
