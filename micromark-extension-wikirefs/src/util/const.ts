import type { Code } from 'micromark-util-types';

import { codes } from 'micromark-util-symbol/codes';


// modelled from: https://github.com/micromark/micromark/blob/main/packages/micromark-util-symbol/codes.js
export const refTypeUsableCharCodes: Record<string, Code> = {
  space: 32,
  quotationMark: 34, // `"`
  numberSign: 35, // `#`
  dollarSign: 36, // `$`
  percentSign: 37, // `%`
  ampersand: 38, // `&`
  apostrophe: 39, // `'`
  leftParenthesis: 40, // `(`
  rightParenthesis: 41, // `)`
  asterisk: 42, // `*`
  plusSign: 43, // `+`
  comma: 44, // `,`
  dash: 45, // `-`
  dot: 46, // `.`
  slash: 47, // `/`
  digit0: 48, // `0`
  digit1: 49, // `1`
  digit2: 50, // `2`
  digit3: 51, // `3`
  digit4: 52, // `4`
  digit5: 53, // `5`
  digit6: 54, // `6`
  digit7: 55, // `7`
  digit8: 56, // `8`
  digit9: 57, // `9`
  semicolon: 59, // `;`
  lessThan: 60, // `<`
  equalsTo: 61, // `=`
  greaterThan: 62, // `>`
  questionMark: 63, // `?`
  atSign: 64, // `@`
  uppercaseA: 65, // `A`
  uppercaseB: 66, // `B`
  uppercaseC: 67, // `C`
  uppercaseD: 68, // `D`
  uppercaseE: 69, // `E`
  uppercaseF: 70, // `F`
  uppercaseG: 71, // `G`
  uppercaseH: 72, // `H`
  uppercaseI: 73, // `I`
  uppercaseJ: 74, // `J`
  uppercaseK: 75, // `K`
  uppercaseL: 76, // `L`
  uppercaseM: 77, // `M`
  uppercaseN: 78, // `N`
  uppercaseO: 79, // `O`
  uppercaseP: 80, // `P`
  uppercaseQ: 81, // `Q`
  uppercaseR: 82, // `R`
  uppercaseS: 83, // `S`
  uppercaseT: 84, // `T`
  uppercaseU: 85, // `U`
  uppercaseV: 86, // `V`
  uppercaseW: 87, // `W`
  uppercaseX: 88, // `X`
  uppercaseY: 89, // `Y`
  uppercaseZ: 90, // `Z`
  backslash: 92, // `\`
  underscore: 95, // `_`
  graveAccent: 96, // `` ` ``
  lowercaseA: 97, // `a`
  lowercaseB: 98, // `b`
  lowercaseC: 99, // `c`
  lowercaseD: 100, // `d`
  lowercaseE: 101, // `e`
  lowercaseF: 102, // `f`
  lowercaseG: 103, // `g`
  lowercaseH: 104, // `h`
  lowercaseI: 105, // `i`
  lowercaseJ: 106, // `j`
  lowercaseK: 107, // `k`
  lowercaseL: 108, // `l`
  lowercaseM: 109, // `m`
  lowercaseN: 110, // `n`
  lowercaseO: 111, // `o`
  lowercaseP: 112, // `p`
  lowercaseQ: 113, // `q`
  lowercaseR: 114, // `r`
  lowercaseS: 115, // `s`
  lowercaseT: 116, // `t`
  lowercaseU: 117, // `u`
  lowercaseV: 118, // `v`
  lowercaseW: 119, // `w`
  lowercaseX: 120, // `x`
  lowercaseY: 121, // `y`
  lowercaseZ: 122, // `z`
  leftCurlyBrace: 123, // `{`
  rightCurlyBrace: 125, // `}`
  tilde: 126, // `~`
};

// modelled from: https://github.com/micromark/micromark/blob/main/packages/micromark-util-character/dev/index.js
export function markdownBullet (code: Code): boolean {
  return (
    code === codes.asterisk ||
    code === codes.dash ||
    code === codes.plusSign
  );
}

// "const enums are inlined at compile time"
// https://www.typescriptlang.org/docs/handbook/enums.html#const-enums
export const enum WikiRefToken {
  //                 markers for all                     //

  // reftype
  wikiRefTypePrefixMarker = 'wikiRefTypePrefixMarker',
  wikiRefTypeMarker       = 'wikiRefTypeMarker',
  // ref
  wikiLeftMarker          = 'wikiLeftMarker',
  wikiRightMarker         = 'wikiRightMarker',

  // separate construct tokens for precise data extraction
  // (see html and mdast)

  //          markers for wikiattr construct             //

  wikiAttr                 = 'wikiAttr',
  // data
  wikiAttrTypeTxt          = 'wikiAttrTypeTxt',
  wikiAttrFileNameTxt      = 'wikiAttrFileNameTxt',
  // markers
  wikiListCommaMarker     = 'wikiListCommaMarker',
  wikiListBulletMarker    = 'wikiListBulletMarker',
  // (shared with 'micromark-extension-caml')
  listLineEnding          = 'listLineEnding',

  //          markers for wikilink construct             //

  wikiLink                 = 'wikiLink',
  // data
  wikiLinkTypeTxt          = 'wikiLinkTypeTxt',
  wikiLinkFileNameTxt      = 'wikiLinkFileNameTxt',
  wikiLinkLabelTxt         = 'wikiLinkLabelTxt', // (untyped only)
  // markers
  wikiLinkLabelMarker      = 'wikiLinkLabelMarker',

  //          markers for wikiembed construct            //

  wikiEmbed                = 'wikiEmbed',
  // data
  wikiEmbedFileNameTxt     = 'wikiEmbedFileNameTxt',
  // markers
  wikiEmbedMarker         = 'wikiEmbedMarker',
}
