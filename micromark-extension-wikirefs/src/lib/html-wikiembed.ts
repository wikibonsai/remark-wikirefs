import { ok as assert } from 'uvu/assert';
import path from 'path';
import * as wikirefs from 'wikirefs';
import type { CompileContext, HtmlExtension } from 'micromark-util-types';
import type { Token } from 'micromark/dev/lib/initialize/document';

import type { WikiEmbedData, ReqHtmlOpts } from '../util/types';


export function htmlWikiEmbeds(opts: ReqHtmlOpts): HtmlExtension {
  // note: enter/exit keys should match a token name
  return {
    enter: {
      wikiEmbed: enterWikiEmbed,
    },
    exit: {
      wikiEmbedFileNameTxt: exitFileNameTxt,
      wikiEmbed: exitWikiEmbed,
    }
  };

  function enterWikiEmbed (this: CompileContext): void {
    let stack: WikiEmbedData[] = this.getData('WikiEmbedStack') as unknown as WikiEmbedData[];
    if (!stack) this.setData('WikiEmbedStack', (stack = []));
    stack.push({} as WikiEmbedData);
  }

  function exitFileNameTxt (this: CompileContext, token: Token): void {
    const filename: string = this.sliceSerialize(token);
    const stack: WikiEmbedData[] = this.getData('WikiEmbedStack') as unknown as WikiEmbedData[];
    const current: WikiEmbedData = top(stack);
    current.filename = filename;
    if (opts.resolveDocType) {
      const resolvedDocType: string | undefined = opts.resolveDocType(filename);
      current.doctype = resolvedDocType ? resolvedDocType : '';
    }
  }

  // an element like this should be built:

  // markdown embeds:
  // 
  // <p>
  // <div class="embed-wrapper">
  //   <div class="embed-title">
  //     <a class="wiki embed doctype__doctype" href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
  //       embedded document
  //     </a>
  //   </div>
  //   <div class="embed-link">
  //     <a href="/tests/fixtures/embed-doc" data-href="/tests/fixtures/embed-doc">
  //       <i class="link-icon"></i>
  //     </a>
  //   </div>
  //   <div class="embed-content">
  //     <p>Here is some content.</p>
  //   </div>
  // </div>
  // </p>

  // media embeds (audio, img, video):

  // audio:
  // 
  // <p>
  //  <span class="embed-media" src="audio.mp3" alt="audio.mp3">
  //    <audio class="embed-audio" controls src="/tests/fixtures/audio.mp3"></audio>
  //  </span>
  // </p>

  // image:
  // 
  // <p>
  //  <span class="embed-media" src="image.png" alt="image.png">
  //    <img class="embed-image" src="/tests/fixtures/image.png">
  //  </span>
  // </p>

  // video:
  // 
  // <p>
  //  <span class="embed-media" src="video.mp4" alt="video.mp4">
  //    <video class="embed-audio" controls src="/tests/fixtures/video.mp4"></video>
  //  </span>
  // </p>

  function exitWikiEmbed (this: CompileContext): void {
    const wikiEmbed: WikiEmbedData | undefined = (this.getData('WikiEmbedStack') as unknown as WikiEmbedData[]).pop();
    assert((wikiEmbed !== undefined), 'in exitWikiEmbed(): problem with \'WikiEmbedData\'');
    // init vars
    const filename: string | null = wikiEmbed.filename;
    assert((filename !== null), 'in exitWikiEmbed(): \'filename\' was null');
    const filenameSlug: string = filename.trim().toLowerCase().replace(/ /g, '-');//.replace(/[^\w-]+/g, '');
    const mediaExt: string = path.extname(filename).toLowerCase();
    const mime: string = path.extname(filename).replace('.', '').toLowerCase();
    // resolvers
    const htmlHref: string | undefined = opts.resolveHtmlHref(filename);
    // @ts-expect-error: check occurs in ternary operator
    const htmlText: string             = (opts.resolveHtmlText(filename) !== undefined) ? opts.resolveHtmlText(filename) : filename;
    // @ts-expect-error: check occurs in ternary operator
    const doctype : string             = (opts.resolveDocType && opts.resolveDocType(filename) !== undefined)            ? opts.resolveDocType(filename)  : '';
    ////
    // media
    // open : wikiembed
    this.tag('<p>');
    if (wikirefs.isMedia(filename)) {
      // inner
      // audio
      if (wikirefs.CONST.EXTS.AUD.has(mediaExt)) {
        this.tag(`<span class="${opts.cssNames.embedMedia}" src="${opts.baseUrl + filenameSlug}" alt="${filenameSlug}">`);
        if (!htmlHref) { 
          this.tag(`<audio class="${opts.cssNames.embedAudio}" controls type="audio/${mime}"></audio>`);
        } else {
          this.tag(`<audio class="${opts.cssNames.embedAudio}" controls type="audio/${mime}" src="${opts.baseUrl + htmlHref}"></audio>`);
        }
      // image
      } else if (wikirefs.CONST.EXTS.IMG.has(mediaExt)) {
        this.tag(`<span class="${opts.cssNames.embedMedia}" src="${opts.baseUrl + filenameSlug}" alt="${filenameSlug}">`);
        if (!htmlHref) {
          this.tag(`<img class="${opts.cssNames.embedImage}">`);
        } else {
          this.tag(`<img class="${opts.cssNames.embedImage}" src="${opts.baseUrl + htmlHref}">`);
        }
      // video
      } else if (wikirefs.CONST.EXTS.VID.has(mediaExt)) {
        this.tag(`<span class="${opts.cssNames.embedMedia}" src="${opts.baseUrl + filenameSlug}" alt="${filenameSlug}">`);
        if (!htmlHref) {
          this.tag(`<video class="${opts.cssNames.embedVideo}" controls type="video/${mime}"></video>`);
        } else {
          this.tag(`<video class="${opts.cssNames.embedVideo}" controls type="video/${mime}" src="${opts.baseUrl + htmlHref}"></video>`);
        }
      } else {
        // note: this is probably not technically possible (due to 'wikirefs.isMedia()' check)
        this.tag(`<span class="${opts.cssNames.embedMedia} ${opts.cssNames.invalid}">`);
        this.raw('media error');
      }
      // close
      this.tag('</span>');
      this.tag('</p>');
    ////
    // markdown
    } else {
      // open : wrapper
      this.tag(`<div class="${opts.cssNames.embedWrapper}">`);

      // open : title
      this.tag(`<div class="${opts.cssNames.embedTitle}">`);
      if (!htmlHref) {
        this.tag(`<a class="${opts.cssNames.wiki} ${opts.cssNames.embed} ${opts.cssNames.invalid}">`);
      } else {
        // build css string
        const cssClassArray: string[] = [];
        cssClassArray.push(opts.cssNames.wiki);
        cssClassArray.push(opts.cssNames.embed);
        // '<doctype>'
        if (doctype.length > 0) {
          const docTypeSlug: string = doctype.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
          cssClassArray.push(opts.cssNames.doctype + docTypeSlug);
        }
        const css: string = cssClassArray.join(' ');
        this.tag(`<a class="${css}" href="${opts.baseUrl + htmlHref}" data-href="${opts.baseUrl + htmlHref}">`);
      }
      // inner : title
      this.raw(htmlText);
      // close : title
      this.tag('</a>');
      this.tag('</div>');

      // open : embed link
      this.tag(`<div class="${opts.cssNames.embedLink}">`);
      if (!htmlHref) {
        this.tag(`<a class="${opts.cssNames.embedLinkIcon} ${opts.cssNames.invalid}">`);
      } else {
        this.tag(`<a class="${opts.cssNames.embedLinkIcon}" href="${opts.baseUrl + htmlHref}" data-href="${opts.baseUrl + htmlHref}">`);
      }
      // inner : embed link
      this.tag(`<i class="${opts.cssNames.linkIcon}"></i>`);
      // close : embed link
      this.tag('</a>');
      this.tag('</div>');

      // open : embed content
      this.tag(`<div class="${opts.cssNames.embedContent}">`);
      // inner : embed content
      const htmlContent: string | undefined = opts.resolveEmbedContent(filename);
      if (!htmlContent) {
        this.raw(opts.embeds.errorContent + '\'' + filename + '\'');
      } else {
        this.raw(htmlContent);
      }
      // close : embed content
      this.tag('</div>');
      // close : wrapper
      this.tag('</div>');

      // close : wikiembed
      this.tag('</p>');
    }
  }

  // util

  function top<T>(stack: T[]): T {
    return stack[stack.length - 1];
  }
}
