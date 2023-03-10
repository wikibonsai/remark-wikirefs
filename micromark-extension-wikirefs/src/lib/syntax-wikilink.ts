import { merge } from 'lodash-es';
import type { ConstructRecord, Effects, State } from 'micromark/dev/lib/create-tokenizer';
import type { Tokenizer } from 'micromark/dev/lib/initialize/document';
import type { Code, Extension } from 'micromark-util-types';
import { constants } from 'micromark-util-symbol/constants.js';
import { types } from 'micromark-util-symbol/types.js';
import { codes } from 'micromark-util-symbol/codes.js';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
  markdownSpace,
} from 'micromark-util-character';

import * as wikirefs from 'wikirefs';

import type { OptLink, WikiRefsOptions } from '../util/types';
import { WikiRefToken } from '../util/const';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function syntaxWikiLinks(opts?: Partial<WikiRefsOptions>): Extension {
  // default opts
  const defaults = {
    links: {
      overrideEmbeds: false,
    } as Partial<OptLink>,
  };
  const fullOpts = merge(defaults, opts);

  // hooks
  // default
  if (!fullOpts.links.overrideEmbeds) {
    return {
      text: {
        [codes.colon]: {
          name: 'wikilink',
          tokenize: tokenizeWikiLinks as Tokenizer,
        },
        [codes.leftSquareBracket]: {
          name: 'wikilink',
          tokenize: tokenizeWikiLinks as Tokenizer,
        },
      } as ConstructRecord,
    };
  // render [[wikilinks]] where ![[wikiembed]] syntax is used
  } else {
    return {
      text: {
        [codes.colon]: {
          name: 'wikilink',
          tokenize: tokenizeWikiLinks as Tokenizer,
        },
        [codes.leftSquareBracket]: {
          name: 'wikilink',
          tokenize: tokenizeWikiLinks as Tokenizer,
        },
        // todo: any way to make this a formal partialized tokenizer?
        // skip over exclamation mark and render [[wikilink]]
        [codes.exclamationMark]: {
          name: 'wikilink',
          tokenize: tokenizeWikiLinks as Tokenizer,
        },
      } as ConstructRecord,
    };
  }

  function tokenizeWikiLinks(effects: Effects, ok: State, nok: State): State {
    let hasLinkType: boolean;
    let hasFileName: boolean;
    let hasLabelText: boolean;
    // let consumedLinkTypePrefixWhiteSpace: boolean;
    let consumedLinkTypeWhiteSpace: boolean;

    let cursorLabel: number = 0;
    let cursorLabelMarker: number = 0;
    let cursorLinkTypePrefixMarker: number = 0;
    let cursorLinkTypeMarker: number = 0;
    let cursorLeftMarker: number = 0;
    let cursorRightMarker: number = 0;
    // for rendering wikiembeds as wikilinks -- skip over !
    let cursorEmbedMarker: number = 0;

    return start;

    // each function is given an 'end', 'invalid', and 'continue' comment
    // to help guide the eye more quickly to the desired line...:
    // 
    // 'end'     : is the condition by which to kick out of this function.
    // 'invalid' : are checks on whether or not to kick out and invalidate the current token ('nok')
    // 'continue': continue on to the next function ('ok')

    function start (code: Code): State | void {
      // invalid
      if ((code !== wikirefs.CONST.MARKER.PREFIX.charCodeAt(cursorLinkTypePrefixMarker))
      && (code !== wikirefs.CONST.MARKER.OPEN.charCodeAt(cursorLeftMarker))
      && (!fullOpts.links.overrideEmbeds && (code === codes.exclamationMark))
      ) {
        return nok(code);
      }
      // continue...
      effects.enter(WikiRefToken.wikiLink);
      // typed
      if (code === codes.colon) {
        effects.enter(WikiRefToken.wikiRefTypePrefixMarker);
        return consumeLinkTypePrefixMarker(code);
      }
      // untyped
      if (code === codes.leftSquareBracket) {
        effects.enter(WikiRefToken.wikiLeftMarker);
        return consumeLeftMarker(code);
      }
      // !embed passthrough
      if (code === codes.exclamationMark) {
        effects.enter(WikiRefToken.wikiEmbed);
        return consumeRawEmbedMarker(code);
      }
      // invalid
      effects.exit(WikiRefToken.wikiLink);
      return nok(code);
    }

    function consumeRawEmbedMarker (code: Code): State | void {
      // end
      if (cursorEmbedMarker === wikirefs.CONST.MARKER.EMBED.length) {
        effects.exit(WikiRefToken.wikiEmbed);
        effects.enter(WikiRefToken.wikiLeftMarker);
        return consumeLeftMarker(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.EMBED.charCodeAt(cursorEmbedMarker)) {
        return nok(code);
      }
      // continue...
      effects.consume(code);
      cursorEmbedMarker++;
      return consumeRawEmbedMarker;
    }

    function consumeLinkTypePrefixMarker (code: Code): State | void {
      // end
      if (cursorLinkTypePrefixMarker === wikirefs.CONST.MARKER.PREFIX.length) {
        effects.exit(WikiRefToken.wikiRefTypePrefixMarker);
        effects.enter(WikiRefToken.wikiLinkTypeTxt);
        return consumeLinkTypeTxt(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.PREFIX.charCodeAt(cursorLinkTypePrefixMarker)) {
        return nok(code);
      }
      // continue...
      effects.consume(code);
      cursorLinkTypePrefixMarker++;
      return consumeLinkTypePrefixMarker;
    }

    function consumeLinkTypeTxt (code: Code): State | void {
      // end
      if (code === wikirefs.CONST.MARKER.TYPE.charCodeAt(cursorLinkTypeMarker)) {
        if (!hasLinkType) return nok(code);
        effects.exit(WikiRefToken.wikiLinkTypeTxt);
        effects.enter(WikiRefToken.wikiRefTypeMarker);
        return consumeLinkTypeMarker(code);
      }
      // invalid
      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }
      if (!wikirefs.RGX.VALID_CHARS.TYPE.test(String.fromCharCode(code))) {
        return nok(code);
      }
      // continue
      if (!markdownLineEndingOrSpace(code)) {
        hasLinkType = true;
      }
      effects.consume(code);
      return consumeLinkTypeTxt;
    }

    function consumeLinkTypeMarker (code: Code): State | void {
      // end
      if (cursorLinkTypeMarker === wikirefs.CONST.MARKER.TYPE.length) {
        effects.exit(WikiRefToken.wikiRefTypeMarker);
        effects.enter(WikiRefToken.wikiLeftMarker);
        return consumeLeftMarker(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.TYPE.charCodeAt(cursorLinkTypeMarker)) {
        return nok(code);
      }
      // continue
      effects.consume(code);
      cursorLinkTypeMarker++;
      return consumeLinkTypeMarker;
    }

    function consumeLeftMarker (code: Code): State | void {
      // end
      if (cursorLeftMarker === wikirefs.CONST.MARKER.OPEN.length) {
        effects.exit(WikiRefToken.wikiLeftMarker);
        effects.enter(WikiRefToken.wikiLinkFileNameTxt);
        return consumeFileName(code);
      }
      // continue
      // one whitespace is allowed for padding between
      // linktype marker '::' and left marker '[['
      // todo: 
      // 	- padding? https://github.com/micromark/micromark-extension-math/blob/main/dev/lib/math-text.js#L169
      // 	- factorySpace? https://github.com/micromark/micromark-extension-math/blob/main/dev/lib/math-flow.js#L162
      if (!consumedLinkTypeWhiteSpace && (cursorLeftMarker === 0) && markdownSpace(code)) {
        consumedLinkTypeWhiteSpace = true;
        effects.consume(code);
        return consumeLeftMarker;
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
      if (code === wikirefs.CONST.MARKER.LABEL.charCodeAt(cursorLabel)) {
        if (!hasFileName) return nok(code);
        effects.exit(WikiRefToken.wikiLinkFileNameTxt);
        effects.enter(WikiRefToken.wikiLinkLabelMarker);
        return consumeLabelMarker(code);
      }
      if (code === wikirefs.CONST.MARKER.CLOSE.charCodeAt(cursorRightMarker)) {
        if (!hasFileName) return nok(code);
        effects.exit(WikiRefToken.wikiLinkFileNameTxt);
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

    function consumeLabelMarker (code: Code): State | void {
      // end
      if (cursorLabelMarker === wikirefs.CONST.MARKER.LABEL.length) {
        effects.exit(WikiRefToken.wikiLinkLabelMarker);
        effects.enter(WikiRefToken.wikiLinkLabelTxt);
        return consumeLabel(code);
      }
      // invalid
      if (code !== wikirefs.CONST.MARKER.LABEL.charCodeAt(cursorLabelMarker)) {
        return nok(code);
      }
      // continue
      effects.consume(code);
      cursorLabelMarker++;
      return consumeLabelMarker;
    }

    function consumeLabel (code: Code): State | void {
      // end (maybe)
      if (code === wikirefs.CONST.MARKER.CLOSE.charCodeAt(cursorRightMarker)) {
        return lookaheadRightMarker(code);
      }
      // invalid
      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }
      // label text is permissive and will accept pretty much anything
      // continue
      if (!markdownLineEndingOrSpace(code)) {
        hasLabelText = true;
      }
      effects.consume(code);
      cursorLabel++;
      return consumeLabel;
    }

    /**
     * When encountering a right square bracket, we must look ahead at the next character
     * to determine whether it indicates the end of the [[wikilink]] or is
     * simply part of the label text.
     */
    function lookaheadRightMarker (code: Code): State | void {
      // invalid
      if(code !== codes.rightSquareBracket) { return nok(code); }
      // lookahead
      return effects.check(
        // check if the next two characters are `]]`
        { partial: true, tokenize: rightMarkerLookahead } as any,
        // end
        endLabel,
        // continue...
        consumeRightSqBrackInLabel,
      )(code);
    }

    /**
     * Consumes a single character in label mode.
     * @effect starts label mode if we weren't already in it
     */
    function consumeRightSqBrackInLabel (code: Code): State | void {
      effects.consume(code);
      return consumeLabel;
    }

    function endLabel (code: Code): State | void {
      if (!hasLabelText) { return nok(code); }
      effects.exit(WikiRefToken.wikiLinkLabelTxt);
      effects.enter(WikiRefToken.wikiRightMarker);
      return consumeRightMarker(code);
    }

    // fin(ish)
    function consumeRightMarker (code: Code): State | void {
      // end
      if (cursorRightMarker === wikirefs.CONST.MARKER.CLOSE.length) {
        effects.exit(WikiRefToken.wikiRightMarker);
        effects.exit(WikiRefToken.wikiLink);
        return ok(code);
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

    // partial tokenizers

    /** If the next two characters are `]]`, run `ok`, else `nok`. */
    function rightMarkerLookahead(effects: Effects, ok: State, nok: State): State {
      return start;

      function start(code: Code) {
        if (code !== codes.rightSquareBracket) { return nok(code); }
        effects.consume(code);
        return lookaheadAt;
      }

      function lookaheadAt(code: Code) {
        if (code !== codes.rightSquareBracket) { return nok(code); }
        effects.consume(code);
        return ok(code);
      }
    }
  }
}
