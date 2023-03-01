import type { ConstructRecord, Effects, State } from 'micromark/dev/lib/create-tokenizer';
import type { Tokenizer } from 'micromark/dev/lib/initialize/document';
import type { Code, Extension } from 'micromark-util-types';
import { codes } from 'micromark-util-symbol/codes';
import {
  markdownLineEnding,
  markdownLineEndingOrSpace,
} from 'micromark-util-character';

import * as wikirefs from 'wikirefs';

import type { WikiRefsOptions } from '../util/types';
import { WikiRefToken } from '../util/const';


// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const syntaxWikiEmbeds = (function (opts?: Partial<WikiRefsOptions>): Extension {
  // hooks
  return {
    text: {
      [codes.exclamationMark]: {
        name: 'wikiembed',
        tokenize: tokenizeWikiEmbeds as Tokenizer,
      },
    } as ConstructRecord,
  };

  function tokenizeWikiEmbeds(effects: Effects, ok: State, nok: State): State {
    ////
    // has data
    let hasFileName: boolean;
    ////
    // cursors
    // wikiref
    let cursorLeftMarker: number = 0;
    let cursorRightMarker: number = 0;
    // wikiembed
    // const cursorEmbedMarker: number = 0;
    let cursorEmbedMarker: number = 0;

    return start;

    // each function is given an 'end', 'invalid', and 'continue' comment
    // to help guide the eye more quickly to the desired line...:
    // 
    // 'end'     : is the condition by which to kick out of this function.
    // 'invalid' : are checks on whether or not to kick out and invalidate the current token ('nok')
    // 'continue': continue on to the next function ('ok')

    function start (code: Code): State | void {
      // console.log('start: ', code, String.fromCharCode(<number> code));
      // invalid
      if (code !== wikirefs.CONST.MARKER.EMBED.charCodeAt(cursorEmbedMarker)) {
        return nok(code);
      }
      // continue...
      effects.enter(WikiRefToken.wikiEmbed);
      effects.enter(WikiRefToken.wikiEmbedMarker);
      return consumeEmbedMarker(code);
    }

    function consumeEmbedMarker (code: Code): State | void {
      // console.log('consumeEmbedMarker: ', code, String.fromCharCode(<number> code));
      // end
      if (cursorEmbedMarker === wikirefs.CONST.MARKER.EMBED.length) {
        effects.exit(WikiRefToken.wikiEmbedMarker);
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
      return consumeEmbedMarker;
    }

    function consumeLeftMarker (code: Code) {
      // console.log('consumeLeftMarker: ', code, String.fromCharCode(<number> code));
      // end
      if (cursorLeftMarker === wikirefs.CONST.MARKER.OPEN.length) {
        effects.exit(WikiRefToken.wikiLeftMarker);
        effects.enter(WikiRefToken.wikiEmbedFileNameTxt);
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

    function consumeFileName (code: Code) {
      // console.log('consumeFileName: ', code, String.fromCharCode(<number> code));
      // end
      if (code === wikirefs.CONST.MARKER.CLOSE.charCodeAt(cursorRightMarker)) {
        if (!hasFileName) return nok(code);
        effects.exit(WikiRefToken.wikiEmbedFileNameTxt);
        effects.enter(WikiRefToken.wikiRightMarker);
        return consumeRightMarker(code);
      }
      // invalid
      if (markdownLineEnding(code) || code === codes.eof) {
        return nok(code);
      }
      if (!wikirefs.RGX.VALID_CHARS.FILENAME.test(String.fromCharCode(<number> code))) {
        return nok(code);
      }
      // continue
      if (!markdownLineEndingOrSpace(code)) {
        hasFileName = true;
      }
      effects.consume(code);
      return consumeFileName;
    }

    // fin(ish)
    function consumeRightMarker (code: Code) {
      // console.log('consumeRightMarker: ', code, String.fromCharCode(<number> code));
      // end
      if (cursorRightMarker === wikirefs.CONST.MARKER.CLOSE.length) {
        // console.log('exiting...');
        effects.exit(WikiRefToken.wikiRightMarker);
        effects.exit(WikiRefToken.wikiEmbed);
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
  }
});
