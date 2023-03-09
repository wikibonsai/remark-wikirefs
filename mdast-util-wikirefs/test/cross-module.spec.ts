import assert from 'node:assert/strict';

import { WikiRefToken } from '../../micromark-extension-wikirefs/src/util/const';
import { fromMarkdownWikiRefs, toMarkdownWikiRefs } from '../src';

describe('cross-module', () => {

  describe('fromMarkdown', () => {

    it('enter keys must match token keys (unless handled in resolve)', () => {
      const fromMarkdownPlugin = fromMarkdownWikiRefs();
      const wikiattrs = fromMarkdownPlugin[0];
      const wikilinks = fromMarkdownPlugin[1];
      const wikiembeds = fromMarkdownPlugin[2];
      if (!wikiattrs.enter) { assert.fail(); }
      if (!wikilinks.enter) { assert.fail(); }
      if (!wikiembeds.enter) { assert.fail(); }
      // wikiattr
      assert.deepStrictEqual(Object.keys(wikiattrs.enter), [
        'wikiAttrBox',
      ]);
      // wikilink
      assert.deepStrictEqual(Object.keys(wikilinks.enter), [
        WikiRefToken.wikiLink,
      ]);
      // wikiembed
      assert.deepStrictEqual(Object.keys(wikiembeds.enter), [
        WikiRefToken.wikiEmbed,
      ]);
    });

    it('exit keys must match \'WikiRefToken\' keys (unless handled in resolve)', () => {
      const fromMarkdownPlugin = fromMarkdownWikiRefs();
      const wikiattrs = fromMarkdownPlugin[0];
      const wikilinks = fromMarkdownPlugin[1];
      const wikiembeds = fromMarkdownPlugin[2];
      if (!wikiattrs.exit) { assert.fail(); }
      if (!wikilinks.exit) { assert.fail(); }
      if (!wikiembeds.exit) { assert.fail(); }
      assert.deepStrictEqual(Object.keys(wikiattrs.exit), [
        // see 'resolveWikiAttrs()'
        'wikiAttrKey',
        'wikiAttrVal',
        'wikiAttrBox',
      ]);
      assert.deepStrictEqual(Object.keys(wikilinks.exit), [
        WikiRefToken.wikiLinkTypeTxt,
        WikiRefToken.wikiLinkFileNameTxt,
        WikiRefToken.wikiLinkLabelTxt,
        WikiRefToken.wikiLink,
      ]);
      assert.deepStrictEqual(Object.keys(wikiembeds.exit), [
        WikiRefToken.wikiEmbedFileNameTxt,
        WikiRefToken.wikiEmbed,
      ]);
    });

  });

  describe('toMarkdown', () => {

    it('handler keys must match mdast node keys', () => {
      const toMarkdownPlugin = toMarkdownWikiRefs();
      if (!toMarkdownPlugin.extensions) { assert.fail(); }
      const wikiattrs = toMarkdownPlugin.extensions[0];
      const wikilinks = toMarkdownPlugin.extensions[1];
      const wikiembeds = toMarkdownPlugin.extensions[2];
      if (!wikiattrs.handlers) { assert.fail(); }
      if (!wikilinks.handlers) { assert.fail(); }
      if (!wikiembeds.handlers) { assert.fail(); }
      if (!toMarkdownPlugin.extensions) { assert.fail(); }
      assert.deepStrictEqual(Object.keys(wikiattrs.handlers), [
        // see 'startAttrBoxNode.type'
        'attrbox',
      ]);
      assert.deepStrictEqual(Object.keys(wikilinks.handlers), [
        // see 'startWikiLinkNode.type'
        'wikilink',
      ]);
      assert.deepStrictEqual(Object.keys(wikiembeds.handlers), [
        // see 'startWikiEmbedNode.type'
        'wikiembed',
      ]);
    });

  });

});
