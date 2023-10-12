import type { Event } from 'micromark/dev/lib/compile';
import type { Tokenizer } from 'micromark/dev/lib/initialize/document';
import type { ConstructRecord, Effects, State, TokenizeContext } from 'micromark/dev/lib/create-tokenizer';
import type { Code, Extension, Point, Resolver } from 'micromark-util-types';
import type { WikiRefsOptions } from '../util/types';

import * as wikirefs from 'wikirefs';
import { codes } from 'micromark-util-symbol/codes';
import { types as UnifiedTypeToken } from 'micromark-util-symbol/types';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';
import { factorySpace } from 'micromark-factory-space';
import {
  markdownBullet,
  refTypeUsableCharCodes,
  WikiRefToken,
} from '../util/const';


export function syntaxWikiAttrs(opts?: Partial<WikiRefsOptions>): Extension {

  const flow: ConstructRecord = {} as ConstructRecord;
  /* eslint-disable indent */
  // hooks                            // w/ prefix
  const hooks: Code[] = ([] as Code[]).concat([codes.colon])
                                      // w/out prefix
                                      .concat(Object.values(refTypeUsableCharCodes));
  /* eslint-enable indent */

  for (const code of hooks) {
    if ((code !== null)) {
      flow[code] = {
        name: 'wikiattr',
        // from: https://github.com/micromark/micromark/blob/main/packages/micromark-util-types/index.js#L277
        concrete: true,
        add: 'before',
        tokenize: tokenizeWikiAttrs as Tokenizer,
        resolveAll: resolveWikiAttrs as Resolver,
      };
    }
  }

  return { flow };

  // construct functions

  function resolveWikiAttrs(this: Resolver, events: Event[], context: TokenizeContext): Event[] {
    let useCaml: boolean = false;
    // current index
    let index: number = -1;

    // check if events includes a caml token and return if it does -- use caml resolution instead
    while (++index < events.length) {
      if (events[index][1].type.indexOf('caml') === 0) {
        useCaml = true;
      }
    }

    // restart
    index = -1;

    // since we're still here, we are using caml and need to rename some tokens...
    while (++index < events.length) {
      // convert wikiattr token types to caml-friendly token types
      if (events[index][1].type.indexOf(WikiRefToken.wikiAttr) === 0) {
        switch (events[index][1].type) {
        case WikiRefToken.wikiAttr:
          if (events[index][0] === 'enter') {
            if (useCaml) {
              events[index][1].type = 'attrBox';
            } else {
              events[index][1].type = 'wikiAttrBox';
            }
          }
          if (events[index][0] === 'exit') {
            if (useCaml) {
              events[index][1].type = 'attrBox';
            } else {
              events[index][1].type = 'wikiAttrBox';
            }
          }
          break;
        case WikiRefToken.wikiAttrTypeTxt:
          events[index][1].type = 'wikiAttrKey';
          break;
        case WikiRefToken.wikiAttrFileNameTxt:
          events[index][1].type = 'wikiAttrVal';
          break;
        default: { break; }
        }
      }
    }
    return events;
  }

  function tokenizeWikiAttrs(this: TokenizeContext, effects: Effects, ok: State, nok: State): State {
    // skip '@typescript-eslint/no-this-alias'
    // eslint-disable-next-line
    const self: TokenizeContext = this;
    // const lastEvent: Event = this.events[this.events.length - 1];
    // const previous = this.previous;
    // in-
    let inListComma: boolean;
    // is-
    // 'is-' signifies the kind of list the current construct might be
    // if wikilinks continue on the same line, it can only be a comma-separated list
    // if wikilinks continue on the next line, it can only be a mkdn-separated list
    // then, if no wikilink is found, it is either a single variant (from comma) or
    // an invalid flow wikilink
    let isListComma: boolean;
    let isListMkdn: boolean;
    // has-
    let hasAttrType: boolean;
    let hasFileName: boolean;
    // consumed-
    let consumedAttrTypeWhiteSpace: boolean;
    // cursors
    let cursorAttrTypePrefixMarker: number = 0;
    let cursorAttrTypeMarker: number = 0;
    // cursors below need to be reset for each [[wikilink]]
    let cursorLeftMarker: number = 0;
    let cursorRightMarker: number = 0;
    let cursorListBulletMarker: number = 0;

    return start;

    // note (i think):
    // return func(code); --- 'proceed with this charcode ('reconsume')'
    // return func;       --- 'proceed to next charcode'

    // each function is given an 'end', 'invalid', and 'continue' comment
    // to help guide the eye more quickly to the desired line...:
    // 
    // 'end'     : is the condition by which to kick out of this function.
    // 'invalid' : are checks on whether or not to kick out and invalidate the current token ('nok')
    // 'continue': continue on to the next function ('ok')

    function start (code: Code): State | void {
      // if (
      //   // Exit if there’s stuff before.
      //   // self.previous !== codes.eof ||
      //   // Exit if not in the first content that is the first child of a list
      //   // item.
      //   // !self._gfmTasklistFirstContentOfListItem
      //   !self._gfmTableDynamicInterruptHack
      // ) {
      //   return nok(code);
      // }
      // 'wikiattr' must start at the start of a line
      // from: https://github.com/micromark/micromark-extension-frontmatter/blob/main/dev/lib/syntax.js#L75
      const position: Point = self.now();
      const lineFirstChar: boolean = (position.column === 1);
      if (!lineFirstChar) {
        return nok(code);
      }

      // if we're interrupting, kick out
      // if (self.interrupt) {
      //   self._gfmTableDynamicInterruptHack = false;
      //   // return nok;
      // }

      // from: https://github.com/micromark/micromark/blob/main/packages/micromark-core-commonmark/dev/lib/code-indented.js#L91
      // if this is a lazy line, we should interrupt
      // if (self.parser.lazy[position.line]) {
      //   // self.interrupt = true;
      //   return nok;
      // }

      // const state = self.containerState;
      // assert(state, 'expected `containerState` to be defined in container');

      // w/ prefix
      if (code === codes.colon) {
        // if (!state.open) {
        //   effects.enter(WikiRefToken.wikiAttr, { _container: true });
        //   state.open = true;
        // }
        // effects.enter(bufferedWikiAttr);
        effects.enter(WikiRefToken.wikiAttr);
        effects.enter(WikiRefToken.wikiRefTypePrefixMarker);
        return consumeAttrTypePrefixMarker(code);
      }
      // w/out prefix
      if ((code !== null) && wikirefs.RGX.VALID_CHARS.TYPE.test(String.fromCharCode(code))) {
        // if (!state.open) {
        //   effects.enter(WikiRefToken.wikiAttr, { _container: true });
        //   state.open = true;
        // }
        // effects.enter(bufferedWikiAttr);
        effects.enter(WikiRefToken.wikiAttr);
        effects.enter(WikiRefToken.wikiAttrTypeTxt);
        return consumeAttrTypeTxt(code);
      }
      // invalid
      return nok(code);
    }

    function consumeAttrTypePrefixMarker (code: Code): State | void {
      // end
      if (cursorAttrTypePrefixMarker === wikirefs.CONST.MARKER.PREFIX.length) {
        effects.exit(WikiRefToken.wikiRefTypePrefixMarker);
        effects.enter(WikiRefToken.wikiAttrTypeTxt);
        return consumeAttrTypeTxt(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.PREFIX.charCodeAt(cursorAttrTypePrefixMarker)) {
        return nok(code);
      }
      // continue...
      effects.consume(code);
      cursorAttrTypePrefixMarker++;
      return consumeAttrTypePrefixMarker;
    }

    function consumeAttrTypeTxt (code: Code): State | void {
      // end
      if (code === wikirefs.CONST.MARKER.TYPE.charCodeAt(cursorAttrTypeMarker)) {
        if (!hasAttrType) return nok(code);
        effects.exit(WikiRefToken.wikiAttrTypeTxt);
        effects.enter(WikiRefToken.wikiRefTypeMarker);
        return consumeAttrTypeMarker(code);
      }
      // invalid
      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }
      if (!wikirefs.RGX.VALID_CHARS.TYPE.test(String.fromCharCode(<number> code))) {
        return nok(code);
      }
      // continue
      if (!markdownLineEndingOrSpace(code)) {
        hasAttrType = true;
      }
      effects.consume(code);
      return consumeAttrTypeTxt;
    }

    function consumeAttrTypeMarker (code: Code): State | void {
      // end
      if (cursorAttrTypeMarker === wikirefs.CONST.MARKER.TYPE.length) {
        effects.exit(WikiRefToken.wikiRefTypeMarker);
        return forkKind(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.TYPE.charCodeAt(cursorAttrTypeMarker)) {
        return nok(code);
      }
      // continue
      effects.consume(code);
      cursorAttrTypeMarker++;
      return consumeAttrTypeMarker;
    }

    function forkKind (code: Code): State | void {
      // continue
      if (markdownSpace(code)) {
        // one whitespace is allowed for padding between
        // attrtype marker '::' and left marker '[['
        if (consumedAttrTypeWhiteSpace) {
          return nok(code);
        }
        consumedAttrTypeWhiteSpace = true;
        effects.enter(UnifiedTypeToken.whitespace);
        effects.consume(code);
        effects.exit(UnifiedTypeToken.whitespace);
        return forkKind;
      }
      // end
      // mkdn
      if (markdownLineEnding(code)) {
        isListMkdn = true;
        return listMkdnItemStart(code);
      }
      // single / first comma
      if (code === codes.leftSquareBracket) {
        isListComma = true;
        effects.enter(WikiRefToken.wikiLeftMarker);
        return consumeLeftMarker(code);
      }
      // invalid
      return nok(code);
    }

    // ref: https://github.com/micromark/micromark/blob/main/packages/micromark-core-commonmark/dev/lib/code-fenced.js#L125
    function listMkdnItemStart (code: Code): State | void {
      if (code === codes.eof) {
        return done(code);
      }
      if (markdownLineEnding(code)) {
        return effects.attempt(
          { partial: true, tokenize: consumeMkdnListLineEnding } as any,
          consumeListBullet,
          done,
        )(code);
      }
      // invalid
      if (!markdownBullet(code)) { return nok(code); }
      // end
      effects.enter(WikiRefToken.wikiListBulletMarker);
      return consumeListBullet(code);
    }

    function consumeListBullet (code: Code): State | void {
      const bulletAndSpace: number = 2;
      // end
      if (cursorListBulletMarker === bulletAndSpace) {
        effects.exit(WikiRefToken.wikiListBulletMarker);
        cursorListBulletMarker = 0;
        effects.enter(WikiRefToken.wikiLeftMarker);
        return consumeLeftMarker(code);
      }
      // invalid
      if (!markdownBullet(code) && !markdownSpace(code)) {
        return nok(code);
      }
      // continue
      // bullet: -*+
      if (markdownBullet(code) && cursorListBulletMarker === 0) {
        cursorListBulletMarker++;
        effects.enter(WikiRefToken.wikiListBulletMarker);
        effects.consume(code);
      }
      // single space
      if (markdownSpace(code) && cursorListBulletMarker === 1) {
        cursorListBulletMarker++;
        effects.consume(code);
      }
      return consumeListBullet;
    }

    function consumeListComma (code: Code): State | void {
      if (markdownSpace(code)) {
        return factorySpace(effects, consumeListComma, UnifiedTypeToken.whitespace)(code);
      }
      if (code === codes.comma) {
        inListComma = true;
        effects.enter(WikiRefToken.wikiListCommaMarker);
        effects.consume(code);
        effects.exit(WikiRefToken.wikiListCommaMarker);
        return consumeListComma;
      }
      // end
      if (code === codes.leftSquareBracket) {
        if (!inListComma) { return nok(code); }
        effects.enter(WikiRefToken.wikiLeftMarker);
        return consumeLeftMarker(code);
      }
      if (hasFileName && (markdownLineEnding(code) || (code === codes.eof))) { return done(code); }
      return nok(code);
    }

    function consumeLeftMarker (code: Code): State | void {
      // end
      if (cursorLeftMarker === wikirefs.CONST.MARKER.OPEN.length) {
        effects.exit(WikiRefToken.wikiLeftMarker);
        cursorLeftMarker = 0;
        effects.enter(WikiRefToken.wikiAttrFileNameTxt);
        return consumeFileName(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.OPEN.charCodeAt(cursorLeftMarker)) {
        return nok(code);
      }
      // continue
      effects.consume(code);
      cursorLeftMarker++;
      return consumeLeftMarker;
    }

    function consumeFileName (code: Code): State | void {
      // end
      if (code === wikirefs.CONST.MARKER.CLOSE.charCodeAt(cursorRightMarker)) {
        if (!hasFileName) return nok(code);
        effects.exit(WikiRefToken.wikiAttrFileNameTxt);
        effects.enter(WikiRefToken.wikiRightMarker);
        return consumeRightMarker(code);
      }
      // invalid
      if (markdownLineEnding(code) || (code === codes.eof)) {
        return nok(code);
      }
      if (!wikirefs.RGX.VALID_CHARS.FILENAME.test(String.fromCharCode(code))) {
        return nok(code);
      }
      // continue
      if (!markdownLineEndingOrSpace(code)) {
        hasFileName = true;
      }
      effects.consume(code);
      return consumeFileName;
    }

    function consumeRightMarker (code: Code): State | void {
      // end
      if (cursorRightMarker === wikirefs.CONST.MARKER.CLOSE.length) {
        effects.exit(WikiRefToken.wikiRightMarker);
        cursorRightMarker = 0;
        // fork or end
        // list, comma-separated
        if (isListComma) {
          return consumeListComma(code);
        }
        // list, mkdn-separated
        if (isListMkdn) {
          return listMkdnItemStart(code);
        }
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.CLOSE.charCodeAt(cursorRightMarker)) {
        return nok(code);
      }
      // continue
      effects.consume(code);
      cursorRightMarker++;
      return consumeRightMarker;
    }

    // fin(ish)
    function done (code: Code): State | void {
      if (!markdownLineEnding(code) && (code !== codes.eof)) { return nok(code); }
      if (!hasAttrType || !hasFileName) { return nok(code); }
      effects.exit(WikiRefToken.wikiAttr);
      // effects.exit(bufferedWikiAttr);
      // from: https://github.com/micromark/micromark/blob/main/packages/micromark-core-commonmark/dev/lib/code-indented.js#L91
      // if this is a lazy line, we should interrupt
      // if (self.parser.lazy[position.line]) {
      // if (self.parser.lazy[self.now().line]) {
      //   self.interrupt = true;
      //   // return nok(code);
      //   // return nok;
      // }
      // Blank or interrupting line.
      // if (
      //   self.parser.lazy[self.now().line] ||
      //   code === codes.eof ||
      //   markdownLineEnding(code)
      // ) {
      //   return nok(code);
      // }

      // TODO THIS WAS THE LAST SPOT
      // if we are inside a list, signal an interrupt
      // const position: Point = self.now();
      // if (self.parser.lazy[position.line]) {
      // // if (self.parser.lazy[position.line] && self.containerState && self.containerState.type === 'list') {
      //   // self.interrupt = true;
      //   return effects.interrupt(self.parser.constructs.flow, nok, ok)(code);
      //   // return ok(code);
      // }

      // const state = self.containerState;
      // assert(state, 'expected `containerState` to be defined in container');

      return ok(code);
    }

    // partial tokenizers

    function consumeMkdnListLineEnding(effects: Effects, ok: State, nok: State): State {
      return start;

      function start (code: Code): State | void {
        if (!markdownLineEnding(code)) { return nok(code); }
        effects.enter(WikiRefToken.listLineEnding);
        effects.consume(code);
        effects.exit(WikiRefToken.listLineEnding);
        return prefix;
      }

      function prefix (code: Code): State | void {
        return factorySpace(effects, effects.check(
          { partial: true, tokenize: bulletLookahead } as any,
          ok,
          nok,
        ), UnifiedTypeToken.linePrefix)(code);
      }

      // todo ...?

      // // from: https://github.com/micromark/micromark-extension-gfm-table/blob/main/dev/lib/syntax.js#L595
      // function hack (code: Code): State | void {
      //   self._gfmTableDynamicInterruptHack = true

      //   return effects.check(
      //     self.parser.constructs.flow,
      //     function (code) {
      //       self._gfmTableDynamicInterruptHack = false
      //       return nok(code)
      //     },
      //     function (code) {
      //       self._gfmTableDynamicInterruptHack = false
      //       return ok(code)
      //     }
      //   )(code);
      // }
    }

    function bulletLookahead(effects: Effects, ok: State, nok: State): State | void {
      return start;

      function start (code: Code): State | void {
        if (markdownBullet(code)) {
          return ok(code);
        }
        return nok(code);
      }
    }
  }
}
